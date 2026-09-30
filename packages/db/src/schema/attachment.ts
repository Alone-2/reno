import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { attachmentCategoryEnum } from "./enums";
import { renovationProject } from "./project";
import { user } from "./user";

export const attachment = pgTable(
  "attachment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: attachmentCategoryEnum("category").default("other").notNull(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: uuid("entity_id"),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({ projectIndex: index("attachment_project_idx").on(table.projectId) }),
);
