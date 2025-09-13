"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

type StreamUpdate = {
  progress?: number;
  status?: string;
  apiCalls?: number;
  cached?: number;
  message?: string | null;
  summary?: string | null;
  downloadUrl?: string;
};

const LANG_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value : "Urdu", label: "Urdu" },
];

export function TranslatorUI() {
  const { data: py } = api.python.pythonBaseUrl.useQuery();
  const pythonBaseUrl = py?.baseUrl ?? "http://localhost:8000";

  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState<string>("Hindi");
  const [engine, setEngine] = useState<string>("gemini");
  const [tone, setTone] = useState<string>("professional");

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("Ready");
  const [logLine, setLogLine] = useState<string | null>(null);
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const onSelectFile = useCallback((f: File | null) => {
    setFile(f);
    setProgress(0);
    setStatus("Ready");
    setLogLine(null);
    setDownloadPath(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    const f = dt?.files?.[0];
    if (f) onSelectFile(f);
  }, [onSelectFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const canStart = useMemo(() => !!file && !isUploading, [file, isUploading]);

  const startUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setProgress(1);
    setStatus("Initializing...");
    setLogLine(null);
    setDownloadPath(null);

    const form = new FormData();
    form.append("file", file);
    form.append("targetLang", targetLang);
    form.append("engine", engine);
    form.append("tone", tone);
    form.append("pdfEngine", "pdf2docx");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${pythonBaseUrl}/translate`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        let idx;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data: StreamUpdate = JSON.parse(line);
            if (typeof data.progress === "number") setProgress(data.progress);
            if (data.status) setStatus(data.status);
            if (typeof data.message === "string") setLogLine(data.message);
            if (data.downloadUrl) {
              setDownloadPath(data.downloadUrl);
            }
          } catch (e) {
            // ignore malformed partial lines
          }
        }
      }

      const finalLine = buffer.trim();
      if (finalLine) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const data: StreamUpdate = JSON.parse(finalLine);
          if (typeof data.progress === "number") setProgress(data.progress);
          if (data.status) setStatus(data.status);
          if (typeof data.message === "string") setLogLine(data.message);
          if (data.downloadUrl) {
            setDownloadPath(data.downloadUrl);
          }
        } catch {}
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setStatus("Error");
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  }, [engine, file, pythonBaseUrl, targetLang, tone]);

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const downloadHref = useMemo(() => {
    if (!downloadPath) return null;
    const base = pythonBaseUrl.replace(/\/$/, "");
    const path = downloadPath.startsWith("/") ? downloadPath : `/${downloadPath}`;
    return `${base}${path}`;
  }, [downloadPath, pythonBaseUrl]);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>
            <h2>Upload your document</h2>
          </CardTitle>
          <CardDescription className="flex flex-row gap-2 justify-between w-full">
            <p>DOCX or PDF supported. Choose target language and options.</p>
            <div className="space-y-2">
              <Label>Target language</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="text-muted-foreground text-sm">
              {file ? (
                <span>{file.name}</span>
              ) : (
                <span>Drag & drop your file here or click to browse</span>
              )}
            </div>
            <Input
              id="file-input"
              type="file"
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              className="hidden"
              onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
            />
            <Button type="button" variant="secondary">
              Choose file
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <div className="space-y-2">
              <Label>Engine</Label>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button disabled={!canStart} onClick={startUpload}>
                {isUploading ? "Translating..." : "Translate"}
              </Button>
              {isUploading && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => abortRef.current?.abort()}
                >
                  Cancel
                </Button>
              )}
              {downloadHref && !isUploading && (
                <a href={downloadHref} target="_blank" rel="noreferrer">
                  <Button type="button" variant="default">
                    Download translated
                  </Button>
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Progress value={progress} />
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              {logLine && (
                <div className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-xs">
                  {logLine}
                </div>
              )}
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}


