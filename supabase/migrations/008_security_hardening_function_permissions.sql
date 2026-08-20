-- Harden SECURITY DEFINER function permissions.
-- Onboarding is intentionally callable by authenticated users only.
revoke all on function public.create_organization(text, text) from public, anon;
grant execute on function public.create_organization(text, text) to authenticated;

-- Tenant membership helpers are used by RLS policies; anonymous callers should not invoke them directly.
revoke all on function public.is_org_member(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;

revoke all on function public.is_org_admin(uuid) from public, anon;
grant execute on function public.is_org_admin(uuid) to authenticated;

-- Ensure background-worker claim functions remain service-role only.
revoke all on function public.claim_invoice_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_invoice_jobs(integer) to service_role;

revoke all on function public.claim_invoice_job(uuid) from public, anon, authenticated;
grant execute on function public.claim_invoice_job(uuid) to service_role;
