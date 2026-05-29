import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Usuário administrador fixo para liberar todas as funcionalidades sem login
  const adminUser: User = {
    id: 1,
    openId: "admin-fixed",
    name: "Administrador SENAI",
    email: "admin@senai.br",
    loginMethod: "fixed",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    req: opts.req,
    res: opts.res,
    user: adminUser,
  };
}
