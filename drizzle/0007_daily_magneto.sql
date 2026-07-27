CREATE TABLE `caja_andes_records` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`worker_rut` text NOT NULL,
	`worker_name` text DEFAULT '' NOT NULL,
	`credits` text DEFAULT '' NOT NULL,
	`insurances` text DEFAULT '' NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`file_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `workers` ADD `emergency_contacts` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
DELETE FROM `system_base_items` WHERE `category` = 'Cuentas';
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-001', 'Salud', 'FONASA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('FONASA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-002', 'Salud', 'Banmédica', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Banmédica')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-003', 'Salud', 'Colmena', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Colmena')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-004', 'Salud', 'Consalud', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Consalud')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-005', 'Salud', 'Cruz Blanca', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Cruz Blanca')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-006', 'Salud', 'Nueva Masvida', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Nueva Masvida')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-007', 'Salud', 'Vida Tres', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Vida Tres')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-008', 'Salud', 'Esencial', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Esencial')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-009', 'Salud', 'Fundación BancoEstado', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Fundación BancoEstado')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-SAL-010', 'Salud', 'Isalud (Codelco)', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Salud' AND lower(trim(`name`)) = lower(trim('Isalud (Codelco)')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-01', 'Feriados', 'Año Nuevo (Irrenunciable)', '2026-01-01', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-01-01');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-02', 'Feriados', 'Viernes Santo', '2026-04-03', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-04-03');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-03', 'Feriados', 'Sábado Santo', '2026-04-04', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-04-04');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-04', 'Feriados', 'Día del Trabajo (Irrenunciable)', '2026-05-01', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-05-01');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-05', 'Feriados', 'Día de las Glorias Navales', '2026-05-21', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-05-21');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-06', 'Feriados', 'Día Nacional de los Pueblos Indígenas', '2026-06-21', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-06-21');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-07', 'Feriados', 'San Pedro y San Pablo', '2026-06-29', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-06-29');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-08', 'Feriados', 'Virgen del Carmen', '2026-07-16', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-07-16');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-09', 'Feriados', 'Asunción de la Virgen', '2026-08-15', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-08-15');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-10', 'Feriados', 'Independencia Nacional (Irrenunciable)', '2026-09-18', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-09-18');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-11', 'Feriados', 'Día de las Glorias del Ejército (Irrenunciable)', '2026-09-19', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-09-19');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-12', 'Feriados', 'Encuentro de Dos Mundos', '2026-10-12', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-10-12');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-13', 'Feriados', 'Día de las Iglesias Evangélicas y Protestantes', '2026-10-31', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-10-31');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-14', 'Feriados', 'Día de Todos los Santos', '2026-11-01', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-11-01');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-15', 'Feriados', 'Inmaculada Concepción', '2026-12-08', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-12-08');
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-FER-2026-16', 'Feriados', 'Navidad (Irrenunciable)', '2026-12-25', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Feriados' AND `value` = '2026-12-25');
