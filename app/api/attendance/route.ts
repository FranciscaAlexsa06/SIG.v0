import { desc, eq } from "drizzle-orm";
import { getDb, getFilesBucket } from "../../../db";
import { attendanceEntries, auditEvents } from "../../../db/schema";

type AttendanceInput = { workerRut: string; workerName: string; costCenter: string; states: string[]; amIn: string; amOut: string; pmIn: string; pmOut: string; fileField?: string };

export async function GET() {
  try { return Response.json({ entries: await getDb().select().from(attendanceEntries).orderBy(desc(attendanceEntries.date), desc(attendanceEntries.createdAt)).limit(5000) }); }
  catch (error) { return Response.json({ entries: [], error: error instanceof Error ? error.message : "No fue posible consultar la asistencia." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const date = String(form.get("date") ?? ""); const attachmentType = String(form.get("attachmentType") ?? "Respaldo individual");
    const rows = JSON.parse(String(form.get("rows") ?? "[]")) as AttendanceInput[];
    if (!date || !rows.length) return Response.json({ error: "Selecciona la fecha y la dotación." }, { status: 400 });
    const batchId = `ASI-${crypto.randomUUID().slice(0, 9).toUpperCase()}`;
    const values = [];
    for (const row of rows) {
      const candidate = row.fileField ? form.get(row.fileField) : null; const file = candidate instanceof File && candidate.size ? candidate : null;
      const contentType = file?.type || ""; const safeName = file?.name.replace(/[^a-zA-Z0-9._-]/g, "_") || ""; const fileKey = file ? `attendance/${date}/${batchId}-${row.workerRut.replace(/[^a-zA-Z0-9]/g, "")}-${safeName}` : "";
      if (file) await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
      values.push({ id: `ADE-${crypto.randomUUID().slice(0, 10).toUpperCase()}`, batchId, date, workerRut: row.workerRut, workerName: row.workerName, costCenter: row.costCenter, states: JSON.stringify(row.states), amIn: row.amIn, amOut: row.amOut, pmIn: row.pmIn, pmOut: row.pmOut, attachmentType, fileName: file?.name || "", fileKey, contentType, status: "En revisión" });
    }
    const saved = [];
    const rowsPerQuery = 6;
    for (let index = 0; index < values.length; index += rowsPerQuery) {
      saved.push(...await getDb().insert(attendanceEntries).values(values.slice(index, index + rowsPerQuery)).returning());
    }
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Asistencia", action: "Enviar a revisión", recordId: batchId, detail: `${saved.length} trabajador(es) informados el ${date}` });
    return Response.json({ entries: saved }, { status: 201 });
  } catch (error) { console.error("attendance-save-failed", error); return Response.json({ error: "No fue posible guardar la asistencia. Vuelve a intentarlo; si continúa, informa la fecha y la obra seleccionada." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await request.formData(); const id = String(form.get("id") ?? "").trim();
      if (!id) return Response.json({ error: "Selecciona el registro de asistencia que deseas modificar." }, { status: 400 });
      const [current] = await getDb().select().from(attendanceEntries).where(eq(attendanceEntries.id, id)).limit(1);
      if (!current) return Response.json({ error: "No se encontró el registro de asistencia." }, { status: 404 });
      const states = String(form.get("states") ?? current.states); const amIn = String(form.get("amIn") ?? current.amIn); const amOut = String(form.get("amOut") ?? current.amOut); const pmIn = String(form.get("pmIn") ?? current.pmIn); const pmOut = String(form.get("pmOut") ?? current.pmOut);
      let fileName = current.fileName; let fileKey = current.fileKey; let contentType = current.contentType; let attachmentType = current.attachmentType;
      const file = form.get("file");
      if (file instanceof File && file.size) {
        if (fileKey) await getFilesBucket().delete(fileKey);
        fileName = file.name; contentType = file.type || "application/octet-stream"; attachmentType = String(form.get("attachmentType") ?? "Respaldo individual");
        fileKey = `attendance/${current.date}/${current.batchId}/${current.workerRut.replace(/[^a-zA-Z0-9-]/g, "_")}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await getFilesBucket().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType } });
      }
      const [entry] = await getDb().update(attendanceEntries).set({ states, amIn, amOut, pmIn, pmOut, attachmentType, fileName, fileKey, contentType, status: "En revisión" }).where(eq(attendanceEntries.id, id)).returning();
      await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Asistencia", action: "Modificar asistencia diaria", recordId: id, detail: `${current.workerName} · ${current.date}` });
      return Response.json({ entry });
    }
    const body = await request.json() as { batchId?: string; action?: string; reason?: string };
    const batchId = String(body.batchId || "").trim(); const action = String(body.action || "").trim();
    if (!batchId || !["approve", "reject"].includes(action)) return Response.json({ error: "Selecciona el ingreso y la acción de revisión." }, { status: 400 });
    const current = await getDb().select().from(attendanceEntries).where(eq(attendanceEntries.batchId, batchId));
    if (!current.length) return Response.json({ error: "No se encontró el ingreso de asistencia." }, { status: 404 });
    if (!current.some((entry) => entry.status === "En revisión")) return Response.json({ error: "Este ingreso ya fue resuelto." }, { status: 409 });
    const status = action === "approve" ? "Aprobada" : "Rechazada"; const reason = String(body.reason || "").trim();
    await getDb().update(attendanceEntries).set({ status }).where(eq(attendanceEntries.batchId, batchId));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Asistencia", action: action === "approve" ? "Aprobar asistencia" : "Rechazar asistencia", recordId: batchId, detail: reason || `${current.length} trabajador(es)` });
    return Response.json({ status, updated: current.length });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible resolver la asistencia." }, { status: 500 }); }
}
