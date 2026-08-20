import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveMatchReview } from "@/lib/reviews";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action === "new_product" ? "new_product" : body.action === "confirm" ? "confirm" : null;
  if (!action) return NextResponse.json({ error: "Invalid review action" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: visibleReview } = await supabase
    .from("match_reviews")
    .select("id")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();
  if (!visibleReview) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  try {
    const result = await resolveMatchReview(createAdminClient(), { reviewId: id, userId: user.id, action });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not resolve review" }, { status: 422 });
  }
}
