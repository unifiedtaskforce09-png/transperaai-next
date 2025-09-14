"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

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
    <header className="bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/translate.webp" alt="Transpera Ai" width={20} height={20} className="bg-primary h-5 w-5 rounded" />
          <span className="text-sm font-semibold tracking-tight">
            Transpera Ai
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/" label="Home" />
          {status === "authenticated" ? (
            <NavLink href="/translator" label="Translator" />
          ) : (
            <NavLink href="/signin" label="Translator" />
          )}
        </nav>

        <div className="flex items-center gap-2">
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
            <Link href="/signin">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


