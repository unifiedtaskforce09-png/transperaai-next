import { NextResponse } from "next/server";
import { EmailService } from "@/server/email/EmailService";
import { feedbackTemplate } from "@/server/email/templates/feedback";


export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = (body.name ?? "Anonymous").slice(0, 120);
    const email = (body.email ?? "no-email@unknown").slice(0, 200);
    const message = (body.message ?? "").slice(0, 5000);

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const html = feedbackTemplate({ name, email, message });
    const subject = `New feedback from ${name}`;

    const to = process.env.FEEDBACK_TO ?? "unified.taskforce09@gmail.com";
    const result = await EmailService.send({ to, subject, html, text: `From: ${name} <${email}>\n\n${message}` });

    return NextResponse.json({ ok: true, previewUrl: result.previewUrl });
  } catch (err) {
    console.error("/api/feedback error", err);
    const message = err instanceof Error ? err.message : "Failed to send feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


