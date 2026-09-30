import { index, jsonb, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { projectMemberRoleEnum } from "./enums";
import { renovationProject } from "./project";
import { user } from "./user";

export type ProjectPermission =
  | "project.manage"
  | "member.manage"
  | "file.manage"
  | "progress.write"
  | "finance.write"
  | "finance.approve"
  | "acceptance.write"
  | "view";

// 项目成员关系。项目 owner 即使没有历史记录，也会由服务层视为全权限。
export const projectMember = pgTable(
  "project_member",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: projectMemberRoleEnum("role").notNull(),
    permissions: jsonb("permissions").$type<ProjectPermission[]>().default(["view"]).notNull(),
    invitedBy: uuid("invited_by").references(() => user.id, { onDelete: "set null" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    projectUserUnique: uniqueIndex("project_member_project_user_uidx").on(
      table.projectId,
      table.userId,
    ),
    projectIndex: index("project_member_project_idx").on(table.projectId),
  }),
);
