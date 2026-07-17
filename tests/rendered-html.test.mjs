import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("includes the requested connected dashboard and hiring flow", async () => {
  const [app, operational, layout, hosting] = await Promise.all([
    readFile(new URL("app/SistemaApp.tsx", root), "utf8"),
    readFile(new URL("app/OperationalModules.tsx", root), "utf8"),
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
    "Ir a Personas",
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
});
