import Link from "next/link";
import { requireMatrixAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireMatrixAdmin();

  return (
    <div className="page-shell">
      <div className="page-container">
        <header className="card">
          <div className="card-body flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="section-title">Prompt Chain Admin</h1>
              <p className="subtle mt-1">{profile?.email ?? "Admin"}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/flavors" className="link">
                Flavors
              </Link>
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}