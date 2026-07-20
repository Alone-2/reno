import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { notificationChannelEnum } from "./enums";

// ── 通知表 ──
export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content"),
  read: boolean("read").default(false).notNull(),
  channel: notificationChannelEnum("channel").default("in_app").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
