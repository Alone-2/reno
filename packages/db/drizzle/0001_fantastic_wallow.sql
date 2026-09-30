CREATE TYPE "public"."action_item_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."action_item_status" AS ENUM('todo', 'doing', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."action_item_type" AS ENUM('task', 'decision', 'follow_up', 'purchase', 'payment', 'recheck');--> statement-breakpoint
CREATE TYPE "public"."attachment_category" AS ENUM('photo', 'document', 'invoice', 'contract', 'drawing', 'other');--> statement-breakpoint
CREATE TYPE "public"."change_history_action" AS ENUM('create', 'update', 'status_change', 'delete', 'restore');--> statement-breakpoint
CREATE TYPE "public"."change_order_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."issue_source_type" AS ENUM('manual', 'daily_log', 'acceptance');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'fixing', 'resolved', 'verified');--> statement-breakpoint
CREATE TYPE "public"."party_type" AS ENUM('contractor', 'foreman', 'worker', 'designer', 'supplier', 'installer', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_plan_status" AS ENUM('pending', 'partial', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'contractor', 'designer', 'supervisor', 'property', 'family', 'viewer');--> statement-breakpoint
ALTER TYPE "public"."material_status" ADD VALUE 'installed';--> statement-breakpoint
ALTER TYPE "public"."material_status" ADD VALUE 'returned';--> statement-breakpoint
ALTER TYPE "public"."material_status" ADD VALUE 'cancelled';--> statement-breakpoint
CREATE TABLE "project_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_member_role" NOT NULL,
	"permissions" jsonb DEFAULT '["view"]'::jsonb NOT NULL,
	"invited_by" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"user_agent" varchar(500),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"category" "attachment_category" DEFAULT 'other' NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"original_name" varchar(255) NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "change_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text,
	"amount" numeric(14, 2) NOT NULL,
	"status" "change_order_status" DEFAULT 'draft' NOT NULL,
	"requested_by" uuid NOT NULL,
	"decided_by" uuid,
	"due_date" date,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(120) NOT NULL,
	"payee" varchar(120),
	"payee_party_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"paid_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"due_date" date,
	"status" "payment_plan_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"phase_id" uuid,
	"acceptance_id" uuid,
	"payment_condition" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"baseline_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"contingency_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "party" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "party_type" NOT NULL,
	"name" varchar(120) NOT NULL,
	"company" varchar(160),
	"phone" varchar(40),
	"wechat" varchar(80),
	"responsibility" varchar(240),
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "action_item_type" DEFAULT 'task' NOT NULL,
	"priority" "action_item_priority" DEFAULT 'normal' NOT NULL,
	"status" "action_item_status" DEFAULT 'todo' NOT NULL,
	"title" varchar(200) NOT NULL,
	"notes" text,
	"decision_result" text,
	"due_date" date,
	"space_id" uuid,
	"stage_id" uuid,
	"related_entity_type" varchar(80),
	"related_entity_id" uuid,
	"responsible_party_id" uuid,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"severity" "issue_severity" DEFAULT 'medium' NOT NULL,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"source_type" "issue_source_type" DEFAULT 'manual' NOT NULL,
	"source_entity_id" uuid,
	"space_id" uuid,
	"stage_id" uuid,
	"responsible_party_id" uuid,
	"due_date" date,
	"resolution_notes" text,
	"resolved_at" timestamp,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "change_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid,
	"action" "change_history_action" NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"actor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_phase" ADD COLUMN "standard_phase_key" varchar(50);--> statement-breakpoint
ALTER TABLE "project_phase" ADD COLUMN "is_primary_current" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_phase" ADD COLUMN "is_acceptance_required" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "material" ADD COLUMN "supplier_party_id" uuid;--> statement-breakpoint
ALTER TABLE "material" ADD COLUMN "order_no" varchar(120);--> statement-breakpoint
ALTER TABLE "material" ADD COLUMN "order_date" date;--> statement-breakpoint
ALTER TABLE "material" ADD COLUMN "expected_arrival_date" date;--> statement-breakpoint
ALTER TABLE "material" ADD COLUMN "actual_arrival_date" date;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "href" varchar(500);--> statement-breakpoint
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_session" ADD CONSTRAINT "refresh_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_decided_by_user_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_payee_party_id_party_id_fk" FOREIGN KEY ("payee_party_id") REFERENCES "public"."party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_acceptance_id_acceptance_id_fk" FOREIGN KEY ("acceptance_id") REFERENCES "public"."acceptance"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_item" ADD CONSTRAINT "action_item_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_item" ADD CONSTRAINT "action_item_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_item" ADD CONSTRAINT "action_item_stage_id_project_phase_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_item" ADD CONSTRAINT "action_item_responsible_party_id_party_id_fk" FOREIGN KEY ("responsible_party_id") REFERENCES "public"."party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_stage_id_project_phase_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_responsible_party_id_party_id_fk" FOREIGN KEY ("responsible_party_id") REFERENCES "public"."party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_member_project_user_uidx" ON "project_member" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "project_member_project_idx" ON "project_member" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "refresh_session_user_idx" ON "refresh_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "attachment_project_idx" ON "attachment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "change_order_project_idx" ON "change_order" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "payment_plan_project_idx" ON "payment_plan" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_budget_project_uidx" ON "project_budget" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "party_project_idx" ON "party" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "action_item_project_idx" ON "action_item" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "action_item_due_idx" ON "action_item" USING btree ("project_id","due_date");--> statement-breakpoint
CREATE INDEX "issue_project_idx" ON "issue" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "issue_project_status_idx" ON "issue" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "change_history_project_idx" ON "change_history" USING btree ("project_id","created_at");--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_supplier_party_id_party_id_fk" FOREIGN KEY ("supplier_party_id") REFERENCES "public"."party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;