import { and, desc, eq, ne, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, systemBaseItems } from "../../../db/schema";

function clean(value: unknown) { return String(value ?? "").trim(); }

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category"); const query = getDb().select().from(systemBaseItems).orderBy(desc(systemBaseItems.createdAt));
    const items = category ? await query.where(eq(systemBaseItems.category, category)) : await query;
    return Response.json({ items });
  } catch (error) { return Response.json({ items: [], error: error instanceof Error ? error.message : "No fue posible consultar las bases." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const category = clean(body.category); const name = clean(body.name);
    if (!category || !name) return Response.json({ error: "Indica la categoría y el nombre." }, { status: 400 });
    const value = clean(body.value);
    const [duplicate] = await getDb().select().from(systemBaseItems).where(and(eq(systemBaseItems.category, category), value ? or(sql`lower(trim(${systemBaseItems.name})) = lower(trim(${name}))`, eq(systemBaseItems.value, value)) : sql`lower(trim(${systemBaseItems.name})) = lower(trim(${name}))`)).limit(1);
    if (duplicate) return Response.json({ error: `${name} ya existe en ${category}. No se permiten registros repetidos.` }, { status: 409 });
    const [item] = await getDb().insert(systemBaseItems).values({ id: `BAS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, category, name, value, active: clean(body.active || "true") !== "false" }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Ingreso en bases del sistema", recordId: item.id, detail: `${category}: ${name}` });
    return Response.json({ item }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar el registro." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const id = clean(body.id); const category = clean(body.category); const name = clean(body.name);
    if (!id || !category || !name) return Response.json({ error: "Completa el registro que deseas modificar." }, { status: 400 });
    const value = clean(body.value);
    const [duplicate] = await getDb().select().from(systemBaseItems).where(and(eq(systemBaseItems.category, category), ne(systemBaseItems.id, id), value ? or(sql`lower(trim(${systemBaseItems.name})) = lower(trim(${name}))`, eq(systemBaseItems.value, value)) : sql`lower(trim(${systemBaseItems.name})) = lower(trim(${name}))`)).limit(1);
    if (duplicate) return Response.json({ error: `${name} ya existe en ${category}. No se permiten registros repetidos.` }, { status: 409 });
    const [item] = await getDb().update(systemBaseItems).set({ name, value, active: clean(body.active || "true") !== "false", updatedAt: new Date().toISOString() }).where(eq(systemBaseItems.id, id)).returning();
    if (!item) return Response.json({ error: "No se encontró el registro." }, { status: 404 });
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Modificación en bases del sistema", recordId: item.id, detail: `${category}: ${name}` });
    return Response.json({ item });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible modificar el registro." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = clean(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Selecciona el registro que deseas eliminar." }, { status: 400 });
    const [existing] = await getDb().select().from(systemBaseItems).where(eq(systemBaseItems.id, id)).limit(1);
    if (!existing) return Response.json({ error: "No se encontró el registro." }, { status: 404 });
    await getDb().delete(systemBaseItems).where(eq(systemBaseItems.id, id));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminación en bases del sistema", recordId: existing.id, detail: `${existing.category}: ${existing.name}` });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar el registro." }, { status: 500 }); }
}
