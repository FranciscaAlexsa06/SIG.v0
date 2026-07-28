import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("includes the requested connected dashboard and hiring flow", async () => {
  const [app, operational, workersApi, schema, layout, hosting, basesMigration] = await Promise.all([
    readFile(new URL("app/SistemaApp.tsx", root), "utf8"),
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
    readFile(new URL("app/api/workers/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("drizzle/0006_moaning_skrulls.sql", root), "utf8"),
  ]);

  for (const label of [
    "Trabajadores activos",
    "Asistencia informada",
    "Contratos por vencer",
    "Licencias médicas",
    "Personas finiquitadas",
    "Tareas pendientes",
    "Nueva contratación",
    "Ir a Trabajadores",
    "Ir a Gestión Documental",
  ]) assert.match(app, new RegExp(label, "i"));

  assert.match(app, /\/procesos\/nueva-contratacion/);
  assert.match(app, /fetch\("\/api\/processes"/);
  assert.doesNotMatch(app, /href=["']#["']/);
  assert.match(layout, /Sistema Integral de Gestión/);
  assert.equal(JSON.parse(hosting).d1, "DB");

  for (const label of [
    "Contrato",
    "Anexo Obra",
    "Anexo de confidencialidad",
    "Anexo de Conductor",
    "Anexo plazo",
    "Anexo Indefinido",
    "Anexo de Cargo",
    "Certificado de antig",
    "Carta de aviso",
    "Acta de Entrega",
    "Nuevo ingreso",
    "Por trabajador",
    "Libro de asistencia",
    "Declaraci",
    "Nueva solicitud",
  ]) assert.match(operational, new RegExp(label, "i"));

  assert.doesNotMatch(app, /expediente/i);
  assert.doesNotMatch(operational, /Por trabajador y mes/i);

  for (const label of [
    "Licencias Médicas",
    "Nueva licencia médica",
    "Número de días",
    "N° de folio",
    "Especialidad",
    "Ingresar empresa",
    "Razón social",
  ]) assert.match(`${app}\n${operational}`, new RegExp(label, "i"));

  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  assert.match(app, /login-cover-v2\.png/);
  assert.match(app, /Accede a tu espacio de trabajo/);
  assert.match(styles, /login-hero/);
  assert.doesNotMatch(styles, /center\/contain no-repeat/);
  assert.match(operational, /Editar ficha/);
  assert.match(operational, /Código del trabajador/);
  assert.match(operational, /Enseñanza Básica/);
  assert.match(operational, /PLAN VITAL/);
  assert.match(operational, /Corriente/);
  assert.match(operational, /Obras asignadas/);
  assert.match(operational, /api\/work-sites/);
  assert.doesNotMatch(operational, /Centro de costo/i);
  assert.match(operational, /Obra/);
  assert.match(operational, /Nombre de la obra/);
  assert.doesNotMatch(operational, /Código de obra/i);
  assert.match(operational, /identifiedWorkSite/);
  assert.match(operational, /Empresa principal/);
  assert.match(operational, /Monto del anticipo/);
  assert.match(operational, /worker-photo-dates/);
  assert.match(operational, /displayedWorkerDate\(profile\?\.entryDate/);
  assert.doesNotMatch(operational, /Eliminar ficha/);
  assert.match(operational, /method: "DELETE"/);
  assert.match(operational, /Editar ficha<\/button><\/div>/);
  assert.match(operational, /Dejar inactivo/);
  assert.match(operational, /Cargo eliminado correctamente/);
  assert.match(operational, /Documento eliminado correctamente/);
  assert.match(operational, /normalizedWorkerDate\(profile\?\.entryDate/);
  assert.match(schema, /active: integer\("active"/);
  assert.match(basesMigration, /BANCO DE CHILE/);
  assert.match(basesMigration, /CAPITAL.*11,44%/s);
  assert.match(basesMigration, /CHOFER Y AYUDANTE MECANICO/);
  assert.match(operational, /value=\{site\.costCenter\}/);
  assert.match(operational, /return site\?\.costCenter \|\| ""/);
  assert.match(operational, /Obra eliminada correctamente/);
  assert.match(operational, /Asistencia mensual por trabajador/);
  assert.match(operational, /Primera Jornada \(AM\)/);
  assert.match(operational, /Total empresa/);
  assert.match(operational, /Resumen de saldos por trabajador/);
  assert.match(operational, /Número de folio/);
  assert.match(operational, /option value="Vacaciones">Vacaciones/);
  assert.match(operational, /Fecha desde/);
  assert.match(operational, /Fecha hasta/);
  assert.match(operational, /safePersonFilePart\(parts\.surnames\).*safePersonFilePart\(parts\.names\).*safeFilePart\(folio\)/);
  assert.match(operational, /vacationView === "individual"/);
  assert.match(operational, />Ver<\/button>.*>Descargar<\/button>/);
  assert.doesNotMatch(operational, /Por obra y día/);
  assert.match(app, /path: "\/licencias"/);

  for (const label of [
    "Trabajadores",
    "I. ANTECEDENTES PERSONALES",
    "II. ANTECEDENTES LABORALES",
    "III. INFORMACIÓN PREVISIONAL Y DE SALUD",
    "IV. INFORMACIÓN BANCARIA",
    "V. CONTACTO DE EMERGENCIA",
    "Carga masiva de trabajadores",
    "Enviar carga masiva",
  ]) assert.match(`${app}\n${operational}`, new RegExp(label, "i"));

  assert.match(operational, /\/personas\/nueva-solicitud/);
  assert.match(workersApi, /getDb\(\)/);
  assert.match(schema, /sqliteTable\("workers"/);
  assert.ok((operational.match(/useConnectedWorkers\(processes/g) ?? []).length >= 6);
  assert.match(operational, /Seleccionar trabajador/);
  assert.match(operational, /\/personas\/resumen\//);
  assert.match(app, /fetch\("\/api\/workers"/);
  assert.match(app, /\$\{men\} hombres · \$\{women\} mujeres/);
  for (const label of ["Información personal", "Asignación empresa", "Certificaciones / Cursos", "Exámenes", "Observaciones", "Historial", "Documentaci", "Cumplimiento personal", "Seleccionar trabajador"]) assert.match(operational, new RegExp(label, "i"));
  assert.match(operational, /api\/worker-records/);
  assert.match(operational, /api\/medical-leaves/);
  assert.equal(JSON.parse(hosting).r2, "FILES");
  assert.match(schema, /sqliteTable\("worker_records"/);
  assert.match(schema, /sqliteTable\("medical_leaves"/);
  assert.match(schema, /sqliteTable\("attendance_entries"/);
  assert.match(schema, /sqliteTable\("system_base_items"/);
  assert.match(schema, /sqliteTable\("document_templates"/);
  assert.match(schema, /sqliteTable\("user_profiles"/);
  for (const label of ["Bases del sistema", "Maestros", "Modificación masiva", "Seleccionar obra para modificar", "Vista general mensual", "Vista individual", "Archivo del trabajador"]) assert.match(`${app}\n${operational}`, new RegExp(label, "i"));
  assert.match(operational, /Solo el RUT es necesario/);
  assert.match(workersApi, /isBulkUpload \? !clean\(payload\.identityNumber\) : missingRequired\(payload\)/);
  assert.match(workersApi, /normalizeWorkerDate\(payload\.entryDate\)/);
  assert.match(workersApi, /export async function DELETE/);
  assert.doesNotMatch(app, /\["Feriados",/);
});

test("includes full attendance, editable bases, multiple contacts and Caja Los Andes", async () => {
  const [operational, attendanceApi, basesApi, cajaApi, recordsApi, schema, migration] = await Promise.all([
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
    readFile(new URL("app/api/attendance/route.ts", root), "utf8"),
    readFile(new URL("app/api/system-base-items/route.ts", root), "utf8"),
    readFile(new URL("app/api/caja-los-andes/route.ts", root), "utf8"),
    readFile(new URL("app/api/worker-records/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("drizzle/0007_daily_magneto.sql", root), "utf8"),
  ]);

  assert.match(attendanceApi, /rowsPerQuery = 6/);
  assert.match(operational, /const \[summaryWorker, setSummaryWorker\]/);
  assert.match(operational, /summaryWorkerOptions/);
  assert.match(operational, /Todos los trabajadores/);
  assert.match(attendanceApi, /export async function PATCH/);
  assert.match(attendanceApi, /Aprobar asistencia/);
  assert.match(operational, /\/asistencia\/revision\//);
  assert.match(operational, /Aprobar asistencia/);
  assert.match(operational, /Agregar otro contacto de emergencia/);
  assert.match(operational, /WorkerPersonalInformation/);
  assert.match(operational, /Caja Los Andes/);
  assert.doesNotMatch(operational, /const categories = \[[^\]]*"Cuentas"/);
  for (const health of ["FONASA", "Banmédica", "Vida Tres", "Fundación BancoEstado", "Isalud \\(Codelco\\)"]) assert.match(operational, new RegExp(health));
  assert.match(basesApi, /export async function PATCH/);
  assert.match(basesApi, /No se permiten registros repetidos/);
  assert.match(cajaApi, /Carga mensual Caja Los Andes/);
  assert.match(cajaApi, /Agregar montos Caja Los Andes/);
  assert.match(cajaApi, /normalizeAmount/);
  assert.match(operational, /Agregar montos por trabajador/);
  assert.match(operational, /Monto seguro de vida/);
  assert.match(operational, /latestCajaAndes = cajaAndesRecords\.find/);
  assert.match(operational, /displayedCajaAndesAmount/);
  assert.match(schema, /sqliteTable\("caja_andes_records"/);
  assert.match(schema, /emergencyContacts: text\("emergency_contacts"/);
  assert.match(recordsApi, /25 \* 1024 \* 1024/);
  for (const holiday of ["Año Nuevo", "Viernes Santo", "Independencia Nacional", "Navidad"]) assert.match(migration, new RegExp(holiday));
});

test("includes sequential vacation folios, approvals and approved-only balance deductions", async () => {
  const [app, operational, vacationsApi, schema, migration] = await Promise.all([
    readFile(new URL("app/SistemaApp.tsx", root), "utf8"),
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
    readFile(new URL("app/api/vacations/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("drizzle/0008_puzzling_fabian_cortez.sql", root), "utf8"),
  ]);
  assert.match(schema, /vacation_folio_sequences/);
  assert.match(migration, /last_folio.*578/s);
  assert.match(migration, /ROW_NUMBER\(\) OVER/);
  assert.match(operational, /Solicitudes pendientes/);
  assert.match(app, /function WorkInbox/);
  assert.match(app, /Vacaciones .* aproba.* pendiente/);
  assert.match(app, /\/vacaciones\/pendientes/);
  assert.match(operational, /Modificar solicitud/);
  assert.match(operational, /Documentos por cargar/);
  assert.match(operational, /Cargar PDF aprobado/);
  assert.match(operational, /Disponible despu.* de aprobar/);
  for (const status of ["Plazo Contrato", "Plazo Anexo", "Indefinido", "Con Carta", "Con Finiquito"]) assert.match(operational, new RegExp(status));
  assert.match(operational, /status-chip--contract/);
  assert.match(operational, /requiredLabor = \["Contrato", "Ingreso a la DT"/);
  assert.match(operational, /profile\?\.contractTerm === "Indefinido" \? \["Anexo Indefinido"\]/);
  assert.match(operational, /DD-MM-AAAA/);
  assert.match(operational, /Saldo actual/);
  assert.match(operational, /Nuevo saldo/);
  assert.match(operational, /approvedStatuses\.includes\(record\.status\)/);
  assert.match(vacationsApi, /Pendiente de aprobación/);
  assert.match(vacationsApi, /balanceBefore/);
  assert.match(vacationsApi, /balanceAfter/);
  assert.match(vacationsApi, /businessDaysBetween/);
  assert.match(vacationsApi, /La fecha Hasta no puede ser anterior/);
});

test("includes editable masters, medical leaves and daily attendance records", async () => {
  const [operational, attendanceApi, leavesApi, templatesApi, profilesApi, companiesApi, cajaApi, schema, migration] = await Promise.all([
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
    readFile(new URL("app/api/attendance/route.ts", root), "utf8"),
    readFile(new URL("app/api/medical-leaves/route.ts", root), "utf8"),
    readFile(new URL("app/api/document-templates/route.ts", root), "utf8"),
    readFile(new URL("app/api/user-profiles/route.ts", root), "utf8"),
    readFile(new URL("app/api/companies/route.ts", root), "utf8"),
    readFile(new URL("app/api/caja-los-andes/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("drizzle/0009_smart_quasar.sql", root), "utf8"),
  ]);
  assert.match(operational, /const \[entryWorker, setEntryWorker\]/);
  assert.match(operational, /Modificar día o respaldo/);
  assert.match(operational, /Cargar respaldo \(opcional\)/);
  assert.match(operational, /enviada nuevamente a revisión/);
  assert.match(attendanceApi, /Modificar asistencia diaria/);
  assert.match(attendanceApi, /status: "En revisión"/);
  assert.match(leavesApi, /export async function PATCH/);
  assert.match(leavesApi, /export async function DELETE/);
  assert.match(operational, /Modificar licencia médica/);
  assert.match(templatesApi, /export async function PATCH/);
  assert.match(templatesApi, /export async function DELETE/);
  assert.match(profilesApi, /export async function DELETE/);
  assert.match(companiesApi, /export async function PATCH/);
  assert.match(companiesApi, /export async function DELETE/);
  assert.match(cajaApi, /Eliminar registro Caja Los Andes/);
  assert.match(schema, /sqliteTable\("companies"/);
  assert.match(migration, /CREATE TABLE `companies`/);
});
