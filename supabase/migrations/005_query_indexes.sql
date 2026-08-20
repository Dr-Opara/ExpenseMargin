-- Query indexes used by live dashboards and historical comparisons.
create index if not exists invoice_items_supplier_product_date_idx
on public.invoice_items(organization_id, supplier_id, product_id, invoice_date desc)
where product_id is not null;

create index if not exists invoices_org_created_idx
on public.invoices(organization_id, created_at desc);

create index if not exists cost_alerts_org_status_idx
on public.cost_alerts(organization_id, status, created_at desc);
