import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, companies } from "../../../db/schema";

function clean(value: unknown) { return String(value ?? "").trim(); }

export async function GET() {
  try { return Response.json({ companies: await getDb().select().from(companies).orderBy(desc(companies.createdAt)) }, { headers: { "cache-control": "no-store" } }); }
  catch (error) { return Response.json({ companies: [], error: error instanceof Error ? error.message : "No fue posible consultar las empresas." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const legalName = clean(body.legalName); const rut = clean(body.rut);
    if (!legalName || !rut) return Response.json({ error: "Completa la razón social y el RUT." }, { status: 400 });
    const id = clean(body.id) || `EMP-${crypto.randomUUID().slice(0, 9).toUpperCase()}`;
    const [company] = await getDb().insert(companies).values({ id, legalName, rut, tradeName: clean(body.tradeName), representative: clean(body.representative), address: clean(body.address), status: clean(body.status) || "Activa" }).returning();
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Ingresar empresa", recordId: id, detail: `${legalName} · ${rut}` });
    return Response.json({ company }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return Response.json({ error: message.includes("UNIQUE") ? "Ya existe una empresa con ese RUT." : "No fue posible ingresar la empresa." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>; const id = clean(body.id); const legalName = clean(body.legalName); const rut = clean(body.rut);
    if (!id || !legalName || !rut) return Response.json({ error: "Completa la empresa que deseas modificar." }, { status: 400 });
    const [company] = await getDb().update(companies).set({ legalName, rut, tradeName: clean(body.tradeName), representative: clean(body.representative), address: clean(body.address), status: clean(body.status) || "Activa", updatedAt: new Date().toISOString() }).where(eq(companies.id, id)).returning();
    if (!company) return Response.json({ error: "No se encontró la empresa." }, { status: 404 });
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Modificar empresa", recordId: id, detail: `${legalName} · ${rut}` });
    return Response.json({ company });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return Response.json({ error: message.includes("UNIQUE") ? "Ya existe una empresa con ese RUT." : "No fue posible modificar la empresa." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = clean(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Selecciona la empresa que deseas eliminar." }, { status: 400 });
    const [current] = await getDb().select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!current) return Response.json({ error: "No se encontró la empresa." }, { status: 404 });
    await getDb().delete(companies).where(eq(companies.id, id));
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Administración", action: "Eliminar empresa", recordId: id, detail: current.legalName });
    return Response.json({ deleted: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la empresa." }, { status: 500 }); }
}
