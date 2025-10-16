import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { getBucket, getSignedUrl, uploadBuffer } from "@/server/gcp/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PY_BASE = process.env.PYTHON_API_BASE ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Supports two flows:
  // A) direct file upload via form-data (legacy)
  // B) new flow: JSON body { objectName, targetLang, engine, tone, pdfEngine }
  const contentType = req.headers.get("content-type") || "";
  let upstream: Response;

  if (contentType.includes("application/json")) {
    const Body = z.object({
      objectName: z.string().min(1),
      targetLang: z.string().min(1),
      engine: z.string().default("gemini"),
      tone: z.string().default("professional"),
      pdfEngine: z.string().default("pdf2docx"),
    });
    const data = Body.parse(await req.json());

    // Download from GCS and stream to Python as multipart without storing on disk
    const bucket = getBucket();
    const file = bucket.file(data.objectName);
    const [metadata] = await file.getMetadata();
    const filename = data.objectName.split("/").pop() || "document";
    const contentTypeGuess = metadata.contentType || "application/octet-stream";

    // Build multipart/form-data body using file bytes from GCS
    const form = new FormData();
    const [bytes] = await file.download();
    const uint8 = Uint8Array.from(bytes as Iterable<number>);
    const uploadFile = new File([uint8], filename, { type: contentTypeGuess });
    form.append("file", uploadFile);
    form.append("targetLang", data.targetLang);
    form.append("engine", data.engine);
    form.append("tone", data.tone);
    form.append("pdfEngine", data.pdfEngine);

    const isPdf = filename.toLowerCase().endsWith(".pdf");
    upstream = await fetch(`${PY_BASE}/${isPdf ? "translate-pdf" : "translate"}`, {
      method: "POST",
      body: form,
    });
  } else {
    // Legacy file upload path
    const form = await req.formData();
    const isMaster = form.get("is_master");
    const file = form.get("file");
    const isPdf = file instanceof File && file.name.toLowerCase().endsWith(".pdf");
    form.delete("is_master");
    if (isMaster) {
      form.append("max_total_chars", "50000");
    }
    upstream = await fetch(`${PY_BASE}/${isPdf ? "translate-pdf" : "translate"}`, {
      method: "POST",
      body: form,
    });
  }



  if (!upstream.body) {
    return new NextResponse("Upstream had no body", { status: 502 });
  }

  // Transform the SSE stream: forward lines, hold the final line to optionally
  // fetch from Python, upload to GCS, and return a final line with public URL.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      let lastCompleteLine: string | null = null;

      function enqueueLine(line: string) {
        controller.enqueue(encoder.encode(line + "\n"));
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line) continue;
            // Keep one line buffered; emit the previous one to maintain stream
            if (lastCompleteLine != null) {
              enqueueLine(lastCompleteLine);
            }
            lastCompleteLine = line;
          }
        }

        // Process final line if present
        if (lastCompleteLine) {
          let finalObj: any = null;
          try {
            finalObj = JSON.parse(lastCompleteLine);
          } catch {
            // If not JSON, just forward
            enqueueLine(lastCompleteLine);
            controller.close();
            return;
          }

          // If python provided a download url, fetch, upload to GCS, and rewrite
          const downloadUrl: string | undefined = finalObj?.downloadUrl;
          if (downloadUrl) {
            try {
              const path = downloadUrl.startsWith("/") ? downloadUrl : `/${downloadUrl}`;
              const url = `${PY_BASE}${encodeURI(path)}`;
              const upstreamFile = await fetch(url);
              if (upstreamFile.ok) {
                const contentType =
                  upstreamFile.headers.get("content-type") ?? "application/octet-stream";
                const dispo = upstreamFile.headers.get("content-disposition") ?? "";
                const match = /filename\s*=\s*"?([^";]+)"?/i.exec(dispo || "");
                const filename = match?.[1] ?? `translated-${Date.now()}`;
                const arrayBuf = await upstreamFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuf);
                const objectName = `translated/${crypto.randomUUID()}-${filename}`;
                await uploadBuffer(objectName, buffer, contentType);
                finalObj.downloadUrl = await getSignedUrl(objectName, "read", { expiresInSeconds: 300 });
              }
            } catch {
              // Fall back to original downloadUrl on failure
            }
          }

          enqueueLine(JSON.stringify(finalObj));
        }
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();
    },
  });

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "text/event-stream",
    "cache-control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  return new NextResponse(stream, { status: 200, headers });
}


