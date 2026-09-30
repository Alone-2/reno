import { date, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { issueSeverityEnum, issueSourceTypeEnum, issueStatusEnum } from "./enums";
import { party } from "./party";
import { projectPhase } from "./phase";
import { renovationProject } from "./project";
import { space } from "./space";

export const issue = pgTable(
  "issue",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    severity: issueSeverityEnum("severity").default("medium").notNull(),
    status: issueStatusEnum("status").default("open").notNull(),
    sourceType: issueSourceTypeEnum("source_type").default("manual").notNull(),
    sourceEntityId: uuid("source_entity_id"),
    spaceId: uuid("space_id").references(() => space.id, { onDelete: "set null" }),
    stageId: uuid("stage_id").references(() => projectPhase.id, { onDelete: "set null" }),
    responsiblePartyId: uuid("responsible_party_id").references(() => party.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
    resolutionNotes: text("resolution_notes"),
    resolvedAt: timestamp("resolved_at"),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIndex: index("issue_project_idx").on(table.projectId),
    statusIndex: index("issue_project_status_idx").on(table.projectId, table.status),
  }),
);
