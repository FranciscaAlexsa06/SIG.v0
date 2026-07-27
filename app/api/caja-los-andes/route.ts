import { and, desc, eq } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { auditEvents, cajaAndesRecords } from "../../../db/schema";

type CajaRow = { workerRut?: string; workerName?: string; credits?: string; insurances?: string; detail?: string };
function clean(value: unknown) { return String(value ?? "").trim(); }
function normalizeRut(value: unknown) { return clean(value).replace(/[.\s]/g, "").toUpperCase(); }

export async function GET(request: Request) {
  try {
    const url = new URL(request.url); const rut = normalizeRut(url.searchParams.get("rut")); const period = clean(url.searchParams.get("period"));
    const condition = rut && period ? and(eq(cajaAndesRecords.workerRut, rut), eq(cajaAndesRecords.period, period)) : rut ? eq(cajaAndesRecords.workerRut, rut) : period ? eq(cajaAndesRecords.period, period) : undefined;
    const query = getDb().select().from(cajaAndesRecords);
    const records = condition ? await query.where(condition).orderBy(desc(cajaAndesRecords.period)) : await query.orderBy(desc(cajaAndesRecords.period)).limit(5000);
    return Response.json({ records }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return Response.json({ records: [], error: error instanceof Error ? error.message : "No fue posible consultar Caja Los Andes." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const period = clean(form.get("period")); const file = form.get("file");
    const rawRows = JSON.parse(clean(form.get("rows")) || "[]") as CajaRow[];
    if (!/^\d{4}-\d{2}$/.test(period) || !(file instanceof File) || !file.size || !rawRows.length) return Response.json({ error: "Selecciona el mes, el archivo y revisa que contenga trabajadores." }, { status: 400 });
    if (rawRows.length > 2000) return Response.json({ error: "El archivo admite hasta 2.000 trabajadores." }, { status: 400 });
    const rows = [...new Map(rawRows.filter((row) => normalizeRut(row.workerRut)).map((row) => [normalizeRut(row.workerRut), row])).values()];
    if (!rows.length) return Response.json({ error: "No se encontró una columna RUT con trabajadores." }, { status: 400 });
    const existing = await getDb().select().from(cajaAndesRecords).where(eq(cajaAndesRecords.period, period));
    for (const fileKey of [...new Set(existing.map((record) => record.fileKey).filter(Boolean))]) await getFilesBucket().delete(fileKey);
    await getDb().delete(cajaAndesRecords).where(eq(cajaAndesRecords.period, period));
    const uploadId = crypto.randomUUID().slice(0, 10).toUpperCase(); const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `caja-los-andes/${period}/${uploadId}-${safeName}`; const contentType = file.type || "text/csv";
    await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
    const saved = [];
    for (const row of rows) {
      const [record] = await getDb().insert(cajaAndesRecords).values({ id: `CLA-${crypto.randomUUID().slice(0, 10).toUpperCase()}`, period, workerRut: normalizeRut(row.workerRut), workerName: clean(row.workerName), credits: clean(row.credits), insurances: clean(row.insurances), detail: clean(row.detail), fileName: file.name, fileKey, contentType }).returning();
      saved.push(record);
    }
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Carga mensual Caja Los Andes", recordId: uploadId, detail: `${period}: ${saved.length} trabajador(es)` });
    return Response.json({ records: saved }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar el archivo de Caja Los Andes." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const period = clean(new URL(request.url).searchParams.get("period"));
    if (!period) return Response.json({ error: "Selecciona el mes que deseas eliminar." }, { status: 400 });
    const existing = await getDb().select().from(cajaAndesRecords).where(eq(cajaAndesRecords.period, period));
    for (const fileKey of [...new Set(existing.map((record) => record.fileKey).filter(Boolean))]) await getFilesBucket().delete(fileKey);
    await getDb().delete(cajaAndesRecords).where(eq(cajaAndesRecords.period, period));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminar carga Caja Los Andes", recordId: period, detail: `${existing.length} registro(s)` });
    return Response.json({ deleted: existing.length });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la carga." }, { status: 500 }); }
}
