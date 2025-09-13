"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
        pathname === href && "bg-muted text-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-primary" />
          <span className="text-sm font-semibold tracking-tight">Transpera Ai</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/translator" label="Translator" />
        </nav>

        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">Hi, {session?.user?.name ?? "User"}</span>
              <Button size="sm" variant="secondary" onClick={() => signOut()}>Sign out</Button>
            </>
          ) : (
            <Link href="/signin">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


