import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { renovationProject } from "./project";
import { projectPhase } from "./phase";
import { acceptanceTypeEnum, acceptanceResultEnum } from "./enums";

// ── 验收记录表 ──
export const acceptance = pgTable("acceptance", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => renovationProject.id, { onDelete: "cascade" }),
  phaseId: uuid("phase_id").references(() => projectPhase.id, { onDelete: "set null" }),
  type: acceptanceTypeEnum("type").notNull(),
  result: acceptanceResultEnum("result").notNull(),
  checklist: text("checklist"),
  notes: text("notes"),
  signedByOwner: timestamp("signed_by_owner"),
  signedByProperty: timestamp("signed_by_property"),
  signedByContractor: timestamp("signed_by_contractor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
