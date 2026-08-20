import type { SupabaseClient } from "@supabase/supabase-js";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char] || char);
}

function money(value: number, currency = "USD") {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value); }
  catch { return `$${value.toFixed(2)}`; }
}

async function logDelivery(admin: SupabaseClient, input: {
  organizationId: string;
  invoiceId: string;
  recipient?: string | null;
  status: "sent" | "skipped" | "failed";
  providerMessageId?: string | null;
  error?: string | null;
}) {
  await admin.from("notification_deliveries").insert({
    organization_id: input.organizationId,
    invoice_id: input.invoiceId,
    channel: "email",
    notification_type: "cost_alert_summary",
    recipient: input.recipient || null,
    provider_message_id: input.providerMessageId || null,
    status: input.status,
    error_message: input.error ? input.error.slice(0, 1000) : null,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
  }).then(() => undefined, () => undefined);
}

export async function sendInvoiceAlertSummary(admin: SupabaseClient, invoiceId: string) {
  const { data: invoice } = await admin
    .from("invoices")
    .select("id,organization_id,notification_sent_at,currency,suppliers(name)")
    .eq("id", invoiceId)
    .single();
  if (!invoice || invoice.notification_sent_at) return { sent: false, reason: "already_sent_or_missing" } as const;

  const [{ data: organization }, { data: alerts }] = await Promise.all([
    admin.from("organizations").select("name,notification_email,notify_cost_alerts").eq("id", invoice.organization_id).single(),
    admin
      .from("cost_alerts")
      .select("percent_change,estimated_annual_impact,previous_unit_cost,current_unit_cost,products(normalized_name)")
      .eq("invoice_id", invoiceId)
      .neq("status", "dismissed")
      .order("estimated_annual_impact", { ascending: false }),
  ]);

  const email = organization?.notification_email;
  if (organization?.notify_cost_alerts === false) {
    await logDelivery(admin, { organizationId: invoice.organization_id, invoiceId, recipient: email, status: "skipped", error: "Cost alert emails disabled" });
    return { sent: false, reason: "notifications_disabled" } as const;
  }
  if (!email || !alerts?.length) {
    await logDelivery(admin, { organizationId: invoice.organization_id, invoiceId, recipient: email, status: "skipped", error: !email ? "No notification recipient" : "No cost alerts" });
    return { sent: false, reason: "no_alerts_or_recipient" } as const;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    await logDelivery(admin, { organizationId: invoice.organization_id, invoiceId, recipient: email, status: "skipped", error: "Resend is not configured" });
    return { sent: false, reason: "resend_not_configured" } as const;
  }

  const currency = invoice.currency || "USD";
  const totalImpact = alerts.reduce((sum: number, alert: any) => sum + Number(alert.estimated_annual_impact ?? 0), 0);
  const rows = alerts.slice(0, 10).map((alert: any) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml(alert.products?.normalized_name ?? "Item")}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb">${money(Number(alert.previous_unit_cost), currency)} → ${money(Number(alert.current_unit_cost), currency)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#b91c1c;font-weight:700">+${Number(alert.percent_change).toFixed(1)}%</td>
    </tr>`).join("");

  const supplierName = (invoice as any).suppliers?.name ?? "a supplier";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111827">
      <h1 style="font-size:24px">ExpenseMargin found ${alerts.length} cost increase${alerts.length === 1 ? "" : "s"}</h1>
      <p>New pricing from <strong>${escapeHtml(supplierName)}</strong> could add approximately <strong>${money(totalImpact, currency)}/year</strong> if current purchase quantities repeat monthly.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0"><tbody>${rows}</tbody></table>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/alerts" style="display:inline-block;background:#172554;color:white;padding:11px 16px;border-radius:9px;text-decoration:none">Review cost changes</a></p>
      <p style="font-size:12px;color:#6b7280">ExpenseMargin estimates are decision-support information. Verify supplier terms before making purchasing decisions.</p>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `expensemargin-invoice-${invoiceId}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${alerts.length} supplier cost increase${alerts.length === 1 ? "" : "s"} detected`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const message = `Resend delivery failed (${response.status}): ${detail.slice(0, 240)}`;
    await logDelivery(admin, { organizationId: invoice.organization_id, invoiceId, recipient: email, status: "failed", error: message });
    throw new Error(message);
  }

  const payload = await response.json().catch(() => ({}));
  const providerMessageId = typeof payload?.id === "string" ? payload.id : null;
  await Promise.all([
    admin.from("invoices").update({ notification_sent_at: new Date().toISOString() }).eq("id", invoiceId),
    logDelivery(admin, { organizationId: invoice.organization_id, invoiceId, recipient: email, status: "sent", providerMessageId }),
  ]);
  return { sent: true } as const;
}
