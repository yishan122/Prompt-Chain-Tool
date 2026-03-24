import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const method = String(formData.get("_method") ?? "").toLowerCase();

  const supabase = await createSupabaseServerClient();

  if (method === "patch") {
    const title = String(formData.get("title") ?? "").trim();
    const prompt = String(formData.get("prompt_template") ?? "").trim();

    const { data: row, error: rowError } = await supabase
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id")
      .eq("id", Number(id))
      .single();

    if (rowError || !row) {
      return NextResponse.json(
        { error: rowError?.message ?? "Step not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({
        description: title,
        llm_user_prompt: prompt,
      })
      .eq("id", Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(
      new URL(`/admin/flavors/${row.humor_flavor_id}`, request.url)
    );
  }

  if (method === "delete") {
    const { data: row, error: rowError } = await supabase
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id")
      .eq("id", Number(id))
      .single();

    if (rowError || !row) {
      return NextResponse.json(
        { error: rowError?.message ?? "Step not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("humor_flavor_steps")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(
      new URL(`/admin/flavors/${row.humor_flavor_id}`, request.url)
    );
  }

  return NextResponse.json({ error: "Unsupported method" }, { status: 400 });
}