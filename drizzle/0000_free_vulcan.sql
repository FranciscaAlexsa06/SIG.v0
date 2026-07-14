CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_name` text NOT NULL,
	`module` text NOT NULL,
	`action` text NOT NULL,
	`record_id` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `processes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`rut` text NOT NULL,
	`person_name` text NOT NULL,
	`company` text NOT NULL,
	`cost_center` text NOT NULL,
	`role` text NOT NULL,
	`workday` text NOT NULL,
	`start_date` text NOT NULL,
	`status` text DEFAULT 'Iniciado' NOT NULL,
	`stage` text DEFAULT 'Revisión de RRHH' NOT NULL,
	`required_documents` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
