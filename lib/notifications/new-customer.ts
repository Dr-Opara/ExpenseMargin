type NewCustomer = {
  email: string;
  fullName?: string | null;
  userId?: string | null;
  confirmedAt?: string | null;
};

const SALES_NOTIFICATION_EMAIL = "sales@expensemargin.com";

export async function notifySalesOfNewCustomer(customer: NewCustomer) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("New-customer notification skipped: RESEND_API_KEY is not configured.");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "ExpenseMargin <alerts@updates.expensemargin.com>";
  const name = customer.fullName?.trim() || "Not provided";
  const confirmedAt = customer.confirmedAt || new Date().toISOString();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SALES_NOTIFICATION_EMAIL],
      subject: `New ExpenseMargin customer signup — ${customer.email}`,
      text: [
        "A new customer has completed ExpenseMargin signup.",
        "",
        `Name: ${name}`,
        `Email: ${customer.email}`,
        `Confirmed: ${confirmedAt}`,
        customer.userId ? `User ID: ${customer.userId}` : null,
        "",
        "This notification was generated automatically by ExpenseMargin.",
      ].filter(Boolean).join("\n"),
      reply_to: customer.email,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend new-customer notification failed (${response.status}): ${body.slice(0, 500)}`);
  }
}
