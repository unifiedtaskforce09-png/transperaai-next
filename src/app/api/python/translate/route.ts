import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PY_BASE = process.env.PYTHON_API_BASE ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  console.log("API CALLED: ", PY_BASE);

  const form = await req.formData();
  const isMaster = form.get("is_master");
  const file = form.get("file");
  const isPdf = file instanceof File && file.name.endsWith(".pdf");
  form.delete("is_master");
  form.append("max_total_chars", `${isMaster ? "50000" : null}`);
  let upstream;
  if (isPdf) {
    upstream = await fetch(`${PY_BASE}/translate-pdf`, {
    method: "POST",
    // Let undici set proper multipart headers for FormData
    body: form,
  });
  } else {
      upstream = await fetch(`${PY_BASE}/translate`, {
        method: "POST",
        // Let undici set proper multipart headers for FormData
        body: form,
      });

  }



  if (!upstream.body) {
    return new NextResponse("Upstream had no body", { status: 502 });
  }

  // Stream line-delimited JSON back to the client as-is
  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) resHeaders.set("content-type", upstreamType);
  const dispo = upstream.headers.get("content-disposition");
  if (dispo) resHeaders.set("content-disposition", dispo);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}


