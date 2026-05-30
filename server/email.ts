import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  options: EmailOptions,
): Promise<boolean> {
  try {
    if (!options.to || !options.to.includes("@")) {
      console.error("[Email] E-mail inválido:", options.to);
      return false;
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("[Email] E-mail enviado com sucesso");
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar e-mail:", error);
    return false;
  }
}

export async function sendFaultReportEmail(
  to: string,
  machineName: string,
  machineCode: string,
  description: string,
  reportedBy: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `[ALERTA] Novo Defeito: ${machineName} (${machineCode})`,
    html: `
      <h2>Novo defeito reportado</h2>
      <p><strong>Máquina:</strong> ${machineName}</p>
      <p><strong>Código:</strong> ${machineCode}</p>
      <p><strong>Reportado por:</strong> ${reportedBy}</p>
      <p><strong>Descrição:</strong></p>
      <p>${description}</p>
    `,
  });
}