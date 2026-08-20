-- v1.2.0: make monthly invoice-plan enforcement atomic under concurrent uploads.

create or replace function public.create_invoice_with_plan_limit(
  target_org uuid,
  p_original_filename text,
  p_mime_type text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  effective_plan text := 'free';
  invoice_limit integer := 5;
  used_count integer := 0;
  new_invoice_id uuid;
begin
  -- Serialize uploads for a tenant so simultaneous requests cannot overrun plan limits.
  perform pg_advisory_xact_lock(hashtextextended(target_org::text, 0));

  select case
    when status in ('active', 'trialing') then plan
    else 'free'
  end
  into effective_plan
  from public.subscriptions
  where organization_id = target_org;

  effective_plan := coalesce(effective_plan, 'free');
  invoice_limit := case effective_plan
    when 'scale' then 2000
    when 'pro' then 500
    when 'business' then 100
    else 5
  end;

  select count(*)::integer
  into used_count
  from public.invoices
  where organization_id = target_org
    and created_at >= date_trunc('month', timezone('utc', now()));

  if used_count >= invoice_limit then
    raise exception 'plan_limit_reached' using errcode = 'P0001';
  end if;

  insert into public.invoices (
    organization_id,
    status,
    original_filename,
    mime_type
  ) values (
    target_org,
    'uploaded',
    p_original_filename,
    p_mime_type
  )
  returning id into new_invoice_id;

  return new_invoice_id;
end;
$$;

revoke all on function public.create_invoice_with_plan_limit(uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_invoice_with_plan_limit(uuid, text, text) to service_role;
