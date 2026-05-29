# Troubleshooting de E-mail - SENAI Machines

## ❓ "O e-mail não chegou em desenvolvimento local"

### Causa Comum
Em desenvolvimento local, pode haver bloqueios de firewall ou problemas de conectividade com o servidor SMTP.

### Solução
1. **Verifique os logs do servidor** - Procure por `[Email]` no console
2. **Teste a conexão SMTP** - O sistema testa automaticamente e mostra se conectou
3. **Use Ethereal para testes** - Se não configurar SMTP, usa modo teste (sem enviar e-mail real)

---

## ✅ "O e-mail chegará quando o site estiver online?"

**SIM!** Quando o site estiver em produção (online), o e-mail **DEVE chegar** porque:

1. **Servidor em produção tem acesso à internet** - Consegue conectar ao Gmail SMTP
2. **Não há bloqueios locais** - Firewall local não interfere
3. **Credenciais estão corretas** - Se funcionou em testes, funciona em produção

### Importante para Produção
Certifique-se de que:
- ✅ As variáveis de ambiente estão configuradas no servidor
- ✅ O `.env` está preenchido corretamente
- ✅ A App Password do Gmail foi gerada corretamente
- ✅ 2FA está ativado na conta Gmail

---

## 🔍 Verificar se o E-mail Foi Enviado

### No Console do Servidor

Quando você reporta um defeito, procure por mensagens como:

```
[Email] ========================================
[Email] Iniciando envio de e-mail
[Email] Para: seu-email@example.com
[Email] Assunto: [ALERTA] Novo Defeito: Máquina XYZ (CODE123)
[Email] Configuração SMTP: { host: 'smtp.gmail.com', port: 587, ... }
[Email] Enviando e-mail...
[Email] ✅ E-mail enviado com sucesso!
[Email] Message ID: <message-id>
[Email] Response: 250 2.0.0 OK
[Email] ========================================
```

### Se Houver Erro

```
[Email] ========================================
[Email] ❌ ERRO ao enviar e-mail:
[Email] Tipo de erro: Error
[Email] Mensagem: connect ECONNREFUSED 127.0.0.1:587
[Email] ========================================
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "connect ECONNREFUSED"
**Significado:** Não consegue conectar ao servidor SMTP

**Soluções:**
1. Verifique se `SMTP_HOST` está correto (deve ser `smtp.gmail.com`)
2. Verifique se `SMTP_PORT` está correto (deve ser `587`)
3. Verifique sua conexão de internet
4. Tente reiniciar o servidor

### Erro: "Invalid login"
**Significado:** E-mail ou senha está errado

**Soluções:**
1. Verifique se `SMTP_USER` é seu e-mail completo (ex: seu-email@gmail.com)
2. Verifique se `SMTP_PASS` é a App Password de 16 caracteres (com espaços)
3. Gere uma nova App Password no Gmail
4. Não use a senha da conta, use a App Password

### Erro: "Email address not recognized"
**Significado:** O e-mail de destino é inválido

**Soluções:**
1. Verifique se o e-mail cadastrado no perfil é válido
2. Certifique-se de que não há espaços extras
3. Teste com um e-mail conhecido (como seu próprio Gmail)

### Erro: "Timeout"
**Significado:** Levou muito tempo para conectar

**Soluções:**
1. Verifique sua conexão de internet
2. Tente novamente (pode ser problema temporário)
3. Verifique se o firewall está bloqueando a porta 587

---

## 📊 Checklist para Produção

- [ ] Variáveis de ambiente configuradas no servidor
- [ ] `.env` preenchido com credenciais corretas
- [ ] 2FA ativado na conta Gmail
- [ ] App Password gerada e copiada corretamente
- [ ] Teste de envio realizado com sucesso
- [ ] Logs mostram "✅ E-mail enviado com sucesso"
- [ ] E-mail chegou na caixa de entrada (não SPAM)

---

## 🔗 Modo Teste (Ethereal)

Se não configurar SMTP, o sistema usa **Ethereal** (conta de teste):

```
[Email] Usando Ethereal (modo teste)
[Email] ✅ E-mail enviado com sucesso!
[Email] 🔗 Visualizar e-mail (modo teste): https://ethereal.email/message/...
```

**Clique no link** para ver o e-mail no navegador.

---

## 📝 Logs Detalhados

O sistema agora mostra:
- ✅ Quando inicia o envio
- ✅ Configuração SMTP sendo usada
- ✅ Se a conexão foi verificada
- ✅ Message ID do e-mail
- ✅ Response do servidor SMTP
- ❌ Erros detalhados com stack trace

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique todos os logs** - Copie as mensagens `[Email]` do console
2. **Teste a conexão** - O sistema testa automaticamente
3. **Verifique o `.env`** - Certifique-se de que está preenchido
4. **Reinicie o servidor** - Às vezes resolve
5. **Gere nova App Password** - Pode ter expirado

---

## ✨ Resumo

| Situação | O que fazer |
|----------|-----------|
| Desenvolvimento local | Use Ethereal ou configure Gmail |
| Produção online | E-mail chegará normalmente |
| Erro de conexão | Verifique SMTP_HOST e SMTP_PORT |
| Erro de autenticação | Verifique SMTP_USER e SMTP_PASS |
| E-mail inválido | Verifique o e-mail cadastrado |

---

**Dúvidas? Verifique os logs do servidor - eles mostram exatamente o que está acontecendo!** 📧
