import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, userProfiles } from "../../../db/schema";

export async function GET() {
  try { return Response.json({ profiles: await getDb().select().from(userProfiles).orderBy(desc(userProfiles.updatedAt)) }); }
  catch (error) { return Response.json({ profiles: [], error: error instanceof Error ? error.message : "No fue posible consultar los perfiles." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const workerRut = String(body.workerRut ?? "").trim(); const workerName = String(body.workerName ?? "").trim();
    if (!workerRut || !workerName || !body.profile) return Response.json({ error: "Selecciona un trabajador y un perfil." }, { status: 400 });
    const [record] = await getDb().insert(userProfiles).values({ id: `USR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, workerRut, workerName, profile: String(body.profile), scope: String(body.scope ?? "Total empresa"), active: body.active !== false }).onConflictDoUpdate({ target: userProfiles.workerRut, set: { workerName, profile: String(body.profile), scope: String(body.scope ?? "Total empresa"), active: body.active !== false, updatedAt: new Date().toISOString() } }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Asignación de perfil", recordId: workerRut, detail: record.profile });
    return Response.json({ profile: record }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar el perfil." }, { status: 500 }); }
}
