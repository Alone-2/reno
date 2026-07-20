CREATE TYPE "public"."acceptance_result" AS ENUM('passed', 'rectification', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."acceptance_type" AS ENUM('phase', 'final');--> statement-breakpoint
CREATE TYPE "public"."checklist_status" AS ENUM('pending', 'confirmed', 'completed', 'rectification');--> statement-breakpoint
CREATE TYPE "public"."deposit_status" AS ENUM('unpaid', 'paid', 'refunded', 'deducted');--> statement-breakpoint
CREATE TYPE "public"."inspection_type" AS ENUM('routine', 'random');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('pending', 'ordered', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'sms', 'wechat');--> statement-breakpoint
CREATE TYPE "public"."phase_status" AS ENUM('pending', 'in_progress', 'completed', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."photo_type" AS ENUM('progress', 'inspection', 'violation', 'acceptance', 'material');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('pending', 'approved', 'constructing', 'accepting', 'completed', 'closed');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('full', 'half', 'clear');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'contractor', 'designer', 'inspector', 'property', 'admin');--> statement-breakpoint
CREATE TYPE "public"."violation_status" AS ENUM('pending', 'resolved', 'rechecked');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar NOT NULL,
	"name" varchar(50),
	"phone" varchar(20),
	"role" "role" DEFAULT 'owner' NOT NULL,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community" varchar(100) NOT NULL,
	"building" varchar(20) NOT NULL,
	"unit" varchar(20),
	"room" varchar(20) NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renovation_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"contractor_id" uuid,
	"designer_id" uuid,
	"type" "project_type" NOT NULL,
	"scope" varchar(500),
	"status" "project_status" DEFAULT 'pending' NOT NULL,
	"planned_start" date,
	"planned_end" date,
	"actual_start" date,
	"actual_end" date,
	"deposit_amount" numeric(12, 2),
	"deposit_status" "deposit_status" DEFAULT 'unpaid' NOT NULL,
	"permit_no" varchar(50),
	"reject_reason" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_phase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_name" varchar(50) NOT NULL,
	"sort_order" integer NOT NULL,
	"status" "phase_status" DEFAULT 'pending' NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"planned_start" date,
	"planned_end" date,
	"actual_start" date,
	"actual_end" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"status" "checklist_status" DEFAULT 'pending' NOT NULL,
	"linked_phase_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"area" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"materials" text,
	"workers" varchar(255),
	"tomorrow_plan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"inspector_id" uuid NOT NULL,
	"type" "inspection_type" DEFAULT 'routine' NOT NULL,
	"result" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "violation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"inspection_id" uuid,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"status" "violation_status" DEFAULT 'pending' NOT NULL,
	"fine" numeric(12, 2),
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acceptance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid,
	"type" "acceptance_type" NOT NULL,
	"result" "acceptance_result" NOT NULL,
	"checklist" text,
	"notes" text,
	"signed_by_owner" timestamp,
	"signed_by_property" timestamp,
	"signed_by_contractor" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" varchar(255),
	"date" timestamp DEFAULT now() NOT NULL,
	"paid" timestamp,
	"invoice" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"spec" varchar(100),
	"unit" varchar(20) NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"supplier" varchar(100),
	"supplier_contact" varchar(100),
	"status" "material_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text,
	"read" boolean DEFAULT false NOT NULL,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid,
	"inspection_id" uuid,
	"violation_id" uuid,
	"acceptance_id" uuid,
	"type" "photo_type" NOT NULL,
	"url" varchar(500) NOT NULL,
	"caption" varchar(255),
	"tags" text,
	"taken_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovation_project" ADD CONSTRAINT "renovation_project_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovation_project" ADD CONSTRAINT "renovation_project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovation_project" ADD CONSTRAINT "renovation_project_contractor_id_user_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renovation_project" ADD CONSTRAINT "renovation_project_designer_id_user_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phase" ADD CONSTRAINT "project_phase_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_linked_phase_id_project_phase_id_fk" FOREIGN KEY ("linked_phase_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection" ADD CONSTRAINT "inspection_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection" ADD CONSTRAINT "inspection_inspector_id_user_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violation" ADD CONSTRAINT "violation_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violation" ADD CONSTRAINT "violation_inspection_id_inspection_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptance" ADD CONSTRAINT "acceptance_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acceptance" ADD CONSTRAINT "acceptance_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_project_id_renovation_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."renovation_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_inspection_id_inspection_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_violation_id_violation_id_fk" FOREIGN KEY ("violation_id") REFERENCES "public"."violation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_acceptance_id_acceptance_id_fk" FOREIGN KEY ("acceptance_id") REFERENCES "public"."acceptance"("id") ON DELETE set null ON UPDATE no action;