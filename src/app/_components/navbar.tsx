"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
 
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
 
import { ThemeToggle } from "@/app/_components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // legacy helper removed

  const isLanding = pathname === "/";
  const headerClass = isLanding
    ? "absolute top-0 z-50 w-full bg-transparent"
    : "sticky top-0 z-40 w-full border-b backdrop-blur bg-background/70";

  // Universal header (transparent on landing)
  return (
    <header className={headerClass}>
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Transpera Ai"
            width={28}
            height={28}
            className="h-7 w-7 rounded"
            priority
          />
          <span className="text-base font-bold text-gray-900 dark:text-white">
            TRANSPERA AI
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/translator"
            className="hover:text-primary text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Translate
          </Link>
          <Link
            href="/translator"
            className="hover:text-primary text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Summarize
          </Link>
          <Link
            href="#"
            className="hover:text-primary text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Audiobooks
          </Link>
          <Link
            href="/feedback"
            className="hover:text-primary text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Feedback
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {status === "authenticated" ? (
            <>
              <span className="text-muted-foreground hidden text-sm sm:inline">
                Hi, {session?.user?.name ?? "User"}
              </span>
              <Button size="sm" variant="secondary" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button
              className="bg-primary rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              onClick={() => signIn("google", { callbackUrl: "/translator" })}
            >
              Get Started
            </Button>
          )}
          <ThemeToggle />
        </div>
        <div className="md:hidden">
          <button className="text-gray-900 dark:text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M4 12h16m-7 6h7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}


