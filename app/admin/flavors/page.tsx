import Link from "next/link";
import { requireMatrixAdmin } from "@/lib/auth";
import { DeleteFlavorButton } from "@/components/delete-flavor-button";

export default async function FlavorsPage() {
  const { supabase } = await requireMatrixAdmin();

  const { data: flavors, error: flavorsError } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main className="space-y-6">
      <section className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="section-title text-xl">Create humor flavor</h2>
            <p className="subtle mt-1">
              Add a new flavor to manage prompt-chain steps and test captions.
            </p>
            <p className="subtle mt-2 text-xs">
              Tip: Start by creating a flavor, then click <strong>Open</strong> to
              add steps and run a test.
            </p>
          </div>

          <form action="/api/flavors" method="post" className="space-y-3">
            <input
              name="name"
              placeholder="Flavor name"
              required
              className="input"
            />
            <textarea
              name="description"
              placeholder="Description"
              className="textarea"
            />
            <div className="flex justify-end">
              <button className="btn-primary">Create</button>
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        {flavorsError && (
          <div className="card">
            <div className="card-body">
              <p className="text-red-300">
                Failed to load flavors: {flavorsError.message}
              </p>
            </div>
          </div>
        )}

        {!flavors?.length && (
          <div className="card">
            <div className="card-body">
              <p className="subtle">
                No humor flavors yet. Create your first flavor above to get
                started.
              </p>
            </div>
          </div>
        )}

        {flavors?.map((flavor) => (
          <div key={flavor.id} className="card">
            <div className="card-body flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {flavor.slug}
                </h3>
                <p className="subtle max-w-3xl">
                  {flavor.description || "No description"}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/flavors/${flavor.id}`}
                  className="btn-secondary"
                >
                  Open
                </Link>
                <form action={`/api/flavors/${flavor.id}`} method="post">
                  <input type="hidden" name="_method" value="delete" />
                  <DeleteFlavorButton />
                </form>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
