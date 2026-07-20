import { pgTable, uuid, varchar, decimal, text, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { projectPhase } from "./phase";
import { checklistStatusEnum } from "./enums";

// ── 装修空间表 ──
export const space = pgTable("space", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  area: decimal("area", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── 注意事项表 ──
export const checklistItem = pgTable("checklist_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => space.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  content: text("content").notNull(),
  status: checklistStatusEnum("status").default("pending").notNull(),
  linkedPhaseId: uuid("linked_phase_id").references(() => projectPhase.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
