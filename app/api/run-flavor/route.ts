import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StepOutput = {
  order_by: number;
  title: string;
  prompt: string;
  output: string;
};

const API_BASE = "https://api.almostcrackd.ai";

function isSupportedImageType(type: string) {
  return [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
  ].includes(type);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  label = "fetch",
  retries = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, {
        ...init,
        cache: "no-store",
      });
      return res;
    } catch (e) {
      lastError = e;
      console.error(`${label} FETCH ERROR (attempt ${attempt}):`, e);

      if (attempt < retries) {
        await sleep(800 * attempt);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed after retries`);
}

async function getAccessToken() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new Error("No Supabase access token found. Please log in again.");
  }

  return token;
}

async function generatePresignedUrl(token: string, contentType: string) {
  console.log("STEP 1: generatePresignedUrl", { contentType });

  const res = await fetchWithRetry(
    `${API_BASE}/pipeline/generate-presigned-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType,
      }),
    },
    "STEP 1"
  );

  console.log("STEP 1 STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("STEP 1 BODY:", text);
    throw new Error(`generate-presigned-url failed: ${text}`);
  }

  const data = await res.json();
  console.log("STEP 1 OK:", data);

  return data as {
    presignedUrl: string;
    cdnUrl: string;
  };
}

async function uploadBytesToPresignedUrl(
  presignedUrl: string,
  file: File,
  contentType: string
) {
  console.log("STEP 2: uploadBytesToPresignedUrl", {
    contentType,
    size: file.size,
    name: file.name,
    presignedUrlStart: presignedUrl.slice(0, 80),
  });

  const arrayBuffer = await file.arrayBuffer();

  const res = await fetchWithRetry(
    presignedUrl,
    {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: arrayBuffer,
    },
    "STEP 2"
  );

  console.log("STEP 2 STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("STEP 2 BODY:", text);
    throw new Error(`upload to presigned url failed: ${text}`);
  }
}

async function registerImageUrl(token: string, imageUrl: string) {
  console.log("STEP 3: registerImageUrl", { imageUrl });

  const res = await fetchWithRetry(
    `${API_BASE}/pipeline/upload-image-from-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        isCommonUse: false,
      }),
    },
    "STEP 3"
  );

  console.log("STEP 3 STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("STEP 3 BODY:", text);
    throw new Error(`upload-image-from-url failed: ${text}`);
  }

  const data = await res.json();
  console.log("STEP 3 OK:", data);

  return data as {
    imageId: string;
    now: number;
  };
}

async function generateCaptions(
  token: string,
  imageId: string,
  humorFlavorId?: number
) {
  const body: Record<string, unknown> = { imageId };
  if (humorFlavorId) body.humorFlavorId = humorFlavorId;

  console.log("STEP 4: generateCaptions", body);

  const res = await fetchWithRetry(
    `${API_BASE}/pipeline/generate-captions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "STEP 4"
  );

  console.log("STEP 4 STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("STEP 4 BODY:", text);
    throw new Error(`generate-captions failed: ${text}`);
  }

  const data = await res.json();
  console.log("STEP 4 OK:", data);
  return data;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const flavorId = Number(formData.get("flavor_id"));
    const file = formData.get("image_file");

    if (!flavorId) {
      return NextResponse.json(
        { error: "Missing flavor_id" },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload an image file." },
        { status: 400 }
      );
    }

    if (!isSupportedImageType(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image type. Use jpeg, jpg, png, webp, gif, or heic.",
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: flavor, error: flavorError } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("id", flavorId)
      .single();

    if (flavorError || !flavor) {
      return NextResponse.json(
        { error: flavorError?.message ?? "Flavor not found" },
        { status: 404 }
      );
    }

    const { data: steps, error: stepsError } = await supabase
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", flavorId)
      .order("order_by", { ascending: true });

    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 });
    }

    const token = await getAccessToken();

    const { presignedUrl, cdnUrl } = await generatePresignedUrl(token, file.type);

    await uploadBytesToPresignedUrl(presignedUrl, file, file.type);

    const { imageId } = await registerImageUrl(token, cdnUrl);

    let remoteResult;
    try {
      remoteResult = await generateCaptions(token, imageId);
    } catch (e) {
      remoteResult = {
        warning: "Caption generation failed after retries. Please try again.",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    const localStepPreview: StepOutput[] = (steps ?? []).map((step) => ({
      order_by: step.order_by,
      title: step.description ?? "",
      prompt: String(step.llm_user_prompt ?? ""),
      output: "Executed via AlmostCrackd pipeline",
    }));

    return NextResponse.json({
      flavorId,
      uploadedImageUrl: cdnUrl,
      imageId,
      steps: localStepPreview,
      remoteResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}