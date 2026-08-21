-- Support the new four-tier paid pricing model while preserving legacy plan ids.

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free','business','pro','scale','scale_plus'));
