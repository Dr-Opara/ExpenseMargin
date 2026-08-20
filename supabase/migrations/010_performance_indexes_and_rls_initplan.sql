-- Cover foreign keys used by deletes, joins, and relationship lookups.
create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
create index if not exists invoices_supplier_id_idx on public.invoices(supplier_id) where supplier_id is not null;
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists invoice_items_supplier_id_idx on public.invoice_items(supplier_id) where supplier_id is not null;
create index if not exists invoice_items_product_id_idx on public.invoice_items(product_id) where product_id is not null;
create index if not exists cost_alerts_supplier_id_idx on public.cost_alerts(supplier_id) where supplier_id is not null;
create index if not exists cost_alerts_product_id_idx on public.cost_alerts(product_id) where product_id is not null;
create index if not exists cost_alerts_invoice_id_idx on public.cost_alerts(invoice_id) where invoice_id is not null;
create index if not exists product_aliases_supplier_id_idx on public.product_aliases(supplier_id);
create index if not exists product_aliases_product_id_idx on public.product_aliases(product_id);
create index if not exists match_reviews_invoice_id_idx on public.match_reviews(invoice_id);
create index if not exists match_reviews_supplier_id_idx on public.match_reviews(supplier_id);
create index if not exists match_reviews_candidate_product_id_idx on public.match_reviews(candidate_product_id) where candidate_product_id is not null;
create index if not exists match_reviews_resolved_by_idx on public.match_reviews(resolved_by) where resolved_by is not null;

-- Avoid per-row auth.uid() re-evaluation in the membership policy.
drop policy if exists "members can read memberships" on public.organization_members;
create policy "members can read memberships"
on public.organization_members for select to authenticated
using (user_id = (select auth.uid()) or private.is_org_member(organization_id));
