import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { changeHistoryActionEnum } from "./enums";
import { renovationProject } from "./project";
import { user } from "./user";

/** 个人版轻量关键变更历史，不承担法定审计职能。 */
export const changeHistory = pgTable(
  "change_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: uuid("entity_id"),
    action: changeHistoryActionEnum("action").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    reason: text("reason"),
    actorId: uuid("actor_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIndex: index("change_history_project_idx").on(table.projectId, table.createdAt),
  }),
);
