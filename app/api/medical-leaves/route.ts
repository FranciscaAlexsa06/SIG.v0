import { desc, eq } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { auditEvents, medicalLeaves } from "../../../db/schema";

export async function GET(request: Request) {
  try { const rut = new URL(request.url).searchParams.get("rut"); const query = getDb().select().from(medicalLeaves); const rows = rut ? await query.where(eq(medicalLeaves.workerRut, rut)).orderBy(desc(medicalLeaves.dateFrom)) : await query.orderBy(desc(medicalLeaves.dateFrom)); return Response.json({ medicalLeaves: rows }); }
  catch (error) { return Response.json({ medicalLeaves: [], error: error instanceof Error ? error.message : "No fue posible consultar las licencias." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const contentTypeHeader = request.headers.get("content-type") ?? ""; const source = contentTypeHeader.includes("multipart/form-data") ? await request.formData() : await request.json() as Record<string, unknown>;
    const read = (key: string) => source instanceof FormData ? String(source.get(key) ?? "").trim() : String(source[key] ?? "").trim();
    const workerRut = read("workerRut"); const workerName = read("workerName"); const dateFrom = read("from") || read("dateFrom"); const dateTo = read("to") || read("dateTo"); const folio = read("folio");
    if (!workerRut || !workerName || !dateFrom || !dateTo || !folio) return Response.json({ error: "Completa los datos obligatorios de la licencia." }, { status: 400 });
    const id = read("id") || `LIC-${crypto.randomUUID().slice(0, 9).toUpperCase()}`; let fileName = ""; let fileKey = ""; let contentType = ""; const file = source instanceof FormData ? source.get("file") : null;
    if (file instanceof File && file.size) { fileName = file.name; contentType = file.type || "application/octet-stream"; fileKey = `medical-leaves/${workerRut.replace(/[^a-zA-Z0-9-]/g, "_")}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } }); }
    const [record] = await getDb().insert(medicalLeaves).values({ id, workerRut, workerName, costCenter: read("costCenter"), dateFrom, dateTo, days: Number(read("days")), folio, specialty: read("specialty"), status: read("status") || "Registrada", fileName, fileKey, contentType }).onConflictDoNothing().returning();
    if (record) await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Licencias Médicas", action: "Registrar licencia", recordId: id, detail: `Folio ${folio} de ${workerName}` });
    return Response.json({ medicalLeave: record ?? null }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar la licencia médica." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const form = await request.formData();
    const read = (key: string) => String(form.get(key) ?? "").trim();
    const id = read("id");
    if (!id) return Response.json({ error: "Selecciona la licencia que deseas modificar." }, { status: 400 });
    const [current] = await getDb().select().from(medicalLeaves).where(eq(medicalLeaves.id, id)).limit(1);
    if (!current) return Response.json({ error: "No se encontró la licencia médica." }, { status: 404 });
    const workerRut = read("workerRut"); const workerName = read("workerName"); const dateFrom = read("from") || read("dateFrom"); const dateTo = read("to") || read("dateTo"); const folio = read("folio");
    if (!workerRut || !workerName || !dateFrom || !dateTo || !folio) return Response.json({ error: "Completa los datos obligatorios de la licencia." }, { status: 400 });
    let fileName = current.fileName; let fileKey = current.fileKey; let contentType = current.contentType;
    const file = form.get("file");
    if (file instanceof File && file.size) {
      if (fileKey) await getFilesBucket().delete(fileKey);
      fileName = file.name; contentType = file.type || "application/octet-stream";
      fileKey = `medical-leaves/${workerRut.replace(/[^a-zA-Z0-9-]/g, "_")}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
    }
    const [record] = await getDb().update(medicalLeaves).set({ workerRut, workerName, costCenter: read("costCenter"), dateFrom, dateTo, days: Number(read("days")), folio, specialty: read("specialty"), status: read("status") || current.status, fileName, fileKey, contentType }).where(eq(medicalLeaves.id, id)).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Licencias Médicas", action: "Modificar licencia", recordId: id, detail: `Folio ${folio} de ${workerName}` });
    return Response.json({ medicalLeave: record });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible modificar la licencia médica." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = String(new URL(request.url).searchParams.get("id") ?? "").trim();
    if (!id) return Response.json({ error: "Selecciona la licencia que deseas eliminar." }, { status: 400 });
    const [current] = await getDb().select().from(medicalLeaves).where(eq(medicalLeaves.id, id)).limit(1);
    if (!current) return Response.json({ error: "No se encontró la licencia médica." }, { status: 404 });
    if (current.fileKey) await getFilesBucket().delete(current.fileKey);
    await getDb().delete(medicalLeaves).where(eq(medicalLeaves.id, id));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Licencias Médicas", action: "Eliminar licencia", recordId: id, detail: `Folio ${current.folio} de ${current.workerName}` });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la licencia médica." }, { status: 500 }); }
}
