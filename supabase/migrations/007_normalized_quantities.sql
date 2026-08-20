-- Base-unit quantity normalization for case/pack-size changes and cross-invoice comparability.
alter table public.invoice_items
  add column if not exists normalized_quantity numeric(14,4),
  add column if not exists normalized_unit text;

create index if not exists invoice_items_product_normalized_quantity_idx
on public.invoice_items(organization_id, product_id, invoice_date desc)
where product_id is not null and normalized_quantity is not null;
