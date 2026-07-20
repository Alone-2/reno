import { pgTable, uuid, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { user } from "./user";
import { inspectionTypeEnum, violationStatusEnum } from "./enums";

// ── 巡检记录表 ──
export const inspection = pgTable("inspection", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  inspectorId: uuid("inspector_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: inspectionTypeEnum("type").default("routine").notNull(),
  result: varchar("result", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── 违规记录表 ──
export const violation = pgTable("violation", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  inspectionId: uuid("inspection_id").references(() => inspection.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  status: violationStatusEnum("status").default("pending").notNull(),
  fine: decimal("fine", { precision: 12, scale: 2 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
