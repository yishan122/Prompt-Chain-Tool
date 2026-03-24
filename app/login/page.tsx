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
    <main className="page" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="card stack" style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ margin: 0 }}>Login</h1>
        <button onClick={handleGoogleLogin} className="btn">
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
