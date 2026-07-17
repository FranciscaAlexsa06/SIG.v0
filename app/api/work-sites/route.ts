import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, workSites } from "../../../db/schema";

function clean(value: unknown) { return String(value ?? "").trim(); }

export async function GET() {
  try { return Response.json({ workSites: await getDb().select().from(workSites).orderBy(desc(workSites.createdAt)).limit(1000) }); }
  catch (error) { return Response.json({ workSites: [], error: error instanceof Error ? error.message : "No fue posible consultar las obras." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = clean(body.name);
    if (!name) return Response.json({ error: "El nombre de la obra es obligatorio." }, { status: 400 });
    const values = { costCenter: clean(body.costCenter), company: clean(body.company), client: "", address: clean(body.address), region: clean(body.region), commune: clean(body.commune), status: clean(body.status) || "Activa" };
    const [record] = await getDb().insert(workSites).values({ id: `OBR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name, ...values }).onConflictDoUpdate({ target: workSites.name, set: { ...values, updatedAt: new Date().toISOString() } }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Ingreso de obra", recordId: record.id, detail: record.name });
    return Response.json({ workSite: record }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible ingresar la obra." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const id = clean(body.id); const name = clean(body.name);
    if (!id || !name) return Response.json({ error: "Selecciona una obra e indica su nombre." }, { status: 400 });
    const [record] = await getDb().update(workSites).set({ name, costCenter: clean(body.costCenter), company: clean(body.company), client: "", address: clean(body.address), region: clean(body.region), commune: clean(body.commune), status: clean(body.status) || "Activa", updatedAt: new Date().toISOString() }).where(eq(workSites.id, id)).returning();
    if (!record) return Response.json({ error: "No se encontró la obra." }, { status: 404 });
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Modificación de obra", recordId: record.id, detail: record.name });
    return Response.json({ workSite: record });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible modificar la obra." }, { status: 500 }); }
}
