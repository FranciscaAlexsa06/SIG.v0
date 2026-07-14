import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, processes } from "../../../db/schema";

type HiringPayload = {
  rut?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  costCenter?: string;
  role?: string;
  workday?: string;
  startDate?: string;
  documents?: string[];
};

export async function GET() {
  try {
    const rows = await getDb().select().from(processes).orderBy(desc(processes.createdAt)).limit(100);
    return Response.json({ processes: rows });
  } catch (error) {
    return Response.json({ processes: [], error: error instanceof Error ? error.message : "No fue posible consultar los procesos." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as HiringPayload;
    const required = [payload.rut, payload.firstName, payload.lastName, payload.company, payload.costCenter, payload.role, payload.workday, payload.startDate];
    if (required.some((value) => !value?.trim())) return Response.json({ error: "Completa los datos obligatorios antes de crear el proceso." }, { status: 400 });
    const id = `CON-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const personName = `${payload.firstName!.trim()} ${payload.lastName!.trim()}`;
    const db = getDb();
    const [process] = await db.insert(processes).values({
      id,
      type: "Nueva contratación",
      rut: payload.rut!.trim(),
      personName,
      company: payload.company!.trim(),
      costCenter: payload.costCenter!.trim(),
      role: payload.role!.trim(),
      workday: payload.workday!.trim(),
      startDate: payload.startDate!,
      requiredDocuments: JSON.stringify(payload.documents ?? []),
    }).returning();
    await db.insert(auditEvents).values({ userName: "Francisca", module: "Procesos", action: "Crear nueva contratación", recordId: id, detail: `Proceso iniciado para ${personName}` });
    return Response.json({ process }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible crear el proceso." }, { status: 500 });
  }
}
