create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function private.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  );
$$;

revoke all on function private.is_org_member(uuid) from public, anon;
grant execute on function private.is_org_member(uuid) to authenticated;
revoke all on function private.is_org_admin(uuid) from public, anon;
grant execute on function private.is_org_admin(uuid) to authenticated;

drop policy if exists "members can read organizations" on public.organizations;
create policy "members can read organizations" on public.organizations for select to authenticated using (private.is_org_member(id));

drop policy if exists "admins update organizations" on public.organizations;
create policy "admins update organizations" on public.organizations for update to authenticated using (private.is_org_admin(id)) with check (private.is_org_admin(id));

drop policy if exists "members can read memberships" on public.organization_members;
create policy "members can read memberships" on public.organization_members for select to authenticated using (user_id = auth.uid() or private.is_org_member(organization_id));

drop policy if exists "members manage suppliers" on public.suppliers;
create policy "members manage suppliers" on public.suppliers for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage products" on public.products;
create policy "members manage products" on public.products for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage invoices" on public.invoices;
create policy "members manage invoices" on public.invoices for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage invoice items" on public.invoice_items;
create policy "members manage invoice items" on public.invoice_items for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage alerts" on public.cost_alerts;
create policy "members manage alerts" on public.cost_alerts for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage product aliases" on public.product_aliases;
create policy "members manage product aliases" on public.product_aliases for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members manage match reviews" on public.match_reviews;
create policy "members manage match reviews" on public.match_reviews for all to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

drop policy if exists "members read subscriptions" on public.subscriptions;
create policy "members read subscriptions" on public.subscriptions for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "org members can upload invoice files" on storage.objects;
create policy "org members can upload invoice files" on storage.objects for insert to authenticated
with check (bucket_id = 'invoices' and private.is_org_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "org members can read invoice files" on storage.objects;
create policy "org members can read invoice files" on storage.objects for select to authenticated
using (bucket_id = 'invoices' and private.is_org_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "org members can delete invoice files" on storage.objects;
create policy "org members can delete invoice files" on storage.objects for delete to authenticated
using (bucket_id = 'invoices' and private.is_org_member(((storage.foldername(name))[1])::uuid));

drop function if exists public.is_org_member(uuid);
drop function if exists public.is_org_admin(uuid);
