"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  const [targetLang, setTargetLang] = useState<string>("Hindi");
  const [engine] = useState<string>("gemini");
  const [tone, setTone] = useState<string>("professional");
  const [langOpen, setLangOpen] = useState<boolean>(false);

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
      const res = await fetch(`api/python/translate`, {
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
          } catch {
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
  }, [engine, file, targetLang, tone]);

  // cancelUpload function not needed; using abortRef directly where needed

  const downloadHref = useMemo(() => {
    if (!downloadPath) return null;
    const path = downloadPath.startsWith("/") ? downloadPath : `/${downloadPath}`;
    return `/api/python/download?path=${encodeURIComponent(path)}`;
  }, [downloadPath]);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="relative rounded-2xl border-white/60 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <CardHeader className="flex flex-col gap-1 sm:gap-2">
          <CardTitle>
            <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
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
            className="hover:border-primary group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-400/50 bg-white/70 p-10 text-center shadow-sm ring-1 ring-black/5 transition-colors backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:ring-white/5"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="text-muted-foreground text-sm">
              {file ? (
                <span>{file.name}</span>
              ) : (
                <span>
                  Drag & drop your file here or <span className="font-semibold text-primary">click to browse</span>
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
            <Button type="button" variant="secondary" className="transition hover:opacity-90">
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
              <Button disabled={!canStart} onClick={startUpload} className="bg-primary px-5">
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
              <Button
                variant="secondary"
                
              >
                Summary
              </Button>
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
