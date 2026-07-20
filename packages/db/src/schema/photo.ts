import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { projectPhase } from "./phase";
import { inspection } from "./inspection";
import { violation } from "./inspection";
import { acceptance } from "./acceptance";
import { photoTypeEnum } from "./enums";

// ── 照片表（统一管理所有业务照片）──
export const photo = pgTable("photo", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  phaseId: uuid("phase_id").references(() => projectPhase.id, { onDelete: "set null" }),
  inspectionId: uuid("inspection_id").references(() => inspection.id, { onDelete: "set null" }),
  violationId: uuid("violation_id").references(() => violation.id, { onDelete: "set null" }),
  acceptanceId: uuid("acceptance_id").references(() => acceptance.id, { onDelete: "set null" }),
  type: photoTypeEnum("type").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }),
  tags: text("tags"),
  takenAt: timestamp("taken_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
