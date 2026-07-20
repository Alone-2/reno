import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

// ── 用户表 ──
export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  name: varchar("name", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  role: roleEnum("role").default("owner").notNull(),
  avatar: varchar("avatar", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
