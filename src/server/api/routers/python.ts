import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

const PY_BASE = process.env.PYTHON_API_BASE ?? process.env.NEXT_PUBLIC_PY_API_BASE ?? "http://localhost:8000";

export const pythonRouter = createTRPCRouter({
  health: publicProcedure.query(async () => {
    const res = await fetch(`${PY_BASE}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Python health failed: ${res.status}`);
    return (await res.json()) as unknown;
  }),

  clearCache: publicProcedure.mutation(async () => {
    const res = await fetch(`${PY_BASE}/clear-cache`, { method: "POST" });
    if (!res.ok) throw new Error(`Clear cache failed: ${res.status}`);
    return (await res.json()) as unknown;
  }),

  exportSummary: publicProcedure
    .input(z.object({ summary: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const res = await fetch(`${PY_BASE}/export-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: input.summary }),
      });
      if (!res.ok) throw new Error(`Export summary failed: ${res.status}`);
      const blob = await res.arrayBuffer();
      const base64 = Buffer.from(new Uint8Array(blob)).toString("base64");
      return { filename: "document_summary.docx", base64 };
    }),

  pythonBaseUrl: publicProcedure.query(() => ({ baseUrl: PY_BASE })),
});


