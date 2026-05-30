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

  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden;">

```
<div style="background: #d60000; color: white; text-align: center; padding: 18px;">
  <h1 style="margin:0;font-size:28px;">
    ⚠️ ALERTA DE DEFEITO
  </h1>
</div>

<div style="padding: 30px;">

  <h2 style="text-align:center;font-size:38px;margin-top:0;color:#111;">
    Novo defeito reportado
  </h2>

  <div style="
    border:1px solid #dcdcdc;
    border-radius:12px;
    padding:20px;
    margin-bottom:25px;
    background:#fafafa;
  ">
    <p style="font-size:22px;margin:0 0 15px 0;">
      ⚙️ <strong>Máquina:</strong> ${machineName}
    </p>

    <hr style="border:none;border-top:1px solid #ddd;">

    <p style="font-size:22px;margin:15px 0 0 0;">
      🏷️ <strong>Código:</strong> ${machineCode}
    </p>
  </div>

  <h3 style="font-size:30px;margin-bottom:15px;">
    📝 Descrição:
  </h3>

  <div style="
    background:#fdeaea;
    border-left:6px solid #d60000;
    padding:18px;
    border-radius:8px;
    font-size:20px;
    color:#222;
  ">
    ${description}
  </div>

  <div style="text-align:center;margin-top:35px;">
    <a
      href="https://senai-maquinas-production.up.railway.app/manutencao"
      style="
        display:inline-block;
        background:#c40000;
        color:white;
        text-decoration:none;
        padding:18px 40px;
        border-radius:40px;
        font-size:24px;
        font-weight:bold;
      "
    >
      [ VISUALIZAR NO SISTEMA ]
    </a>
  </div>

  <hr style="margin:35px 0;border:none;border-top:1px solid #ddd;">

  <p style="
    text-align:center;
    color:#666;
    font-size:14px;
  ">
    Este é um e-mail automático. Por favor, não responda.
  </p>

</div>
```

  </div>
  `,
});

