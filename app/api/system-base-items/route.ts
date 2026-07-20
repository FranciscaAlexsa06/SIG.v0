import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, systemBaseItems } from "../../../db/schema";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category"); let query = getDb().select().from(systemBaseItems).orderBy(desc(systemBaseItems.createdAt));
    const items = category ? await query.where(eq(systemBaseItems.category, category)) : await query;
    return Response.json({ items });
  } catch (error) { return Response.json({ items: [], error: error instanceof Error ? error.message : "No fue posible consultar las bases." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const category = String(body.category ?? "").trim(); const name = String(body.name ?? "").trim();
    if (!category || !name) return Response.json({ error: "Indica la categoría y el nombre." }, { status: 400 });
    const [item] = await getDb().insert(systemBaseItems).values({ id: `BAS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, category, name, value: String(body.value ?? "").trim(), active: body.active !== false }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Ingreso en bases del sistema", recordId: item.id, detail: `${category}: ${name}` });
    return Response.json({ item }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar el registro." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error: "Selecciona el cargo que deseas eliminar." }, { status: 400 });
    const [existing] = await getDb().select().from(systemBaseItems).where(eq(systemBaseItems.id, id)).limit(1);
    if (!existing || existing.category !== "Cargos") return Response.json({ error: "No se encontró el cargo." }, { status: 404 });
    await getDb().delete(systemBaseItems).where(eq(systemBaseItems.id, id));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminación de cargo", recordId: existing.id, detail: existing.name });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar el cargo." }, { status: 500 }); }
}
