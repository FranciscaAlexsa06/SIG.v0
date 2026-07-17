CREATE TABLE `attendance_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`date` text NOT NULL,
	`worker_rut` text NOT NULL,
	`worker_name` text NOT NULL,
	`cost_center` text DEFAULT '' NOT NULL,
	`states` text DEFAULT '[]' NOT NULL,
	`am_in` text DEFAULT '08:00' NOT NULL,
	`am_out` text DEFAULT '13:00' NOT NULL,
	`pm_in` text DEFAULT '15:00' NOT NULL,
	`pm_out` text DEFAULT '18:00' NOT NULL,
	`attachment_type` text DEFAULT '' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`file_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'En revisión' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `work_sites` ADD `cost_center` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `first_names` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `last_names` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `advance_amount` integer DEFAULT 0 NOT NULL;