'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main
      className="page-shell"
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div className="page-container" style={{ width: "100%", maxWidth: 480 }}>
        <section className="card">
          <div className="card-body" style={{ display: "grid", gap: 16 }}>
            <div>
              <h1 className="section-title" style={{ fontSize: 36, margin: 0 }}>
                Welcome back
              </h1>
              <p className="subtle" style={{ marginTop: 8 }}>
                Sign in to manage humor flavors, prompt steps, and test runs.
              </p>
            </div>

            <button onClick={handleGoogleLogin} className="btn-primary" style={{ width: "100%" }}>
              Sign in with Google
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
