import { notFound } from "next/navigation";
import { requireMatrixAdmin } from "@/lib/auth";
import { RunFlavorForm } from "@/components/run-flavor-form";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireMatrixAdmin();

  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!flavor) notFound();

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", Number(id))
    .order("order_by", { ascending: true });

  return (
    <main className="space-y-6">
      <section className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="section-title text-xl">Edit Flavor</h2>
            <p className="subtle mt-1">Update the flavor metadata.</p>
          </div>

          <form action={`/api/flavors/${id}`} method="post" className="space-y-3">
            <input type="hidden" name="_method" value="patch" />
            <input
              name="name"
              defaultValue={flavor.slug}
              required
              className="input"
            />
            <textarea
              name="description"
              defaultValue={flavor.description ?? ""}
              className="textarea"
            />
            <div className="flex justify-end">
              <button className="btn-primary">Save Flavor</button>
            </div>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="section-title text-xl">Add Step</h2>
            <p className="subtle mt-1">
              Add, edit, delete, and reorder the steps for this humor flavor.
            </p>
          </div>

          <form action="/api/steps" method="post" className="space-y-3">
            <input type="hidden" name="flavor_id" value={id} />
            <input
              name="title"
              placeholder="Step title"
              required
              className="input"
            />
            <textarea
              name="prompt_template"
              placeholder="Describe how this step should behave."
              required
              className="textarea"
            />
            <div className="flex justify-end">
              <button className="btn-primary">Add Step</button>
            </div>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="section-title text-xl">Steps</h2>
            <p className="subtle mt-1">
              Review and update the step order and prompts.
            </p>
          </div>

          <div className="space-y-4">
            {steps?.map((step, index) => (
              <div
                key={step.id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-blue-300">
                      Step {step.order_by}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {step.description}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {index > 0 && (
                      <form action="/api/reorder-step" method="post">
                        <input type="hidden" name="step_id" value={step.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button className="btn-secondary">↑ Up</button>
                      </form>
                    )}

                    {steps && index < steps.length - 1 && (
                      <form action="/api/reorder-step" method="post">
                        <input type="hidden" name="step_id" value={step.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button className="btn-secondary">↓ Down</button>
                      </form>
                    )}

                    <form action={`/api/steps/${step.id}`} method="post">
                      <input type="hidden" name="_method" value="delete" />
                      <button className="btn-danger">Delete</button>
                    </form>
                  </div>
                </div>

                <form
                  action={`/api/steps/${step.id}`}
                  method="post"
                  className="space-y-3"
                >
                  <input type="hidden" name="_method" value="patch" />
                  <input
                    name="title"
                    defaultValue={step.description ?? ""}
                    required
                    className="input"
                  />
                  <textarea
                    name="prompt_template"
                    defaultValue={step.llm_user_prompt ?? ""}
                    required
                    className="textarea"
                  />
                  <div className="flex justify-end">
                    <button className="btn-secondary">Update Step</button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="section-title text-xl">Test This Flavor</h2>
            <p className="subtle mt-1">
              Upload an image file and generate real captions through the AlmostCrackd pipeline.
            </p>
          </div>

          <RunFlavorForm flavorId={Number(id)} />
        </div>
      </section>
    </main>
  );
}