"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback message");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as { ok?: boolean; previewUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      toast.success("Feedback sent. Thank you!");
      if (data.previewUrl) toast.message("Preview email (dev only)", { description: data.previewUrl });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-6 py-10">
      <div className="bg-gradient-radial absolute inset-0 opacity-50 dark:opacity-100" />
      <div className="absolute top-2/3 left-0 h-20 w-full opacity-30">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
          <path className="animate-wave" d="M0,50 C200,10 400,90 600,50 C800,10 1000,90 1200,50 L1200,100 L0,100 Z" fill="#8B5CF6"></path>
          <path className="animate-wave-delay" d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 L1200,100 L0,100 Z" fill="#2E8BFD"></path>
        </svg>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        <h1 className="mb-2 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Share your feedback
        </h1>
        <p className="mx-auto mb-6 max-w-lg text-sm text-gray-600 dark:text-gray-300">
          Tell us what you think. We read every message.
        </p>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border bg-white/80 px-3 py-2 text-sm outline-none ring-1 ring-black/5 transition focus:ring-2 focus:ring-primary dark:bg-white/10 dark:ring-white/10"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border bg-white/80 px-3 py-2 text-sm outline-none ring-1 ring-black/5 transition focus:ring-2 focus:ring-primary dark:bg-white/10 dark:ring-white/10"
            />
          </div>
          <textarea
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="mt-3 w-full rounded-md border bg-white/80 px-3 py-2 text-sm outline-none ring-1 ring-black/5 transition focus:ring-2 focus:ring-primary dark:bg-white/10 dark:ring-white/10"
          />
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send feedback"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}


