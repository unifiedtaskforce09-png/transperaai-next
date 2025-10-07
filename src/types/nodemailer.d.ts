declare module "nodemailer" {
  export interface SentMessageInfo {
    messageId: string;
  }
  export interface TestAccount {
    user: string;
    pass: string;
  }
  export interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
  }
  export interface Transporter {
    verify(): Promise<void>;
    sendMail(mail: SendMailOptions): Promise<SentMessageInfo>;
  }
  export function createTransport(options: {
    host: string;
    port: number;
    secure?: boolean;
    auth?: { user: string; pass: string };
  }): Transporter;
  export function createTestAccount(): Promise<TestAccount>;
  export function getTestMessageUrl(info: SentMessageInfo): string | false;
  const _default: {
    createTransport: typeof createTransport;
    createTestAccount: typeof createTestAccount;
    getTestMessageUrl: typeof getTestMessageUrl;
  };
  export default _default;
}


