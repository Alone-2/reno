import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { partyTypeEnum } from "./enums";
import { renovationProject } from "./project";

/** 项目联系人仅是业务对象，不授予系统账号或权限。 */
export const party = pgTable(
  "party",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    type: partyTypeEnum("type").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    company: varchar("company", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    wechat: varchar("wechat", { length: 80 }),
    responsibility: varchar("responsibility", { length: 240 }),
    notes: text("notes"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({ projectIndex: index("party_project_idx").on(table.projectId) }),
);
