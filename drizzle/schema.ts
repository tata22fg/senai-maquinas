import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Máquinas ────────────────────────────────────────────────────────────────
export const machines = mysqlTable("machines", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  location: varchar("location", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["available", "faulty"])
    .default("available")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;

// ─── Relatórios de Defeito ────────────────────────────────────────────────────
export const faultReports = mysqlTable("fault_reports", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId")
    .notNull()
    .references(() => machines.id),
  reportedBy: varchar("reportedBy", { length: 128 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"])
    .default("open")
    .notNull(),
  resolvedAt: bigint("resolvedAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaultReport = typeof faultReports.$inferSelect;
export type InsertFaultReport = typeof faultReports.$inferInsert;
