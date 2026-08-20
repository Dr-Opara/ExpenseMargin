-- Billing bootstrap and an atomic single-invoice worker claim.

create or replace function public.create_organization(org_name text, org_industry text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  user_email text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(org_name)) < 2 then raise exception 'Organization name is required'; end if;

  user_email := nullif(auth.jwt() ->> 'email', '');

  insert into public.organizations(name, industry, notification_email)
  values (trim(org_name), nullif(trim(org_industry), ''), user_email)
  returning id into new_org_id;

  insert into public.organization_members(organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  insert into public.subscriptions(organization_id, plan, status)
  values (new_org_id, 'free', 'inactive')
  on conflict (organization_id) do nothing;

  return new_org_id;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;

create or replace function public.claim_invoice_job(job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean := false;
begin
  update public.invoices
  set status = 'processing',
      processing_started_at = now(),
      attempt_count = attempt_count + 1,
      error_message = null
  where id = job_id
    and attempt_count < 3
    and (
      status in ('queued','failed')
      or (status = 'processing' and processing_started_at < now() - interval '15 minutes')
    );

  claimed := found;
  return claimed;
end;
$$;

revoke all on function public.claim_invoice_job(uuid) from public, anon, authenticated;
grant execute on function public.claim_invoice_job(uuid) to service_role;
