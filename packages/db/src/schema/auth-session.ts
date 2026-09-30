import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";

// Refresh token 轮换会话。数据库只保存 token 的 SHA-256 摘要。
export const refreshSession = pgTable(
  "refresh_session",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    userAgent: varchar("user_agent", { length: 500 }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({ userIndex: index("refresh_session_user_idx").on(table.userId) }),
);
