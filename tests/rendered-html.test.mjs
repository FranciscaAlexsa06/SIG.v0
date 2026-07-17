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
  assert.match(styles, /login-hero:after[\s\S]*center\/contain no-repeat/);
  assert.match(styles, /login-hero:before\s*\{\s*content:none/);
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
  assert.match(operational, /Ver resumen/);
  assert.match(operational, /\/personas\/resumen\//);
  assert.match(app, /fetch\("\/api\/workers"/);
  for (const label of ["Información personal", "Asignación empresa", "Certificaciones / Cursos", "Exámenes", "Observaciones", "Historial", "Contratos y anexos", "Cumplimiento personal", "Ver resumen"]) assert.match(operational, new RegExp(label, "i"));
  assert.match(operational, /api\/worker-records/);
  assert.match(operational, /api\/medical-leaves/);
  assert.equal(JSON.parse(hosting).r2, "FILES");
  assert.match(schema, /sqliteTable\("worker_records"/);
  assert.match(schema, /sqliteTable\("medical_leaves"/);
});
