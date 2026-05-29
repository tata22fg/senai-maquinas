import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Configurar o transportador de e-mail
// Por padrão, usa o serviço de e-mail do Manus (se disponível)
// Caso contrário, usa um transporte de teste (ethereal)
let transporter: nodemailer.Transporter | null = null;
let transporterInitialized = false;

async function initializeTransporter() {
  if (transporter && transporterInitialized) {
    return transporter;
  }

  console.log("[Email] Inicializando transportador...");

  // Tentar usar variáveis de ambiente para SMTP
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    console.log("[Email] Usando configuração SMTP customizada");
    console.log("[Email] Host:", process.env.SMTP_HOST);
    console.log("[Email] Porta:", process.env.SMTP_PORT);
    console.log("[Email] Usuário:", process.env.SMTP_USER);
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros portos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Configurações adicionais para melhor compatibilidade
      connectionTimeout: 10000,
      socketTimeout: 10000,
      logger: true,
      debug: true,
    });

    // Testar a conexão
    transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporterInitialized = true;
console.log("[Email] SMTP inicializado");
  } else {
    console.log("[Email] Usando Ethereal (modo teste)");
    // Usar transporte de teste (Ethereal) para desenvolvimento
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    transporterInitialized = true;
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Validar e-mail
    if (!options.to || !options.to.includes("@")) {
      console.error("[Email] ❌ E-mail inválido:", options.to);
      return false;
    }

    console.log("[Email] ========================================");
    console.log("[Email] Iniciando envio de e-mail");
    console.log("[Email] Para:", options.to);
    console.log("[Email] Assunto:", options.subject);
    
    const transport = await initializeTransporter();

    if (!transport) {
      console.error("[Email] ❌ Transportador não foi inicializado");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@senai-machines.local",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    };

    console.log("[Email] Configuração SMTP:", {
      host: process.env.SMTP_HOST || "ethereal.email",
      port: process.env.SMTP_PORT || "587",
      secure: process.env.SMTP_SECURE === "true",
      from: mailOptions.from,
      to: mailOptions.to,
    });

    console.log("[Email] Enviando e-mail...");
    const info = await transport.sendMail(mailOptions);

    console.log("[Email] ✅ E-mail enviado com sucesso!");
    console.log("[Email] Message ID:", info.messageId);
    console.log("[Email] Response:", info.response);

    // Se for conta de teste, exibir URL de visualização
    if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      console.log("[Email] 🔗 Visualizar e-mail (modo teste):", testUrl);
    }
    
    console.log("[Email] ========================================");
    return true;
  } catch (error) {
    console.error("[Email] ========================================");
    console.error("[Email] ❌ ERRO ao enviar e-mail:");
    console.error("[Email] Tipo de erro:", error instanceof Error ? error.name : typeof error);
    console.error("[Email] Mensagem:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("[Email] Stack:", error.stack);
    }
    console.error("[Email] ========================================");
    return false;
  }
}

export async function sendFaultReportEmail(
  recipientEmail: string,
  machineName: string,
  machineCode: string,
  faultDescription: string,
  reportedBy: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            background-color: white;
          }
          .field {
            margin-bottom: 15px;
          }
          .field-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .field-value {
            padding: 10px;
            background-color: #f5f5f5;
            border-left: 3px solid #dc2626;
            padding-left: 15px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
          }
          .timestamp {
            color: #999;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Novo Defeito Reportado</h1>
          </div>
          <div class="content">
            <p>Um novo defeito foi reportado no sistema de máquinas. Veja os detalhes abaixo:</p>
            
            <div class="field">
              <div class="field-label">Máquina</div>
              <div class="field-value">${machineName} (${machineCode})</div>
            </div>
            
            <div class="field">
              <div class="field-label">Descrição do Problema</div>
              <div class="field-value">${faultDescription.replace(/\n/g, "<br>")}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Reportado Por</div>
              <div class="field-value">${reportedBy}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Data e Hora</div>
              <div class="field-value">${new Date().toLocaleString("pt-BR")}</div>
            </div>
            
            <p style="margin-top: 20px; color: #666;">
              Por favor, verifique o sistema para mais detalhes e atualizações sobre este defeito.
            </p>
          </div>
          <div class="footer">
            <p>Sistema de Gerenciamento de Máquinas SENAI</p>
            <p class="timestamp">${new Date().toISOString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log("[Email] Preparando envio de notificação de defeito");
  console.log("[Email] Destinatário:", recipientEmail);
  console.log("[Email] Máquina:", machineName, "(" + machineCode + ")");

  const success = await sendEmail({
    to: recipientEmail,
    subject: `[ALERTA] Novo Defeito: ${machineName} (${machineCode})`,
    html: htmlContent,
  });
  
  if (!success) {
    console.warn("[Email] ⚠️ Falha ao enviar notificação de defeito para:", recipientEmail);
  } else {
    console.log("[Email] ✅ Notificação de defeito enviada com sucesso para:", recipientEmail);
  }
}
