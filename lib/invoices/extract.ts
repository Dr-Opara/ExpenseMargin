import OpenAI from "openai";
import { extractedInvoiceSchema, type ExtractedInvoice } from "@/lib/types/invoice";

const invoiceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["supplier", "invoiceNumber", "invoiceDate", "currency", "subtotal", "fees", "tax", "total", "items"],
  properties: {
    supplier: { type: "string" },
    invoiceNumber: { anyOf: [{ type: "string" }, { type: "null" }] },
    invoiceDate: { type: "string", description: "ISO date YYYY-MM-DD" },
    currency: { type: "string", minLength: 3, maxLength: 3 },
    subtotal: { anyOf: [{ type: "number" }, { type: "null" }] },
    fees: { type: "number" },
    tax: { type: "number" },
    total: { type: "number" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sku", "description", "quantity", "unit", "normalizedQuantity", "normalizedUnit", "unitPrice", "lineTotal"],
        properties: {
          sku: { anyOf: [{ type: "string" }, { type: "null" }] },
          description: { type: "string" },
          quantity: { type: "number" },
          unit: { anyOf: [{ type: "string" }, { type: "null" }] },
          normalizedQuantity: { anyOf: [{ type: "number" }, { type: "null" }], description: "Total comparable base-unit quantity represented by this line when clearly stated or derivable from pack size, e.g. 24 each for 1 case of 24, 6 gallons for 6 x 1 gallon. Null when unclear." },
          normalizedUnit: { anyOf: [{ type: "string" }, { type: "null" }], description: "Comparable base unit such as each, gallon, pound, foot, liter, sheet, roll. Null when unclear." },
          unitPrice: { type: "number" },
          lineTotal: { type: "number" },
        },
      },
    },
  },
} as const;

export async function extractInvoiceWithOpenAI(input: {
  bytes: ArrayBuffer;
  fileName: string;
  mimeType: string;
}): Promise<ExtractedInvoice> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const openai = new OpenAI({ apiKey });
  const file = new File([input.bytes], input.fileName, { type: input.mimeType || "application/pdf" });
  const uploaded = await openai.files.create({
    file,
    purpose: "user_data",
    expires_after: { anchor: "created_at", seconds: 3600 },
  });

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_INVOICE_MODEL || "gpt-5.6-luna",
      input: [{
        role: "user",
        content: [
          { type: "input_file", file_id: uploaded.id },
          {
            type: "input_text",
            text: [
              "Extract this supplier invoice into the required schema.",
              "Preserve exact supplier product descriptions and SKUs when present.",
              "Quantity is the billed quantity, unitPrice is the stated price per billed unit, and lineTotal is the billed line total.",
              "When packaging or size is explicit, also derive normalizedQuantity as the total comparable base-unit amount represented by the line and normalizedUnit as that base unit. Example: 1 case of 24 bottles => quantity 1, normalizedQuantity 24, normalizedUnit each. 6 x 1 gallon => normalizedQuantity 6, normalizedUnit gallon. Do not infer pack size when it is not stated.",
              "Put invoice-level shipping, fuel, delivery, handling, or service charges into fees rather than product lines when clearly separate.",
              "Do not infer missing products or numbers. Return only structured data.",
            ].join(" "),
          },
        ],
      }],
      text: {
        format: {
          type: "json_schema",
          name: "expensemargin_invoice",
          strict: true,
          schema: invoiceJsonSchema,
        },
      },
    });

    if (!response.output_text) throw new Error("Invoice extraction returned no structured output");
    return extractedInvoiceSchema.parse(JSON.parse(response.output_text));
  } finally {
    await openai.files.delete(uploaded.id).catch(() => undefined);
  }
}
