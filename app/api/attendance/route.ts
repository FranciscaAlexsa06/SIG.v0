import { desc } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { attendanceEntries, auditEvents } from "../../../db/schema";

type AttendanceInput = { workerRut: string; workerName: string; costCenter: string; states: string[]; amIn: string; amOut: string; pmIn: string; pmOut: string };

export async function GET() {
  try { return Response.json({ entries: await getDb().select().from(attendanceEntries).orderBy(desc(attendanceEntries.date), desc(attendanceEntries.createdAt)).limit(5000) }); }
  catch (error) { return Response.json({ entries: [], error: error instanceof Error ? error.message : "No fue posible consultar la asistencia." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const date = String(form.get("date") ?? ""); const attachmentType = String(form.get("attachmentType") ?? ""); const file = form.get("file");
    const rows = JSON.parse(String(form.get("rows") ?? "[]")) as AttendanceInput[];
    if (!date || !rows.length) return Response.json({ error: "Selecciona la fecha y la dotación." }, { status: 400 });
    if (!(file instanceof File) || !file.size) return Response.json({ error: "Debes cargar el archivo de respaldo." }, { status: 400 });
    const batchId = `ASI-${crypto.randomUUID().slice(0, 9).toUpperCase()}`; const contentType = file.type || "application/octet-stream"; const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); const fileKey = `attendance/${date}/${batchId}-${safeName}`;
    await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
    const saved = await getDb().insert(attendanceEntries).values(rows.map((row) => ({ id: `ADE-${crypto.randomUUID().slice(0, 10).toUpperCase()}`, batchId, date, workerRut: row.workerRut, workerName: row.workerName, costCenter: row.costCenter, states: JSON.stringify(row.states), amIn: row.amIn, amOut: row.amOut, pmIn: row.pmIn, pmOut: row.pmOut, attachmentType, fileName: file.name, fileKey, contentType, status: "En revisión" }))).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Asistencia", action: "Enviar a revisión", recordId: batchId, detail: `${saved.length} trabajador(es) informados el ${date}` });
    return Response.json({ entries: saved }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar la asistencia." }, { status: 500 }); }
}
