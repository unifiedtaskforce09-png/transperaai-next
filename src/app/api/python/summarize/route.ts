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

  const form = await req.formData();
  const file = form.get("file");
  const isPdf = file instanceof File && file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return new NextResponse("Only PDF files are supported for summarization", { status: 400 });
  }

  // Forward to Python summarize endpoint
  const upstream = await fetch(`${PY_BASE}/summarize-pdf`, {
    method: "POST",
    body: form,
  });

  if (!upstream.body) {
    return new NextResponse("Upstream had no body", { status: 502 });
  }

  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) resHeaders.set("content-type", upstreamType);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}


