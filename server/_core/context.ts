import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { users } from "../../drizzle/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {

  const userFromDb = await db
    .select()
    .from(users)
    .where(eq(users.id, 1));

  return {
    req: opts.req,
    res: opts.res,
    user: userFromDb[0] || null,
  };
}