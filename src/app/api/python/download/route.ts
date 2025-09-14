import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PY_BASE = process.env.PYTHON_API_BASE ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return new NextResponse("Missing path", { status: 400 });

  const url = `${PY_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Failed to fetch file", { status: upstream.status });
  }

  const resHeaders = new Headers();
  const type = upstream.headers.get("content-type");
  const dispo = upstream.headers.get("content-disposition");
  if (type) resHeaders.set("content-type", type);
  if (dispo) resHeaders.set("content-disposition", dispo);

  return new NextResponse(upstream.body, { status: 200, headers: resHeaders });
}


