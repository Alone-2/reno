import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { projectPhase } from "./phase";
import { user } from "./user";

// ── 施工日志表 ──
export const dailyLog = pgTable("daily_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  phaseId: uuid("phase_id").references(() => projectPhase.id, { onDelete: "set null" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  materials: text("materials"),
  workers: varchar("workers", { length: 255 }),
  tomorrowPlan: text("tomorrow_plan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
