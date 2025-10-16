"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

type StreamUpdate = {
  progress?: number;
  status?: string;
  apiCalls?: number;
  cached?: number;
  message?: string | null;
  summary?: string | null;
  downloadUrl?: string;
};

// Languages organized by category for the searchable combobox

const TONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "easy_to_understand", label: "Easy to understand" },
];

const EUROPEAN_LANGS: Array<{ value: string; label: string }> = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "German", label: "German" },
  { value: "French", label: "French" },
];

const INDIC_LANGS: Array<{ value: string; label: string }> = [
  { value: "Hindi", label: "Hindi" },
  { value: "Gujarati", label: "Gujarati" },
  { value: "Urdu", label: "Urdu" },
];

const OTHER_LANGS: Array<{ value: string; label: string }> = [
  { value: "Arabic", label: "Arabic" },
];

export function TranslatorUI() {

  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState<string>("Select language");
  const [engine] = useState<string>("gemini");
  const [tone, setTone] = useState<string>("professional");
  const [langOpen, setLangOpen] = useState<boolean>(false);

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("Ready");
  const [logLine, setLogLine] = useState<string | null>(null);
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const onSelectFile = useCallback((f: File | null) => {
    setFile(f);
    setProgress(0);
    setStatus("Ready");
    setLogLine(null);
    setDownloadPath(null);
    setError(null);
    setSummary(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const dt = e.dataTransfer;
      const f = dt?.files?.[0];
      if (f) onSelectFile(f);
    },
    [onSelectFile],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const canStart = useMemo(() => !!file && !isTranslating && !isSummarizing, [file, isTranslating, isSummarizing]);

  const startUpload = useCallback(async () => {
    if (targetLang === "Select language") {
      setError("Please select a target language");
      return;
    }
    if (!file) return;
    setIsTranslating(true);
    setError(null);
    setProgress(1);
    setStatus("Requesting upload URL...");
    setLogLine(null);
    setDownloadPath(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 1) Ask backend for signed PUT URL
      const objectName = `uploads/${crypto.randomUUID()}-${file.name}`;
      const signedRes = await fetch(`/api/gcp/storage/signed-url`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ objectName, contentType: file.type, expiresInSeconds: 900 }),
        signal: controller.signal,
      });
      if (!signedRes.ok) throw new Error(`Failed to get signed URL (${signedRes.status})`);
      const { url, method } = (await signedRes.json()) as {
        url: string;
        method: string;
      };
      console.log("url", url);
      console.log("Uploading to cloud...");
      setStatus("Uploading to cloud...");
      // 2) Upload directly to GCS
      const put = await fetch(url, {
        method,
        headers: { "content-type": file.type },
        body: file,
        signal: controller.signal,
      });
      console.log("put", put);
      if (!put.ok) throw new Error(`Cloud upload failed (${put.status})`);

      // 3) Call translate with uploaded object name
      setStatus("Starting translation...");
      const res = await fetch(`/api/python/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objectName,
          targetLang,
          engine,
          tone,
          pdfEngine: "pdf2docx",
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Translate request failed (${res.status})`);
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
            const data: StreamUpdate = JSON.parse(line);
            if (typeof data.progress === "number") setProgress(data.progress);
            if (data.status) setStatus(data.status);
            if (typeof data.message === "string") setLogLine(data.message);
          if (data.downloadUrl) {
            setDownloadPath(data.downloadUrl);
          }
          } catch {
            // ignore malformed partial lines
          }
        }
      }

      const finalLine = buffer.trim();
      if (finalLine) {
        try {
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
      setIsTranslating(false);
      abortRef.current = null;
    }
  }, [engine, file, targetLang, tone]);

  // cancelUpload function not needed; using abortRef directly where needed

  const downloadHref = useMemo(() => {
    if (!downloadPath) return null;
    // If it's an absolute URL (e.g., GCS), return as-is; otherwise go through python proxy
    if (/^https?:\/\//i.test(downloadPath)) return downloadPath;
    const path = downloadPath.startsWith("/") ? downloadPath : `/${downloadPath}`;
    return `/api/python/download?path=${encodeURIComponent(path)}`;
  }, [downloadPath]);

  const startSummary = useCallback(async () => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Summary works with PDF files only");
      return;
    }
    setIsSummarizing(true);
    setError(null);
    setProgress(1);
    setStatus("Initializing summary...");
    setLogLine(null);
    setDownloadPath(null);
    setSummary(null);

    const form = new FormData();
    form.append("file", file);
    form.append("targetLang", targetLang);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/python/summarize`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Summary failed (${res.status})`);
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
            const data: StreamUpdate = JSON.parse(line);
            if (typeof data.progress === "number") setProgress(data.progress);
            if (data.status) setStatus(data.status);
            if (typeof data.message === "string") setLogLine(data.message);
            if (typeof data.summary === "string") setSummary(data.summary);
          } catch {
            // ignore malformed partial lines
          }
        }
      }

      const finalLine = buffer.trim();
      if (finalLine) {
        try {
          const data: StreamUpdate = JSON.parse(finalLine);
          if (typeof data.progress === "number") setProgress(data.progress);
          if (data.status) setStatus(data.status);
          if (typeof data.message === "string") setLogLine(data.message);
          if (typeof data.summary === "string") setSummary(data.summary);
        } catch {}
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setStatus("Error");
    } finally {
      setIsSummarizing(false);
      abortRef.current = null;
    }
  }, [file, targetLang]);

  const downloadSummary = useCallback(async () => {
    if (!summary) return;
    try {
      const res = await fetch(`/api/python/export-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const dispo = res.headers.get("content-disposition");
      let filename = "document_summary.docx";
      if (dispo) {
        const m = /filename\s*=\s*"?([^";]+)"?/i.exec(dispo);
        if (m?.[1]) filename = m[1];
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    }
  }, [summary]);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="relative rounded-2xl border-white/60 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <CardHeader className="flex flex-col gap-1 sm:gap-2">
          <CardTitle>
            <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              Upload your document
            </h2>
          </CardTitle>
          <CardDescription className="flex w-full flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-start">
            <p className="text-gray-600 dark:text-gray-300">
              DOCX or PDF supported. Choose target language and options.
            </p>
            <div className="flex flex-row flex-wrap items-start gap-4">
              <div className="space-y-2">
                <Label>Target language</Label>
                <Popover open={langOpen} onOpenChange={setLangOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={langOpen}
                      className="w-56 justify-between"
                    >
                      {targetLang || "Select language"}
                      <ChevronsUpDownIcon className="ml-2 size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <Command>
                      <CommandInput placeholder="Search language..." />
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup heading="European">
                          {EUROPEAN_LANGS.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.label}
                              onSelect={() => {
                                setTargetLang(opt.value);
                                setLangOpen(false);
                              }}
                            >
                              {opt.label}
                              {targetLang === opt.value ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : null}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Indic">
                          {INDIC_LANGS.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.label}
                              onSelect={() => {
                                setTargetLang(opt.value);
                                setLangOpen(false);
                              }}
                            >
                              {opt.label}
                              {targetLang === opt.value ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : null}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Other">
                          {OTHER_LANGS.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.label}
                              onSelect={() => {
                                setTargetLang(opt.value);
                                setLangOpen(false);
                              }}
                            >
                              {opt.label}
                              {targetLang === opt.value ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : null}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="hover:border-primary group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-400/50 bg-white/70 p-10 text-center shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5 dark:ring-white/5"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="text-muted-foreground text-sm">
              {file ? (
                <span>{file.name}</span>
              ) : (
                <span>
                  Drag & drop your file here or{" "}
                  <span className="text-primary font-semibold">
                    click to browse
                  </span>
                </span>
              )}
            </div>
            <Input
              id="file-input"
              type="file"
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              className="hidden"
              onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="secondary"
              className="transition hover:opacity-90"
            >
              Choose file
            </Button>
          </div>

          <div className="">

              <p className="my-[-20px] text-right text-sm text-gray-600 italic dark:text-gray-300">
                The content is translated using AI
              </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                disabled={!canStart}
                onClick={startUpload}
                className="bg-primary px-5"
              >
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
              {(isTranslating || isSummarizing) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => abortRef.current?.abort()}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={startSummary}
                disabled={!file || isTranslating || isSummarizing}
              >
                {isSummarizing ? "Summarizing..." : "Summary"}
              </Button>
              {summary && !isTranslating && !isSummarizing && (
                <Button
                  type="button"
                  variant="default"
                  onClick={downloadSummary}
                >
                  Download summary
                </Button>
              )}
              {downloadHref && !isTranslating && !isSummarizing && (
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
              {summary && (
                <div className="border-border bg-background prose prose-sm dark:prose-invert prose-headings:text-left prose-p:text-left prose-li:text-left prose-ul:text-left prose-ol:text-left max-w-none rounded-md border px-4 py-4 text-left text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summary}
                  </ReactMarkdown>
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
