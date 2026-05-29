# Guia de Configuração - SENAI Machines

## Problemas Corrigidos

Este documento descreve os problemas que foram identificados e corrigidos no projeto.

### 1. Cookie de Sessão com SameSite=None em HTTP ✅ CORRIGIDO

**Problema:** O arquivo `server/_core/cookies.ts` configurava cookies com `SameSite=None` sempre, mas o `secure` só era ativado em HTTPS. Em ambientes locais (HTTP), navegadores modernos rejeitam cookies com `SameSite=None` sem `secure: true`, quebrando completamente o login.

**Solução:** 
- Em desenvolvimento local (HTTP), agora usa `SameSite=Lax`
- Em produção (HTTPS), continua com `SameSite=None` e `secure: true`
- Localhost agora aceita cookies mesmo sem HTTPS

### 2. Validação Rigorosa de Nome de Usuário ✅ CORRIGIDO

**Problema:** O arquivo `server/_core/sdk.ts` validava que `name` não podia ser vazio na sessão JWT. Alguns provedores OAuth podem retornar usuários sem nome, causando falha na autenticação.

**Solução:**
- `name` agora pode ser uma string vazia
- Apenas `openId` e `appId` são obrigatórios
- Nomes vazios são aceitos e preenchidos com valor padrão

### 3. Falta de Variáveis de Ambiente ✅ CORRIGIDO

**Problema:** Não havia arquivo `.env` no projeto. Sem variáveis como `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL` e `DATABASE_URL`, o sistema não conseguia:
- Assinar e verificar tokens de sessão
- Conectar ao servidor OAuth
- Conectar ao banco de dados

**Solução:**
- Criado arquivo `.env.example` com todas as variáveis necessárias
- Veja a seção "Configuração Inicial" abaixo

### 4. Importação Faltante de TRPCError ✅ CORRIGIDO

**Problema:** O arquivo `server/routers.ts` usava `TRPCError` mas não o importava.

**Solução:**
- Adicionada importação: `import { TRPCError } from "@trpc/server";`

---

## Configuração Inicial

### Passo 1: Instalar Dependências

```bash
cd /home/ubuntu/senai-machines
pnpm install
```

### Passo 2: Criar Arquivo .env

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Edite `.env` com as seguintes informações:

```env
# Banco de Dados MySQL/TiDB
DATABASE_URL=mysql://usuario:senha@localhost:3306/senai_machines

# OAuth Desenvolvedor
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://oauth.manus.im
JWT_SECRET=sua_chave_secreta_aqui

# Proprietário (será promovido a admin)
OWNER_OPEN_ID=seu_open_id_aqui

# Porta e Ambiente
PORT=3000
NODE_ENV=development
```

### Passo 3: Configurar Banco de Dados

```bash
# Executar migrações
pnpm db:push
```

### Passo 4: Iniciar o Servidor

```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

---

## Testando o Login

1. Acesse `http://localhost:3000`
2. Clique em "Entrar no sistema"
3. Você será redirecionado para o portal OAuth do Desenvolvedor
4. Após autenticar, será redirecionado de volta com um cookie de sessão
5. O cookie agora será aceito pelo navegador (mesmo em HTTP local)

---

## Verificando o Status de Autenticação

### No Frontend

```tsx
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;
  
  return <div>Bem-vindo, {user?.name}!</div>;
}
```

### No Backend (Console)

Quando fizer login, você verá logs como:

```
[OAuth] Initialized with baseURL: https://oauth.manus.im
[Auth] Session verification successful
[Auth] User synced from OAuth: user@example.com
```

---

## Troubleshooting

### "Cookie não persiste após login"

**Causa:** Variáveis de ambiente não configuradas
**Solução:** Verifique se `.env` existe e `JWT_SECRET` está preenchido

### "Erro ao conectar ao OAuth"

**Causa:** `OAUTH_SERVER_URL` incorreta ou `VITE_APP_ID` inválido
**Solução:** Verifique as credenciais no arquivo `.env`

### "Erro ao conectar ao banco de dados"

**Causa:** `DATABASE_URL` incorreta ou MySQL não está rodando
**Solução:** Verifique a conexão com `mysql -u usuario -p -h localhost`

### "Funcionalidades protegidas não funcionam"

**Causa:** Usuário não está autenticado ou não tem permissão
**Solução:** 
1. Faça login novamente
2. Se for admin, verifique se `OWNER_OPEN_ID` está correto

---

## Arquivos Modificados

- ✅ `server/_core/cookies.ts` - Corrigida lógica de SameSite/Secure
- ✅ `server/_core/sdk.ts` - Flexibilizada validação de nome
- ✅ `server/routers.ts` - Adicionada importação de TRPCError
- ✅ `.env.example` - Criado com todas as variáveis necessárias

---

## Próximos Passos

1. Configure o banco de dados MySQL/TiDB
2. Obtenha credenciais OAuth do Desenvolvedor
3. Preencha o arquivo `.env`
4. Execute `pnpm dev` para iniciar o desenvolvimento
5. Teste o fluxo de login completo

Para mais informações, veja o arquivo `README.md`.
