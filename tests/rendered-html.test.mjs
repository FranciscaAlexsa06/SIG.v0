import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("includes the requested connected dashboard and hiring flow", async () => {
  const [app, operational, workersApi, schema, layout, hosting] = await Promise.all([
    readFile(new URL("app/SistemaApp.tsx", root), "utf8"),
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
    readFile(new URL("app/api/workers/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
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
  assert.match(operational, /Eliminar ficha/);
  assert.match(operational, /method: "DELETE"/);
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
  for (const label of ["Información personal", "Asignación empresa", "Certificaciones / Cursos", "Exámenes", "Observaciones", "Historial", "Contratos y anexos", "Cumplimiento personal", "Seleccionar trabajador"]) assert.match(operational, new RegExp(label, "i"));
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
