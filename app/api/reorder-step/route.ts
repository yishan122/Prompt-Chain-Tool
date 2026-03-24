import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const stepId = Number(formData.get("step_id"));
  const direction = String(formData.get("direction") ?? "");

  if (!stepId || !direction) {
    return NextResponse.json(
      { error: "Missing step_id or direction" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: current, error: currentError } = await supabase
    .from("humor_flavor_steps")
    .select("id, humor_flavor_id, order_by")
    .eq("id", stepId)
    .single();

  if (currentError || !current) {
    return NextResponse.json(
      { error: currentError?.message ?? "Step not found" },
      { status: 404 }
    );
  }

  const targetOrder =
    direction === "up" ? current.order_by - 1 : current.order_by + 1;

  const { data: target, error: targetError } = await supabase
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", current.humor_flavor_id)
    .eq("order_by", targetOrder)
    .single();

  if (targetError || !target) {
    return NextResponse.redirect(
      new URL(`/admin/flavors/${current.humor_flavor_id}`, request.url)
    );
  }

  const { error: err1 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: -9999 })
    .eq("id", current.id);

  if (err1) {
    return NextResponse.json({ error: err1.message }, { status: 500 });
  }

  const { error: err2 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: current.order_by })
    .eq("id", target.id);

  if (err2) {
    return NextResponse.json({ error: err2.message }, { status: 500 });
  }

  const { error: err3 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: target.order_by })
    .eq("id", current.id);

  if (err3) {
    return NextResponse.json({ error: err3.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/admin/flavors/${current.humor_flavor_id}`, request.url)
  );
}