import { createTransport, createTestAccount, getTestMessageUrl, type Transporter, type SendMailOptions } from "nodemailer";
 

// Reusable Email Service inspired by the provided sample, adapted for this codebase
export class EmailService {
  private static instance: EmailService | null = null;
  private transporter: Transporter;
  private fromEmail: string;

  private constructor(transporter: Transporter, fromEmail: string) {
    this.transporter = transporter;
    this.fromEmail = fromEmail;
  }

  // Build transporter using env SMTP or Ethereal fallback
  private static async build(): Promise<EmailService> {
    const from = process.env.EMAIL_FROM ?? "Transpera AI <no-reply@transpera.ai>";

    const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER ?? "";
    const pass = process.env.SMTP_PASSWORD ?? "";
    const hasSmtp = !!(host && port && user && pass);

    if (hasSmtp) {
      const transporter = createTransport({
        host,
        port,
        secure: port === 465, // only port 465 uses TLS by default
        auth: { user, pass },
      });
      try {
        await transporter.verify();
        return new EmailService(transporter, from);
      } catch {
        // fall through to Ethereal if verification fails (e.g., wrong creds or blocked)
      }
    }

    const testAccount = await createTestAccount();
    const transporter = createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return new EmailService(transporter, from);
  }

  static async getInstance(): Promise<EmailService> {
    if (!this.instance) this.instance = await this.build();
    return this.instance;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async sendEmail(options: SendMailOptions): Promise<{ messageId: string; previewUrl?: string }> {
    const mail: SendMailOptions = { from: options.from ?? this.fromEmail, ...options };
    const info = await this.transporter.sendMail(mail);
    return { messageId: info.messageId, previewUrl: getTestMessageUrl(info) || undefined };
  }

  // Convenience static helper (keeps existing API route usage working)
  static async send(options: SendMailOptions) {
    const svc = await EmailService.getInstance();
    return svc.sendEmail(options);
  }
}

export type { SendMailOptions };


