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

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const summary = typeof (data as { summary?: unknown })?.summary === "string" ? (data as { summary: string }).summary : null;
  if (!summary) {
    return new NextResponse("Missing summary", { status: 400 });
  }

  const upstream = await fetch(`${PY_BASE}/export-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary }),
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Failed to export summary", { status: upstream.status });
  }

  const resHeaders = new Headers();
  const type = upstream.headers.get("content-type");
  const dispo = upstream.headers.get("content-disposition");
  if (type) resHeaders.set("content-type", type);
  if (dispo) resHeaders.set("content-disposition", dispo);

  return new NextResponse(upstream.body, { status: 200, headers: resHeaders });
}


