import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import {
  users,
  machines,
  faultReports,
} from "../drizzle/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

export const connection = mysql.createPool(connectionString);
export const db = drizzle(connection, { schema, mode: "default" });

export {
  users,
  machines,
  faultReports,
};
