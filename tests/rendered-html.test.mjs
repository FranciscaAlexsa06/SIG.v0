import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("includes the requested connected dashboard and hiring flow", async () => {
  const [app, layout, hosting] = await Promise.all([
    readFile(new URL("app/SistemaApp.tsx", root), "utf8"),
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
});
