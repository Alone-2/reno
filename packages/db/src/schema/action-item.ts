import { date, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { actionItemPriorityEnum, actionItemStatusEnum, actionItemTypeEnum } from "./enums";
import { party } from "./party";
import { projectPhase } from "./phase";
import { renovationProject } from "./project";
import { space } from "./space";

export const actionItem = pgTable(
  "action_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    type: actionItemTypeEnum("type").default("task").notNull(),
    priority: actionItemPriorityEnum("priority").default("normal").notNull(),
    status: actionItemStatusEnum("status").default("todo").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    notes: text("notes"),
    decisionResult: text("decision_result"),
    dueDate: date("due_date"),
    spaceId: uuid("space_id").references(() => space.id, { onDelete: "set null" }),
    stageId: uuid("stage_id").references(() => projectPhase.id, { onDelete: "set null" }),
    relatedEntityType: varchar("related_entity_type", { length: 80 }),
    relatedEntityId: uuid("related_entity_id"),
    responsiblePartyId: uuid("responsible_party_id").references(() => party.id, {
      onDelete: "set null",
    }),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIndex: index("action_item_project_idx").on(table.projectId),
    dueIndex: index("action_item_due_idx").on(table.projectId, table.dueDate),
  }),
);
