import { desc, eq } from "drizzle-orm";
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

export async function DELETE(request: Request) {
  try {
    const workerRut = String(new URL(request.url).searchParams.get("workerRut") ?? "").trim();
    if (!workerRut) return Response.json({ error: "Selecciona el perfil que deseas eliminar." }, { status: 400 });
    const [current] = await getDb().select().from(userProfiles).where(eq(userProfiles.workerRut, workerRut)).limit(1);
    if (!current) return Response.json({ error: "No se encontró el perfil de usuario." }, { status: 404 });
    await getDb().delete(userProfiles).where(eq(userProfiles.workerRut, workerRut));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminar perfil de usuario", recordId: workerRut, detail: current.profile });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar el perfil." }, { status: 500 }); }
}
