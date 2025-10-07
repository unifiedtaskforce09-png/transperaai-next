import { HydrateClient } from "@/trpc/server";
import { TranslatorUI } from "@/app/translator/_components/translator";
import { auth } from "@/server/auth";
import Link from "next/link";

export default async function TranslatorPage() {
  const session = await auth();
  const isAuthed = !!session?.user;
  return (
    <HydrateClient>
      <main className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-6 py-10">
        <div className="bg-gradient-radial absolute inset-0 opacity-50 dark:opacity-100" />
        <div className="absolute top-2/3 left-0 h-20 w-full opacity-30">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
            <path className="animate-wave" d="M0,50 C200,10 400,90 600,50 C800,10 1000,90 1200,50 L1200,100 L0,100 Z" fill="#8B5CF6"></path>
            <path className="animate-wave-delay" d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 L1200,100 L0,100 Z" fill="#2E8BFD"></path>
          </svg>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">

          {isAuthed ? (
            <TranslatorUI />
          ) : (
            <div className="rounded-lg border bg-white/70 p-6 backdrop-blur-md dark:bg-white/10">
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">You must be signed in to access the translator.</p>
              <Link href="/signin" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                Sign in to continue
              </Link>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}


