import {
  date,
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { changeOrderStatusEnum, paymentPlanStatusEnum } from "./enums";
import { renovationProject } from "./project";
import { projectPhase } from "./phase";
import { acceptance } from "./acceptance";
import { party } from "./party";
import { user } from "./user";

export const projectBudget = pgTable(
  "project_budget",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    baselineAmount: decimal("baseline_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    contingencyAmount: decimal("contingency_amount", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    updatedBy: uuid("updated_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({ projectUnique: uniqueIndex("project_budget_project_uidx").on(table.projectId) }),
);

export const paymentPlan = pgTable(
  "payment_plan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    payee: varchar("payee", { length: 120 }),
    payeePartyId: uuid("payee_party_id").references(() => party.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    dueDate: date("due_date"),
    status: paymentPlanStatusEnum("status").default("pending").notNull(),
    paidAt: timestamp("paid_at"),
    phaseId: uuid("phase_id").references(() => projectPhase.id, { onDelete: "set null" }),
    acceptanceId: uuid("acceptance_id").references(() => acceptance.id, { onDelete: "set null" }),
    paymentCondition: text("payment_condition"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({ projectIndex: index("payment_plan_project_idx").on(table.projectId) }),
);

export const changeOrder = pgTable(
  "change_order",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => renovationProject.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    status: changeOrderStatusEnum("status").default("draft").notNull(),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    decidedBy: uuid("decided_by").references(() => user.id, { onDelete: "set null" }),
    dueDate: date("due_date"),
    decidedAt: timestamp("decided_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({ projectIndex: index("change_order_project_idx").on(table.projectId) }),
);
