import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const flavorId = Number(formData.get("flavor_id"));
  const title = String(formData.get("title") ?? "").trim();
  const prompt = String(formData.get("prompt_template") ?? "").trim();

  if (!flavorId || !title || !prompt) {
    return NextResponse.json(
      { error: "Missing flavor_id, title, or prompt" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: steps, error: stepsError } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: false })
    .limit(1);

  if (stepsError) {
    return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }

  const nextOrder = (steps?.[0]?.order_by ?? 0) + 1;

  const { error } = await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id: flavorId,
    order_by: nextOrder,
    description: title,
    llm_user_prompt: prompt,
    llm_system_prompt: "",
    llm_model_id: 1,
    llm_input_type_id: 1,
    llm_output_type_id: 1,
    humor_flavor_step_type_id: 3,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL(`/admin/flavors/${flavorId}`, request.url)
  );
}