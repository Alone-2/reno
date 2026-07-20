import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

// ── 房产表 ──
export const property = pgTable("property", {
  id: uuid("id").defaultRandom().primaryKey(),
  community: varchar("community", { length: 100 }).notNull(),
  building: varchar("building", { length: 20 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  room: varchar("room", { length: 20 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
