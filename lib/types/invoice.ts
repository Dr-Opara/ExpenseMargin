import { z } from "zod";

export const invoiceLineSchema = z.object({
  sku: z.string().nullable().default(null),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().nullable().default(null),
  normalizedQuantity: z.number().positive().nullable().default(null),
  normalizedUnit: z.string().nullable().default(null),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
});

export const extractedInvoiceSchema = z.object({
  supplier: z.string().min(1),
  invoiceNumber: z.string().nullable().default(null),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invoiceDate must be YYYY-MM-DD"),
  currency: z.string().length(3).default("USD"),
  subtotal: z.number().nonnegative().nullable().default(null),
  fees: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  items: z.array(invoiceLineSchema).min(1),
});

export type ExtractedInvoice = z.infer<typeof extractedInvoiceSchema>;
