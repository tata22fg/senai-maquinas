# Configuração do Gmail para Envio de E-mails

Este guia mostra como configurar o Gmail para que o sistema SENAI Machines possa enviar e-mails de notificação para **QUALQUER** endereço de e-mail cadastrado.

## Passo 1: Ativar 2FA no Gmail

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Clique em **"Segurança"** no menu lateral
3. Procure por **"Verificação em duas etapas"** e ative-a
4. Siga as instruções do Google

## Passo 2: Gerar App Password

1. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecione:
   - **Aplicativo**: Mail
   - **Dispositivo**: Windows Computer (ou seu SO)
3. Clique em **"Gerar"**
4. **Copie a senha de 16 caracteres** que será exibida

## Passo 3: Configurar o .env

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_SECURE=false
EMAIL_FROM=seu-email@gmail.com
NODE_ENV=development
```

**Importante:**
- `SMTP_USER`: Use seu e-mail completo do Gmail (ex: seu-email@gmail.com)
- `SMTP_PASS`: Cole a senha de 16 caracteres gerada no passo anterior (com os espaços)
- `EMAIL_FROM`: Use o mesmo e-mail do Gmail
- `SMTP_SECURE=false`: Deixe como false (usa TLS na porta 587)

## Passo 4: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Depois:
pnpm dev
```

## Passo 5: Testar

1. Acesse o sistema em `http://localhost:3000`
2. Vá em **"Meu Perfil"**
3. Cadastre um e-mail qualquer (pode ser seu próprio ou outro)
4. Reporte um defeito em uma máquina
5. **Verifique se o e-mail chegou** na caixa de entrada

## Verificar Logs

Quando você reportar um defeito, procure no console do servidor por mensagens como:

```
[Email] Iniciando envio para: seu-email@example.com
[Email] Configuração SMTP: { host: 'smtp.gmail.com', port: 587, ... }
[Email] ✅ E-mail enviado com sucesso: <message-id>
```

Se houver erro, você verá:

```
[Email] ❌ Erro ao enviar e-mail: [erro detalhado]
```

## Troubleshooting

### "Erro de autenticação"
- Verifique se o e-mail está correto
- Verifique se a senha de 16 caracteres foi copiada corretamente
- Certifique-se de que 2FA está ativado na conta

### "Conexão recusada"
- Verifique se `SMTP_HOST=smtp.gmail.com` está correto
- Verifique se `SMTP_PORT=587` está correto

### "E-mail não chega"
- Verifique a pasta de SPAM
- Verifique os logs do servidor para mensagens de erro
- Certifique-se de que o e-mail cadastrado é válido

## Segurança

- **Nunca** commit o arquivo `.env` no repositório
- A senha de 16 caracteres é específica para este aplicativo
- Se comprometer a senha, você pode gerar uma nova no Gmail
- O `.env` já está no `.gitignore` por padrão

## Produção

Para produção, considere usar:
- **SendGrid** - Serviço profissional de e-mail
- **Mailgun** - Alternativa ao SendGrid
- **AWS SES** - Se usar AWS

Mas para desenvolvimento e testes, o Gmail funciona perfeitamente!

---

**Pronto! Agora qualquer e-mail cadastrado receberá as notificações de defeito.** 📧
