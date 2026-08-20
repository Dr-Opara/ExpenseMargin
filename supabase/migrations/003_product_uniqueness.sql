create unique index if not exists products_org_normalized_name_uidx
on public.products(organization_id, normalized_name);
