ALTER TABLE `workers` ADD `active` integer DEFAULT true NOT NULL;
--> statement-breakpoint
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-001', 'Bancos', 'BANCO DE CHILE', '1', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO DE CHILE')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-002', 'Bancos', 'BANCO INTERNACIONAL', '9', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO INTERNACIONAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-003', 'Bancos', 'BANCO ESTADO', '12', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO ESTADO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-004', 'Bancos', 'SCOTIABANK', '14', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('SCOTIABANK')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-005', 'Bancos', 'BCI-TBANC-NOVA', '16', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BCI-TBANC-NOVA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-006', 'Bancos', 'BANCO DO BRASIL S.A', '17', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO DO BRASIL S.A')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-007', 'Bancos', 'BANCO CORP BANCA', '27', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO CORP BANCA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-008', 'Bancos', 'BANCO BICE', '28', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO BICE')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-009', 'Bancos', 'HSBC BANK (CHILE)', '31', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('HSBC BANK (CHILE)')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-010', 'Bancos', 'BANCO SANTANDER-SANTIAGO', '37', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO SANTANDER-SANTIAGO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-011', 'Bancos', 'BANCO ITAU', '39', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO ITAU')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-012', 'Bancos', 'JP MORGAN', '41', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('JP MORGAN')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-013', 'Bancos', 'BANCO DE LA NACION ARGENTINA', '43', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO DE LA NACION ARGENTINA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-014', 'Bancos', 'BANCO FALABELLA', '51', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO FALABELLA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-015', 'Bancos', 'DEUTSCHE BANK', '52', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('DEUTSCHE BANK')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-016', 'Bancos', 'BANCO RIPLEY', '53', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO RIPLEY')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-017', 'Bancos', 'BANCO CONSORCIO', '55', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO CONSORCIO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-018', 'Bancos', 'BANCO BTGPACTUAL', '59', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO BTGPACTUAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-019', 'Bancos', 'SCOTIABANK AZUL (EX BBVA)', '504', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('SCOTIABANK AZUL (EX BBVA)')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-020', 'Bancos', 'COOPEUCH', '672', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('COOPEUCH')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-021', 'Bancos', 'BANCO SECURITY', '49', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BANCO SECURITY')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-022', 'Bancos', 'PREPAGO LOS HEROES', '729', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('PREPAGO LOS HEROES')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-023', 'Bancos', 'Mercado Pago', '875', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('Mercado Pago')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-024', 'Bancos', 'TENPO Prepago S.A.', '730', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('TENPO Prepago S.A.')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-025', 'Bancos', 'TAPP Caja los Andes', '732', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('TAPP Caja los Andes')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-026', 'Bancos', 'La Polar Prepago', '697', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('La Polar Prepago')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-027', 'Bancos', 'Global66', '738', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('Global66')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-028', 'Bancos', 'BCI MACH', '116', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('BCI MACH')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-BAN-029', 'Bancos', 'Copec Pay', '741', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Bancos' AND upper(trim(`name`)) = upper(trim('Copec Pay')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-001', 'AFP', 'CAPITAL', '11,44%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('CAPITAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-002', 'AFP', 'CUPRUM', '11,44%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('CUPRUM')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-003', 'AFP', 'HABITAT', '11,27%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('HABITAT')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-004', 'AFP', 'PLAN VITAL', '11,16%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('PLAN VITAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-005', 'AFP', 'PROVIDA', '11,45%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('PROVIDA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-006', 'AFP', 'MODELO', '10,58%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('MODELO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-AFP-007', 'AFP', 'UNO', '10,46%', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'AFP' AND upper(trim(`name`)) = upper(trim('UNO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-001', 'Cargos', 'CHOFER Y AYUDANTE MECANICO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('CHOFER Y AYUDANTE MECANICO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-002', 'Cargos', 'OPERADOR Y AYUDANTE MECANICO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('OPERADOR Y AYUDANTE MECANICO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-003', 'Cargos', 'ADMINISTRATIVA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ADMINISTRATIVA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-004', 'Cargos', 'OPERARIO DE BODEGA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('OPERARIO DE BODEGA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-005', 'Cargos', 'MECANICO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('MECANICO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-006', 'Cargos', 'AYUDANTE DE MAESTRO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('AYUDANTE DE MAESTRO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-007', 'Cargos', 'PREVENCIONISTA DE RIESGOS', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('PREVENCIONISTA DE RIESGOS')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-008', 'Cargos', 'ENCARGADA DE PARTICIPACION CIUDADANA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ENCARGADA DE PARTICIPACION CIUDADANA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-009', 'Cargos', 'SUPERVISOR', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('SUPERVISOR')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-010', 'Cargos', 'JORNAL/ALARIFE', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JORNAL/ALARIFE')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-011', 'Cargos', 'RESIDENTE DE OBRA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('RESIDENTE DE OBRA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-012', 'Cargos', 'AUXILIAR DE ASEO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('AUXILIAR DE ASEO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-013', 'Cargos', 'ENCARGADO DE CALIDAD', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ENCARGADO DE CALIDAD')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-014', 'Cargos', 'ADMINISTRADOR DE OBRA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ADMINISTRADOR DE OBRA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-015', 'Cargos', 'INGENIERO RESIDENTE', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('INGENIERO RESIDENTE')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-016', 'Cargos', 'OFICINA TECNICA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('OFICINA TECNICA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-017', 'Cargos', 'JEFE TOPOGRAFIA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JEFE TOPOGRAFIA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-018', 'Cargos', 'JEFE DE TALLER MECANICO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JEFE DE TALLER MECANICO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-019', 'Cargos', 'JEFE DE ESTUDIOS DE LICITACION Y PROPUESTAS', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JEFE DE ESTUDIOS DE LICITACION Y PROPUESTAS')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-020', 'Cargos', 'ENCARGADA AMBIENTAL', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ENCARGADA AMBIENTAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-021', 'Cargos', 'ADMINISTRADOR DE CONTRATO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ADMINISTRADOR DE CONTRATO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-022', 'Cargos', 'OPERADOR MOTO Y AYUDANTE MECANICO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('OPERADOR MOTO Y AYUDANTE MECANICO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-023', 'Cargos', 'MAESTRO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('MAESTRO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-024', 'Cargos', 'ENCARGADO DE BODEGA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ENCARGADO DE BODEGA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-025', 'Cargos', 'ASISTENTE OFICINA TECNICA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ASISTENTE OFICINA TECNICA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-026', 'Cargos', 'CONTRACT MANAGER', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('CONTRACT MANAGER')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-027', 'Cargos', 'OPERADOR Y M1', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('OPERADOR Y M1')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-028', 'Cargos', 'CUIDADOR', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('CUIDADOR')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-029', 'Cargos', 'CONSERJE', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('CONSERJE')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-030', 'Cargos', 'SOLDADOR', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('SOLDADOR')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-031', 'Cargos', 'ADMINISTRATIVA DE OBRA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ADMINISTRATIVA DE OBRA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-032', 'Cargos', 'JEFE RRHH Y FINANZAS', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JEFE RRHH Y FINANZAS')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-033', 'Cargos', 'AYUDANTE MAESTRO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('AYUDANTE MAESTRO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-034', 'Cargos', 'GERENTE COMERCIAL', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('GERENTE COMERCIAL')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-035', 'Cargos', 'JEFE DE TERRENO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('JEFE DE TERRENO')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-036', 'Cargos', 'ANALISTA DE GESTION ADMINISTRATIVA', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('ANALISTA DE GESTION ADMINISTRATIVA')));
--> statement-breakpoint
INSERT INTO `system_base_items` (`id`, `category`, `name`, `value`, `active`) SELECT 'SEED-CAR-037', 'Cargos', 'TOPOGRAFO', '', 1 WHERE NOT EXISTS (SELECT 1 FROM `system_base_items` WHERE `category` = 'Cargos' AND upper(trim(`name`)) = upper(trim('TOPOGRAFO')));
