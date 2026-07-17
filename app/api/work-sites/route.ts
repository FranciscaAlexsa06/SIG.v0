import { desc } from "drizzle-orm";
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
    const [record] = await getDb().insert(workSites).values({ id: `OBR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name, costCenter: clean(body.costCenter), company: clean(body.company), client: clean(body.client), address: clean(body.address), status: clean(body.status) || "Activa" }).onConflictDoUpdate({ target: workSites.name, set: { costCenter: clean(body.costCenter), company: clean(body.company), client: clean(body.client), address: clean(body.address), status: clean(body.status) || "Activa", updatedAt: new Date().toISOString() } }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Ingreso de obra", recordId: record.id, detail: record.name });
    return Response.json({ workSite: record }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible ingresar la obra." }, { status: 500 }); }
}
