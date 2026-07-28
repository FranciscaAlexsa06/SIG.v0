import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, systemBaseItems, vacationFolioSequences, workerRecords, workers } from "../../../db/schema";

const approvedStatuses = ["Aprobada", "Firmado", "Firmada", "Completado"];
function clean(value: unknown) { return String(value ?? "").trim(); }
function metadataOf(value: string) { try { return JSON.parse(value || "{}") as Record<string, unknown>; } catch { return {}; } }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value); }
function completeMonths(entryDate: string) {
  if (!validDate(entryDate)) return 0;
  const entry = new Date(`${entryDate}T12:00:00`); const now = new Date();
  let months = (now.getFullYear() - entry.getFullYear()) * 12 + now.getMonth() - entry.getMonth();
  if (now.getDate() < entry.getDate()) months -= 1;
  return Math.max(0, months);
}
async function holidayDates() {
  const rows = await getDb().select().from(systemBaseItems).where(and(eq(systemBaseItems.category, "Feriados"), eq(systemBaseItems.active, true)));
  return new Set(rows.map((row) => row.value).filter(validDate));
}
function businessDaysBetween(from: string, to: string, holidays: Set<string>) {
  if (!validDate(from) || !validDate(to) || from > to) return 0;
  const start = new Date(`${from}T12:00:00`); const end = new Date(`${to}T12:00:00`); let total = 0;
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const iso = day.toISOString().slice(0, 10);
    if (day.getDay() !== 0 && day.getDay() !== 6 && !holidays.has(iso)) total += 1;
  }
  return total;
}
async function balanceFor(workerRut: string, excludedRecordId = "") {
  const [worker] = await getDb().select().from(workers).where(eq(workers.identityNumber, workerRut)).limit(1);
  if (!worker) throw new Error("No se encontró la ficha del trabajador.");
  const legal = Math.round(completeMonths(worker.entryDate) * 1.25 * 100) / 100;
  const records = await getDb().select().from(workerRecords).where(and(eq(workerRecords.workerRut, workerRut), eq(workerRecords.category, "Vacaciones")));
  const taken = records.filter((record) => record.id !== excludedRecordId && approvedStatuses.includes(record.status) && ["Solicitud de vacaciones", "Vacaciones"].includes(record.subtype)).reduce((sum, record) => sum + Number(metadataOf(record.metadata).businessDays || 0), 0);
  return { legal, taken, available: Math.max(0, Math.round((legal - taken) * 100) / 100) };
}
async function allocateFolio() {
  const db = getDb();
  await db.insert(vacationFolioSequences).values({ id: "VAC", lastFolio: 578 }).onConflictDoNothing();
  const [sequence] = await db.update(vacationFolioSequences).set({ lastFolio: sql`${vacationFolioSequences.lastFolio} + 1`, updatedAt: new Date().toISOString() }).where(eq(vacationFolioSequences.id, "VAC")).returning();
  return sequence.lastFolio;
}

export async function GET() {
  try {
    const [sequence] = await getDb().select().from(vacationFolioSequences).where(eq(vacationFolioSequences.id, "VAC")).limit(1);
    const records = await getDb().select().from(workerRecords).where(and(eq(workerRecords.category, "Vacaciones"), eq(workerRecords.subtype, "Solicitud de vacaciones"))).orderBy(desc(workerRecords.createdAt)).limit(2000);
    return Response.json({ records, nextFolio: (sequence?.lastFolio ?? 578) + 1 }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return Response.json({ records: [], nextFolio: 579, error: error instanceof Error ? error.message : "No fue posible consultar las solicitudes." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const workerRut = clean(body.workerRut); const from = clean(body.from); const to = clean(body.to);
    if (!workerRut || !validDate(from) || !validDate(to)) return Response.json({ error: "Selecciona el trabajador y completa las fechas." }, { status: 400 });
    if (from > to) return Response.json({ error: "La fecha Hasta no puede ser anterior a la fecha Desde." }, { status: 400 });
    const days = businessDaysBetween(from, to, await holidayDates());
    if (!days) return Response.json({ error: "El período no contiene días hábiles para solicitar." }, { status: 400 });
    const balance = await balanceFor(workerRut);
    if (days > balance.available) return Response.json({ error: `La solicitud es por ${days} días y el saldo disponible es ${balance.available.toLocaleString("es-CL")} días.` }, { status: 400 });
    const folio = await allocateFolio(); const id = `REG-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const metadata = JSON.stringify({ folio, businessDays: days, requestedAt: new Date().toISOString() });
    const [record] = await getDb().insert(workerRecords).values({ id, workerRut, category: "Vacaciones", subtype: "Solicitud de vacaciones", title: String(folio), issueDate: from, expiryDate: to, status: "Pendiente de aprobación", detail: `${days} días hábiles`, metadata }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Vacaciones", action: "Enviar solicitud", recordId: id, detail: `Folio ${folio}: ${days} días` });
    return Response.json({ record, folio, businessDays: days }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible enviar la solicitud." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const id = clean(body.id); const action = clean(body.action);
    const [record] = await getDb().select().from(workerRecords).where(eq(workerRecords.id, id)).limit(1);
    if (!record || record.category !== "Vacaciones" || record.subtype !== "Solicitud de vacaciones") return Response.json({ error: "No se encontró la solicitud." }, { status: 404 });
    if (!["Pendiente de aprobación", "Pendiente de firma"].includes(record.status)) return Response.json({ error: "Esta solicitud ya fue resuelta." }, { status: 409 });
    const oldMeta = metadataOf(record.metadata); const folio = Number(oldMeta.folio || record.title);
    if (action === "correct") {
      const from = clean(body.from); const to = clean(body.to);
      if (!validDate(from) || !validDate(to) || from > to) return Response.json({ error: "Indica un período válido, con Desde anterior o igual a Hasta." }, { status: 400 });
      const days = businessDaysBetween(from, to, await holidayDates()); const balance = await balanceFor(record.workerRut, record.id);
      if (!days) return Response.json({ error: "El período corregido no contiene días hábiles." }, { status: 400 });
      if (days > balance.available) return Response.json({ error: `El período requiere ${days} días y el saldo disponible es ${balance.available.toLocaleString("es-CL")} días.` }, { status: 400 });
      const metadata = JSON.stringify({ ...oldMeta, folio, businessDays: days, correctedAt: new Date().toISOString() });
      const [updated] = await getDb().update(workerRecords).set({ issueDate: from, expiryDate: to, status: "Pendiente de aprobación", detail: `${days} días hábiles`, metadata, updatedAt: new Date().toISOString() }).where(eq(workerRecords.id, id)).returning();
      await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Vacaciones", action: "Corregir fechas de solicitud", recordId: id, detail: `Folio ${folio}: ${from} al ${to}` });
      return Response.json({ record: updated, businessDays: days });
    }
    if (action === "reject") {
      const reason = clean(body.reason) || "Rechazada por RRHH"; const metadata = JSON.stringify({ ...oldMeta, folio, rejectedAt: new Date().toISOString(), rejectionReason: reason });
      const [updated] = await getDb().update(workerRecords).set({ status: "Rechazada", detail: reason, metadata, updatedAt: new Date().toISOString() }).where(eq(workerRecords.id, id)).returning();
      await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Vacaciones", action: "Rechazar solicitud", recordId: id, detail: `Folio ${folio}: ${reason}` });
      return Response.json({ record: updated });
    }
    if (action !== "approve") return Response.json({ error: "Indica si deseas aprobar o rechazar." }, { status: 400 });
    if (!validDate(record.issueDate) || !validDate(record.expiryDate) || record.issueDate > record.expiryDate) return Response.json({ error: "Las fechas de esta solicitud son inválidas. Usa Modificar solicitud antes de aprobarla." }, { status: 400 });
    const days = businessDaysBetween(record.issueDate, record.expiryDate, await holidayDates()); const balance = await balanceFor(record.workerRut, record.id);
    if (days > balance.available) return Response.json({ error: `No se puede aprobar: solicita ${days} días y el saldo disponible es ${balance.available.toLocaleString("es-CL")} días.` }, { status: 400 });
    const newBalance = Math.round((balance.available - days) * 100) / 100;
    const metadata = JSON.stringify({ ...oldMeta, folio, businessDays: days, approvedAt: new Date().toISOString(), balanceBefore: balance.available, balanceAfter: newBalance });
    const [updated] = await getDb().update(workerRecords).set({ status: "Aprobada", detail: `${days} días hábiles aprobados`, metadata, updatedAt: new Date().toISOString() }).where(eq(workerRecords.id, id)).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Vacaciones", action: "Aprobar solicitud", recordId: id, detail: `Folio ${folio}: saldo ${balance.available} - ${days} = ${newBalance}` });
    return Response.json({ record: updated, balanceBefore: balance.available, requestedDays: days, balanceAfter: newBalance });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible resolver la solicitud." }, { status: 500 }); }
}
