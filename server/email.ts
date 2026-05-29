import { Resend } from "resend";
import { ENV } from "./_core/env";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!options.to || !options.to.includes("@")) {
      console.error("[Email] ❌ E-mail inválido:", options.to);
      return false;
    }

    console.log("[Email] ========================================");
    console.log("[Email] Iniciando envio de e-mail");
    console.log("[Email] Para:", options.to);
    console.log("[Email] Assunto:", options.subject);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("[Email] ✅ E-mail enviado com sucesso!");
    console.log("[Email] ========================================");

    return true;
  } catch (error) {
    console.error("[Email] ========================================");
    console.error("[Email] ❌ ERRO ao enviar e-mail:");
    console.error(error);
    console.error("[Email] ========================================");

    return false;
  }
}