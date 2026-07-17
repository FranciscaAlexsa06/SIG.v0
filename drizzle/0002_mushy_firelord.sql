CREATE TABLE `medical_leaves` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_rut` text NOT NULL,
	`worker_name` text NOT NULL,
	`cost_center` text NOT NULL,
	`date_from` text NOT NULL,
	`date_to` text NOT NULL,
	`days` integer NOT NULL,
	`folio` text NOT NULL,
	`specialty` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Registrada' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`file_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `worker_records` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_rut` text NOT NULL,
	`category` text NOT NULL,
	`subtype` text NOT NULL,
	`title` text NOT NULL,
	`issue_date` text DEFAULT '' NOT NULL,
	`expiry_date` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Vigente' NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`file_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `workers` ADD `gender` text DEFAULT 'No informado' NOT NULL;