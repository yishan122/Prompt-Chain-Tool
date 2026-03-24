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
  baseName: string
) {
  const baseSlug = slugify(baseName) || "flavor";

  const { data: existing, error } = await supabase
    .from("humor_flavors")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(error.message);
  }

  const used = new Set((existing ?? []).map((row) => row.slug));

  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let i = 2;
  while (used.has(`${baseSlug}-${i}`)) {
    i++;
  }

  return `${baseSlug}-${i}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Flavor name is required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const slug = await makeUniqueSlug(supabase, name);

  const { error } = await supabase.from("humor_flavors").insert({
    slug,
    description: description || name,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin/flavors", request.url));
}