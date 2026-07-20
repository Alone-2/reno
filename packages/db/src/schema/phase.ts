import { pgTable, uuid, varchar, date, integer, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { phaseStatusEnum } from "./enums";

// ── 施工阶段表 ──
export const projectPhase = pgTable("project_phase", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  phaseName: varchar("phase_name", { length: 50 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  status: phaseStatusEnum("status").default("pending").notNull(),
  progressPercent: integer("progress_percent").default(0).notNull(),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  actualStart: date("actual_start"),
  actualEnd: date("actual_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
