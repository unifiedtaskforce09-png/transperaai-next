import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/app/_components/navbar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { ThemeProvider } from "@/app/_components/theme-provider";

export const metadata: Metadata = {
  title: "Transpera Ai — AI Document Translator",
  description:
    "Translate DOCX and PDF into different languages.",
  icons: [{ rel: "icon", url: "/translate.webp" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${geist.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <TRPCReactProvider>
            <SessionProvider session={session}>
              <Navbar />
              {children}
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
