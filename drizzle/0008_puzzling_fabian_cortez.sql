CREATE TABLE `vacation_folio_sequences` (
	`id` text PRIMARY KEY NOT NULL,
	`last_folio` integer DEFAULT 578 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `vacation_folio_sequences` (`id`, `last_folio`) VALUES ('VAC', 578);
--> statement-breakpoint
WITH `ranked_pending` AS (
	SELECT `id`, ROW_NUMBER() OVER (ORDER BY `created_at`, `id`) AS `position`
	FROM `worker_records`
	WHERE `category` = 'Vacaciones'
	  AND `subtype` = 'Solicitud de vacaciones'
	  AND `status` IN ('Pendiente de firma', 'Pendiente de aprobación')
	  AND `title` LIKE 'VAC-%'
)
UPDATE `worker_records`
SET
	`title` = CAST(578 + (SELECT `position` FROM `ranked_pending` WHERE `ranked_pending`.`id` = `worker_records`.`id`) AS TEXT),
	`metadata` = json_set(CASE WHEN json_valid(`metadata`) THEN `metadata` ELSE '{}' END, '$.folio', 578 + (SELECT `position` FROM `ranked_pending` WHERE `ranked_pending`.`id` = `worker_records`.`id`)),
	`status` = 'Pendiente de aprobación',
	`updated_at` = CURRENT_TIMESTAMP
WHERE `id` IN (SELECT `id` FROM `ranked_pending`);
--> statement-breakpoint
UPDATE `vacation_folio_sequences`
SET `last_folio` = 578 + (
	SELECT COUNT(*)
	FROM `worker_records`
	WHERE `category` = 'Vacaciones'
	  AND `subtype` = 'Solicitud de vacaciones'
	  AND `status` = 'Pendiente de aprobación'
	  AND CAST(`title` AS INTEGER) >= 579
), `updated_at` = CURRENT_TIMESTAMP
WHERE `id` = 'VAC';
