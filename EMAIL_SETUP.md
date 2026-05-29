# Configuração de E-mail - Sistema de Máquinas SENAI

Este documento descreve como configurar o envio automático de e-mails quando um defeito de máquina é reportado.

## Visão Geral

Quando um usuário reporta um defeito em uma máquina, o sistema envia automaticamente um e-mail para o endereço de e-mail do usuário conectado (administrador) com os detalhes do problema.

## Configuração

### Opção 1: Usar Gmail (Recomendado para Testes)

1. **Criar uma App Password no Gmail:**
   - Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
   - Copie a senha gerada (16 caracteres)

2. **Configurar as variáveis de ambiente:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-app-password-de-16-caracteres
   SMTP_SECURE=false
   EMAIL_FROM=seu-email@gmail.com
   ```

### Opção 2: Usar Outro Servidor SMTP

Configure as variáveis de ambiente com os dados do seu servidor SMTP:

```bash
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587  # ou 465 para SSL
SMTP_USER=seu-usuario
SMTP_PASS=sua-senha
SMTP_SECURE=false  # true se usar porta 465
EMAIL_FROM=noreply@seu-dominio.com
```

### Opção 3: Modo de Teste (Ethereal - Padrão)

Se nenhuma configuração SMTP for fornecida, o sistema usará automaticamente uma conta de teste Ethereal:

- Os e-mails não serão realmente enviados
- Um link para visualizar o e-mail será exibido no console
- Ideal para desenvolvimento e testes

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória | Padrão |
|----------|-----------|-------------|--------|
| `SMTP_HOST` | Host do servidor SMTP | Não | ethereal.email |
| `SMTP_PORT` | Porta do servidor SMTP | Não | 587 |
| `SMTP_USER` | Usuário para autenticação | Não | Gerado automaticamente |
| `SMTP_PASS` | Senha para autenticação | Não | Gerada automaticamente |
| `SMTP_SECURE` | Usar SSL/TLS (true/false) | Não | false |
| `EMAIL_FROM` | Endereço do remetente | Não | noreply@senai-machines.local |

## Como Funciona

1. **Reporte de Defeito:** Um usuário reporta um defeito em uma máquina
2. **Validação:** O sistema valida os dados do defeito
3. **Armazenamento:** O defeito é armazenado no banco de dados
4. **Envio de E-mail:** Um e-mail é enviado para o usuário conectado com:
   - Nome da máquina
   - Código da máquina
   - Descrição do problema
   - Quem reportou
   - Data e hora do reporte

## Solução de Problemas

### E-mails não estão sendo enviados

1. **Verifique as variáveis de ambiente:**
   ```bash
   echo $SMTP_HOST
   echo $SMTP_PORT
   ```

2. **Verifique os logs do servidor:**
   - Procure por mensagens de erro relacionadas a e-mail
   - Em modo de teste, verifique se há um link de visualização no console

3. **Verifique a conectividade:**
   - Certifique-se de que o servidor pode se conectar ao host SMTP
   - Verifique firewall e portas

### Erro de autenticação

1. **Gmail:** Certifique-se de usar uma App Password, não a senha da conta
2. **Outro servidor:** Verifique o usuário e senha com o provedor
3. **Verifique caracteres especiais:** Se a senha contiver caracteres especiais, coloque-a entre aspas

### E-mails indo para SPAM

1. **Configure SPF, DKIM e DMARC** no seu domínio
2. **Use um domínio real** em vez de localhost
3. **Aumente a reputação** do seu domínio

## Desenvolvimento

### Testar o envio de e-mail

Em modo de desenvolvimento, o sistema usa Ethereal por padrão:

```bash
npm run dev
# Quando um defeito for reportado, procure por:
# "Visualizar e-mail: https://ethereal.email/message/..."
```

### Logs

O sistema registra:
- Sucesso: `E-mail enviado com sucesso: [message-id]`
- Erro: `Erro ao enviar e-mail: [erro]`
- URL de visualização (teste): `Visualizar e-mail: [url]`

## Segurança

- **Nunca** commit de credenciais no repositório
- Use variáveis de ambiente para todas as credenciais
- Em produção, use um serviço de e-mail dedicado (SendGrid, Mailgun, etc.)
- Considere usar senhas de aplicação em vez de senhas de conta

## Referências

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Configuration](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)
