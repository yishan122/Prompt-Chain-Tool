"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button onClick={handleSignOut} className="btn-secondary">
      Sign out
    </button>
  );
}