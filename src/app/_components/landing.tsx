"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Download, FileUp, Languages } from "lucide-react";

export function Landing() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gradient-to-b from-background to-secondary/50 md:h-[calc(100vh-56px)] md:overflow-hidden">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12 md:gap-8 md:py-6 lg:py-8 md:justify-between">
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              AI-Powered Document Translator
            </div>
            <h1 className="text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
              Translate documents effortlessly with Transpera Ai
            </h1>
            <p className="text-balance text-muted-foreground">
              Upload DOCX or PDF, choose a language, and download a polished translated version. Fast, accurate, and beautifully simple.
            </p>
            <div id="cta" className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <a href="/translator" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Start translating</Button>
              </a>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">Learn more</Button>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border bg-card p-2 shadow-sm sm:p-3">
            <div className="relative h-52 w-full sm:h-72 md:h-64 lg:h-72">
              <Image
                src="/translate.webp"
                alt="Translating documents illustration"
                fill
                sizes="(max-width: 768px) 100vw, 540px"
                className="rounded-lg object-contain"
                priority
              />
            </div>
          </div>
        </section>

        <section id="features" className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span className="text-sm font-medium">Seamless uploads</span>
            </div>
            <p className="text-sm text-muted-foreground">Drag-and-drop DOCX or PDF; we handle conversion and formatting.</p>
          </div>
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">Many languages</span>
            </div>
            <p className="text-sm text-muted-foreground">From Hindi to Arabic, translate with the tone you want.</p>
          </div>
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Instant download</span>
            </div>
            <p className="text-sm text-muted-foreground">Get a clean DOCX the moment processing completes.</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-8 md:py-4">
        <div className="mx-auto max-w-6xl px-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Transpera Ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


