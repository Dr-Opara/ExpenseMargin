-- Add the Scale paid plan while preserving the existing Free, Business, and Pro tiers.

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free','business','pro','scale'));
