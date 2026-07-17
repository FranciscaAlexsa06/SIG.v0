CREATE TABLE `work_sites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`client` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Activa' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_sites_name_unique` ON `work_sites` (`name`);--> statement-breakpoint
ALTER TABLE `workers` ADD `worker_code` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `work_sites` text DEFAULT '[]' NOT NULL;