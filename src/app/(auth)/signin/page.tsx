"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to Transpera Ai</CardTitle>
          <CardDescription>Access the translator and manage your documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button className="w-full" onClick={() => signIn("google", { callbackUrl: "/translator" })}>
            <div className="mr-2 h-4 w-4">
                <Image src="/translate.webp" alt="" width={16} height={16} />
            </div>
            Continue with Google
          </Button> 
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


