create or replace function public.create_organization(org_name text, org_industry text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(org_name)) < 2 then raise exception 'Organization name is required'; end if;

  insert into public.organizations(name, industry)
  values (trim(org_name), nullif(trim(org_industry), ''))
  returning id into new_org_id;

  insert into public.organization_members(organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', false, 12582912, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "org members can upload invoice files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'invoices'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "org members can read invoice files"
on storage.objects for select to authenticated
using (
  bucket_id = 'invoices'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "org members can delete invoice files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'invoices'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);
