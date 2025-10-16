import { NextRequest } from "next/server";
import { z } from "zod";
import { getSignedUrl } from "@/server/gcp/storage";
import { auth } from "@/server/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const objectName = searchParams.get("objectName");
  const expiresIn = searchParams.get("expiresInSeconds");
  if (!objectName)
    return new Response(JSON.stringify({ error: "objectName is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  const expiresInSeconds = expiresIn ? Number(expiresIn) : 600;
  try {
    const url = await getSignedUrl(objectName, "read", { expiresInSeconds });
    return Response.json({ url, method: "GET", objectName, expiresInSeconds });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to generate signed URL" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const BodySchema = z.object({
    objectName: z.string().min(1),
    contentType: z.string().min(1),
    expiresInSeconds: z.number().int().positive().optional(),
  });
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  const { objectName, contentType, expiresInSeconds } = parsed.data;
  try {
    const url = await getSignedUrl(objectName, "write", {
      contentType,
      expiresInSeconds: expiresInSeconds ?? 600,
    });
    return Response.json({ url, method: "PUT", objectName });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to generate signed URL" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}


