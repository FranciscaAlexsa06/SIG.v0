CREATE TABLE "attendance_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"date" text NOT NULL,
	"worker_rut" text NOT NULL,
	"worker_name" text NOT NULL,
	"cost_center" text DEFAULT '' NOT NULL,
	"states" text DEFAULT '[]' NOT NULL,
	"am_in" text DEFAULT '08:00' NOT NULL,
	"am_out" text DEFAULT '13:00' NOT NULL,
	"pm_in" text DEFAULT '15:00' NOT NULL,
	"pm_out" text DEFAULT '18:00' NOT NULL,
	"attachment_type" text DEFAULT '' NOT NULL,
	"file_name" text DEFAULT '' NOT NULL,
	"file_key" text DEFAULT '' NOT NULL,
	"content_type" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'En revisión' NOT NULL,
	"review_note" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"module" text NOT NULL,
	"action" text NOT NULL,
	"record_id" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caja_andes_records" (
	"id" text PRIMARY KEY NOT NULL,
	"period" text NOT NULL,
	"worker_rut" text NOT NULL,
	"worker_name" text DEFAULT '' NOT NULL,
	"credits" text DEFAULT '' NOT NULL,
	"insurances" text DEFAULT '' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"file_name" text DEFAULT '' NOT NULL,
	"file_key" text DEFAULT '' NOT NULL,
	"content_type" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"legal_name" text NOT NULL,
	"rut" text NOT NULL,
	"trade_name" text DEFAULT '' NOT NULL,
	"representative" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Activa' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "companies_rut_unique" UNIQUE("rut")
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"document_type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"file_name" text NOT NULL,
	"file_key" text NOT NULL,
	"content_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_leaves" (
	"id" text PRIMARY KEY NOT NULL,
	"worker_rut" text NOT NULL,
	"worker_name" text NOT NULL,
	"cost_center" text NOT NULL,
	"date_from" text NOT NULL,
	"date_to" text NOT NULL,
	"days" integer NOT NULL,
	"folio" text NOT NULL,
	"specialty" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Registrada' NOT NULL,
	"file_name" text DEFAULT '' NOT NULL,
	"file_key" text DEFAULT '' NOT NULL,
	"content_type" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processes" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"rut" text NOT NULL,
	"person_name" text NOT NULL,
	"company" text NOT NULL,
	"cost_center" text NOT NULL,
	"role" text NOT NULL,
	"workday" text NOT NULL,
	"start_date" text NOT NULL,
	"status" text DEFAULT 'Iniciado' NOT NULL,
	"stage" text DEFAULT 'Revisión de RRHH' NOT NULL,
	"required_documents" text DEFAULT '[]' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_base_items" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"worker_rut" text NOT NULL,
	"worker_name" text NOT NULL,
	"profile" text NOT NULL,
	"scope" text DEFAULT 'Total empresa' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "user_profiles_worker_rut_unique" UNIQUE("worker_rut")
);
--> statement-breakpoint
CREATE TABLE "vacation_folio_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"last_folio" integer DEFAULT 578 NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_sites" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cost_center" text DEFAULT '' NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"client" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"region" text DEFAULT '' NOT NULL,
	"commune" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Activa' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "work_sites_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "worker_records" (
	"id" text PRIMARY KEY NOT NULL,
	"worker_rut" text NOT NULL,
	"category" text NOT NULL,
	"subtype" text NOT NULL,
	"title" text NOT NULL,
	"issue_date" text DEFAULT '' NOT NULL,
	"expiry_date" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Vigente' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	"file_name" text DEFAULT '' NOT NULL,
	"file_key" text DEFAULT '' NOT NULL,
	"content_type" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" text PRIMARY KEY NOT NULL,
	"worker_code" text DEFAULT '' NOT NULL,
	"first_names" text DEFAULT '' NOT NULL,
	"last_names" text DEFAULT '' NOT NULL,
	"entry_date" text NOT NULL,
	"full_name" text NOT NULL,
	"identity_number" text NOT NULL,
	"birth_date" text NOT NULL,
	"nationality" text NOT NULL,
	"gender" text DEFAULT 'No informado' NOT NULL,
	"marital_status" text NOT NULL,
	"education_level" text NOT NULL,
	"professional_title" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"commune" text NOT NULL,
	"region" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text NOT NULL,
	"family_dependents" integer DEFAULT 0 NOT NULL,
	"disability_or_invalidity" text NOT NULL,
	"role" text NOT NULL,
	"work_site" text NOT NULL,
	"work_sites" text DEFAULT '[]' NOT NULL,
	"contract_term" text NOT NULL,
	"agreed_salary" integer NOT NULL,
	"afp" text NOT NULL,
	"health" text NOT NULL,
	"isapre_plan" text DEFAULT '' NOT NULL,
	"bank" text NOT NULL,
	"account_type" text NOT NULL,
	"account_number" text NOT NULL,
	"requires_advance" boolean DEFAULT false NOT NULL,
	"advance_amount" integer DEFAULT 0 NOT NULL,
	"emergency_name" text NOT NULL,
	"emergency_relationship" text NOT NULL,
	"emergency_mobile" text NOT NULL,
	"emergency_contacts" text DEFAULT '[]' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'Individual' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "workers_identity_number_unique" UNIQUE("identity_number")
);
