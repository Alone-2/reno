import { pgTable, uuid, varchar, date, decimal, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { property } from "./property";
import { projectTypeEnum, projectStatusEnum, depositStatusEnum } from "./enums";

// ── 装修项目表 ──
export const renovationProject = pgTable("renovation_project", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => property.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  contractorId: uuid("contractor_id").references(() => user.id, { onDelete: "set null" }),
  designerId: uuid("designer_id").references(() => user.id, { onDelete: "set null" }),
  type: projectTypeEnum("type").notNull(),
  scope: varchar("scope", { length: 500 }),
  status: projectStatusEnum("status").default("pending").notNull(),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  actualStart: date("actual_start"),
  actualEnd: date("actual_end"),
  depositAmount: decimal("deposit_amount", { precision: 12, scale: 2 }),
  depositStatus: depositStatusEnum("deposit_status").default("unpaid").notNull(),
  permitNo: varchar("permit_no", { length: 50 }),
  rejectReason: varchar("reject_reason", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
