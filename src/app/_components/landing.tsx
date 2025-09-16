"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Download, FileUp, Languages } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Landing() {
  const { data: session, status } = useSession();
  const router = useRouter();
  return (
    <div className="from-background to-secondary/50 flex min-h-[calc(100vh-56px)] flex-col bg-gradient-to-b md:h-[calc(100vh-56px)] md:overflow-hidden">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12 md:justify-between md:gap-8 md:py-6 lg:py-8">
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <div className="text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              AI-Powered Document Translator
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
              Translate documents effortlessly with Transpera Ai
            </h1>
            <p className="text-muted-foreground text-balance">
              Upload DOCX or PDF, choose a language, and download a polished
              translated version. Fast, accurate, and beautifully simple.
            </p>
            <div
              id="cta"
              className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <a
                
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={async () =>{
                    if( status !== "authenticated" ) {
                      await signIn("google", { callbackUrl: "/translator" });
                    }else{
                      router.push("/translator");
                    }
                  }}
                      
                  
                  className="w-full sm:w-auto"
                >
                  Start translating
                </Button>
              </a>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Learn more
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-card relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border p-2 shadow-sm sm:p-3">
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

        <section
          id="features"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        >
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span className="text-sm font-medium">Seamless uploads</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Drag-and-drop DOCX or PDF; we handle conversion and formatting.
            </p>
          </div>
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">Many languages</span>
            </div>
            <p className="text-muted-foreground text-sm">
              From Hindi to Arabic, translate with the tone you want.
            </p>
          </div>
          <div className="rounded-lg border p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Instant download</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Get a clean DOCX the moment processing completes.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-8 md:py-4">
        <div className="text-muted-foreground mx-auto max-w-6xl px-6 text-xs">
          © {new Date().getFullYear()} Transpera Ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


