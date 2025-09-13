import { HydrateClient } from "@/trpc/server";
import { TranslatorUI } from "@/app/translator/_components/translator";
import { auth } from "@/server/auth";
import Link from "next/link";

export default async function TranslatorPage() {
  const session = await auth();
  const isAuthed = !!session?.user;
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col gap-8 px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Translator</h1>
          <p className="mb-6 text-sm text-muted-foreground">Upload, translate, and download your document.</p>
          {isAuthed ? (
            <TranslatorUI />
          ) : (
            <div className="rounded-lg border p-6">
              <p className="mb-3 text-sm text-muted-foreground">You must be signed in to access the translator.</p>
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


