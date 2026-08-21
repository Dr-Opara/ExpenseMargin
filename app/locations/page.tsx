import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getOrganizationContext } from "@/lib/data/context";
import { PLANS } from "@/lib/billing/plans";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function addLocation(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const context = await getOrganizationContext();
  if (!context) redirect("/onboarding");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_location_with_plan_limit", {
    target_org: context.organizationId,
    p_name: name,
  });
  if (error) {
    const code = error.message.includes("location_limit_reached") ? "limit" : "error";
    redirect(`/locations?status=${code}`);
  }
  revalidatePath("/locations");
  revalidatePath("/dashboard");
  redirect("/locations?status=added");
}

export default async function LocationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const context = await getOrganizationContext();
  if (!context) redirect("/onboarding");
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("id,name,is_primary,created_at")
    .eq("organization_id", context.organizationId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  const params = await searchParams;
  const plan = PLANS[context.plan];
  const locationCount = locations?.length ?? 0;
  const canAdd = plan.locationLimit >= 999 || locationCount < plan.locationLimit;

  return (
    <AppShell active="Locations">
      <div className="page">
        <div className="page-head">
          <div><h1>Business locations</h1><p>Organize invoice and supplier cost intelligence by operating location.</p></div>
          <a className="btn" href="/billing">{plan.name} · {plan.locationLabel}</a>
        </div>

        {params.status === "added" && <section className="attention-bar"><div><strong>Location added</strong><span>Your dashboard location usage has been updated.</span></div></section>}
        {params.status === "limit" && <section className="attention-bar"><div><strong>Location limit reached</strong><span>Your {plan.name} plan supports {plan.locationLabel.toLowerCase()}. Upgrade to add another location.</span></div><a href="/billing" className="btn">Upgrade</a></section>}

        <section className="panel">
          <div className="panel-head"><div><h2>Your locations</h2><span className="panel-subtitle">{locationCount} active · {plan.locationLimit >= 999 ? "multi-location" : `${plan.locationLimit} allowed`}</span></div></div>
          <div className="steps" style={{marginTop:18}}>
            {(locations ?? []).map((location) => (
              <div className="step" key={location.id}>
                <span>{location.is_primary ? "Primary" : "Location"}</span>
                <h3>{location.name}</h3>
                <p>Invoices assigned to this site contribute to location-level cost history and comparisons.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h2>Add a location</h2><span className="panel-subtitle">Growth supports 2 locations. Multi-Location supports larger footprints.</span></div></div>
          {canAdd ? (
            <form action={addLocation} style={{display:"flex",gap:12,marginTop:18,alignItems:"end",flexWrap:"wrap"}}>
              <label style={{display:"grid",gap:6,flex:"1 1 280px"}}>
                <span style={{fontSize:13,fontWeight:650}}>Location name</span>
                <input name="name" required maxLength={80} placeholder="Downtown store, Katy office, Location 2..." />
              </label>
              <button className="btn primary" type="submit">Add location</button>
            </form>
          ) : (
            <div style={{marginTop:18}}>
              <p>Your current plan has reached its location limit.</p>
              <a href="/billing" className="btn primary">Upgrade plan</a>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
