import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      className="page-shell"
      style={{ display: "flex", alignItems: "center" }}
    >
      <div className="page-container" style={{ width: "100%" }}>
        <section className="card" style={{ maxWidth: 900 }}>
          <div className="card-body" style={{ display: "grid", gap: 16 }}>
            <div>
              <h1 className="section-title">Week 8 Prompt Chain Tool</h1>
              <p className="subtle" style={{ marginTop: 8 }}>
                Manage humor flavors, steps, and test caption generation.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {user ? (
                <Link href="/admin/flavors" className="btn-primary">
                  Go to Admin
                </Link>
              ) : (
                <Link href="/login" className="btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}