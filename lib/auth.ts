import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireMatrixAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, is_superadmin, is_matrix_admin')
    .eq('id', user.id)
    .single();

  const allowed = !!profile?.is_superadmin || !!profile?.is_matrix_admin;

  if (!allowed) {
    redirect('/');
  }

  return { supabase, user, profile };
}
