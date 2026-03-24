"use client";

import { useState } from "react";

type RemoteCaption = {
  id: string;
  content: string;
};

type StepPreview = {
  order_by: number;
  title: string;
  prompt: string;
  output: string;
};

type RunFlavorResponse = {
  flavorId?: number;
  uploadedImageUrl?: string;
  imageId?: string;
  steps?: StepPreview[];
  remoteResult?:
    | RemoteCaption[]
    | {
        warning?: string;
        error?: string;
      };
  error?: string;
};

export function RunFlavorForm({ flavorId }: { flavorId: number }) {
  const [result, setResult] = useState<RunFlavorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch("/api/run-flavor", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as RunFlavorResponse;
      setResult(data);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  const remoteCaptions = Array.isArray(result?.remoteResult)
    ? result.remoteResult
    : null;

  const remoteWarning =
    result?.remoteResult && !Array.isArray(result.remoteResult)
      ? result.remoteResult
      : null;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-3"
      >
        <input type="hidden" name="flavor_id" value={flavorId} />

        <input
          type="file"
          name="image_file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          required
          className="input"
        />

        <div className="flex justify-end">
          <button className="btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Captions"}
          </button>
        </div>
      </form>

      {result?.error && (
        <div className="card">
          <div className="card-body">
            <div className="text-red-300 font-medium">Error</div>
            <div className="subtle mt-2">{result.error}</div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="space-y-4">
          {(result.uploadedImageUrl || result.imageId) && (
            <div className="card">
              <div className="card-body space-y-2">
                <h3 className="section-title text-xl">Pipeline Result</h3>
                {result.uploadedImageUrl && (
                  <div className="subtle">
                    Uploaded Image URL: {result.uploadedImageUrl}
                  </div>
                )}
                {result.imageId && (
                  <div className="subtle">Image ID: {result.imageId}</div>
                )}
              </div>
            </div>
          )}

          {remoteWarning && (
            <div className="card">
              <div className="card-body space-y-2">
                <h3 className="section-title text-xl">Caption Status</h3>
                {remoteWarning.warning && (
                  <div className="text-yellow-300">{remoteWarning.warning}</div>
                )}
                {remoteWarning.error && (
                  <div className="subtle">{remoteWarning.error}</div>
                )}
              </div>
            </div>
          )}

          {remoteCaptions && (
            <div className="card">
              <div className="card-body space-y-4">
                <h3 className="section-title text-xl">Generated Captions</h3>

                <div className="grid gap-3">
                  {remoteCaptions.map((caption, index) => (
                    <div
                      key={caption.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                    >
                      <div className="text-xs uppercase tracking-wide text-blue-300 mb-2">
                        Caption {index + 1}
                      </div>
                      <div className="text-white text-base leading-7">
                        {caption.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result.steps && result.steps.length > 0 && (
            <div className="card">
              <div className="card-body space-y-4">
                <h3 className="section-title text-xl">Local Step Preview</h3>

                <div className="space-y-3">
                  {result.steps.map((step) => (
                    <div
                      key={step.order_by}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                    >
                      <div className="text-blue-300 text-sm mb-2">
                        Step {step.order_by}
                      </div>
                      <div className="text-white font-semibold">
                        {step.title}
                      </div>
                      <div className="subtle mt-2 whitespace-pre-wrap">
                        {step.prompt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}