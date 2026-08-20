import { createAdminClient } from "@/lib/supabase/admin";
import { processInvoice } from "@/lib/invoices/process";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data: jobs, error } = await admin.rpc("claim_invoice_jobs", { batch_size: 3 });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: Array<Record<string, unknown>> = [];
  for (const job of jobs ?? []) {
    try {
      results.push(await processInvoice(admin, job.id));
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : "Invoice processing failed";
      await admin.from("invoices").update({
        status: "failed",
        processing_started_at: null,
        error_message: message.slice(0, 1000),
      }).eq("id", job.id);
      results.push({ invoiceId: job.id, status: "failed", error: message });
    }
  }

  return Response.json({ processed: results.length, results });
}
