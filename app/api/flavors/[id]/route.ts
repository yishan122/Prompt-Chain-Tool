import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function makeUniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  baseName: string,
  currentId: string
) {
  const baseSlug = slugify(baseName) || "flavor";

  const { data: existing, error } = await supabase
    .from("humor_flavors")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(error.message);
  }

  const used = new Set(
    (existing ?? [])
      .filter((row) => String(row.id) !== currentId)
      .map((row) => row.slug)
  );

  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let i = 2;
  while (used.has(`${baseSlug}-${i}`)) {
    i++;
  }

  return `${baseSlug}-${i}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const method = String(formData.get("_method") ?? "").toLowerCase();

  const supabase = await createSupabaseServerClient();

  if (method === "duplicate") {
    const { data: sourceFlavor, error: sourceFlavorError } = await supabase
      .from("humor_flavors")
      .select("id, slug, description")
      .eq("id", id)
      .single();

    if (sourceFlavorError || !sourceFlavor) {
      return NextResponse.json(
        { error: sourceFlavorError?.message ?? "Flavor not found" },
        { status: 404 }
      );
    }

    const duplicatedSlug = await makeUniqueSlug(
      supabase,
      `${sourceFlavor.slug} copy`,
      ""
    );

    const { data: newFlavor, error: newFlavorError } = await supabase
      .from("humor_flavors")
      .insert({
        slug: duplicatedSlug,
        description: sourceFlavor.description,
      })
      .select("id")
      .single();

    if (newFlavorError || !newFlavor) {
      return NextResponse.json(
        { error: newFlavorError?.message ?? "Failed to create duplicate" },
        { status: 500 }
      );
    }

    const { data: sourceSteps, error: sourceStepsError } = await supabase
      .from("humor_flavor_steps")
      .select(
        "order_by, description, llm_user_prompt, llm_system_prompt, llm_model_id, llm_input_type_id, llm_output_type_id, humor_flavor_step_type_id"
      )
      .eq("humor_flavor_id", id)
      .order("order_by", { ascending: true });

    if (sourceStepsError) {
      return NextResponse.json(
        { error: sourceStepsError.message },
        { status: 500 }
      );
    }

    if (sourceSteps && sourceSteps.length > 0) {
      const copiedSteps = sourceSteps.map((step) => ({
        humor_flavor_id: newFlavor.id,
        order_by: step.order_by,
        description: step.description,
        llm_user_prompt: step.llm_user_prompt,
        llm_system_prompt: step.llm_system_prompt,
        llm_model_id: step.llm_model_id,
        llm_input_type_id: step.llm_input_type_id,
        llm_output_type_id: step.llm_output_type_id,
        humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      }));

      const { error: copiedStepsError } = await supabase
        .from("humor_flavor_steps")
        .insert(copiedSteps);

      if (copiedStepsError) {
        return NextResponse.json({ error: copiedStepsError.message }, { status: 500 });
      }
    }

    return NextResponse.redirect(
      new URL(`/admin/flavors/${newFlavor.id}`, request.url)
    );
  }

  if (method === "patch") {
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Flavor name is required" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueSlug(supabase, name, id);

    const { error } = await supabase
      .from("humor_flavors")
      .update({
        slug,
        description,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL(`/admin/flavors/${id}`, request.url));
  }

  if (method === "delete") {
    const { error } = await supabase.from("humor_flavors").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/admin/flavors", request.url));
  }

  return NextResponse.json({ error: "Unsupported method" }, { status: 400 });
}
