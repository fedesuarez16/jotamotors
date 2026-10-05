import nodemailer, { type Transporter } from "nodemailer";

let cachedTransport: Transporter | null = null;

/**
 * Transport SMTP (pensado para Gmail con contraseña de aplicación).
 * IMPORTANT: server-only — usa credenciales de .env.local.
 */
function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("SMTP_USER y SMTP_PASS deben estar definidos en .env.local");
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export interface MailAttachment {
  filename: string;
  content: Uint8Array;
  contentType: string;
  cid?: string;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
}): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await getTransport().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content),
      contentType: a.contentType,
      ...(a.cid ? { cid: a.cid } : {}),
    })),
  });
}
