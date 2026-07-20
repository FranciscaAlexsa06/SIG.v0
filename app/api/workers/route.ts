import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, workers } from "../../../db/schema";

type WorkerPayload = {
  workerCode?: string;
  firstNames?: string;
  lastNames?: string;
  entryDate?: string;
  fullName?: string;
  identityNumber?: string;
  birthDate?: string;
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  educationLevel?: string;
  professionalTitle?: string;
  address?: string;
  commune?: string;
  region?: string;
  mobile?: string;
  email?: string;
  familyDependents?: string | number;
  disabilityOrInvalidity?: string;
  role?: string;
  workSite?: string;
  workSites?: string[] | string;
  contractTerm?: string;
  agreedSalary?: string | number;
  afp?: string;
  health?: string;
  isaprePlan?: string;
  bank?: string;
  accountType?: string;
  accountNumber?: string;
  requiresAdvance?: string | boolean;
  advanceAmount?: string | number;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyMobile?: string;
};

const requiredKeys: (keyof WorkerPayload)[] = ["entryDate", "identityNumber", "birthDate", "nationality", "gender", "maritalStatus", "educationLevel", "address", "commune", "region", "mobile", "email", "disabilityOrInvalidity", "role", "contractTerm", "agreedSalary", "afp", "health", "bank", "accountType", "accountNumber", "emergencyName", "emergencyRelationship", "emergencyMobile"];

function missingRequired(payload: WorkerPayload) { return requiredKeys.some((key) => !clean(payload[key])) || (!clean(payload.fullName) && (!clean(payload.firstNames) || !clean(payload.lastNames))) || cleanWorkSites(payload).length === 0; }

function clean(value: unknown) { return String(value ?? "").trim(); }

function normalizeWorkerDate(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const local = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (local) return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  if (/^\d{5}$/.test(raw)) { const serial = Number(raw); const date = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000); return date.toISOString().slice(0, 10); }
  return raw;
}

function cleanWorkSites(payload: WorkerPayload) {
  const raw = Array.isArray(payload.workSites) ? payload.workSites : clean(payload.workSites).split(/[|,]/);
  const sites = raw.map(clean).filter(Boolean);
  if (!sites.length && clean(payload.workSite)) sites.push(clean(payload.workSite));
  return [...new Set(sites)];
}

function workerValues(payload: WorkerPayload, source: string) {
  const sites = cleanWorkSites(payload);
  const firstNames = clean(payload.firstNames); const lastNames = clean(payload.lastNames); const fullName = [firstNames, lastNames].filter(Boolean).join(" ") || clean(payload.fullName);
  return {
    id: `TRA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    workerCode: clean(payload.workerCode), firstNames, lastNames,
    entryDate: normalizeWorkerDate(payload.entryDate), fullName, identityNumber: clean(payload.identityNumber), birthDate: normalizeWorkerDate(payload.birthDate), nationality: clean(payload.nationality), gender: clean(payload.gender), maritalStatus: clean(payload.maritalStatus), educationLevel: clean(payload.educationLevel), professionalTitle: clean(payload.professionalTitle), address: clean(payload.address), commune: clean(payload.commune), region: clean(payload.region), mobile: clean(payload.mobile), email: clean(payload.email), familyDependents: Number(payload.familyDependents ?? 0), disabilityOrInvalidity: clean(payload.disabilityOrInvalidity), role: clean(payload.role), workSite: sites[0] ?? "", workSites: JSON.stringify(sites), contractTerm: clean(payload.contractTerm), agreedSalary: Number(payload.agreedSalary ?? 0), afp: clean(payload.afp), health: clean(payload.health), isaprePlan: clean(payload.isaprePlan), bank: clean(payload.bank), accountType: clean(payload.accountType), accountNumber: clean(payload.accountNumber), requiresAdvance: payload.requiresAdvance === true || clean(payload.requiresAdvance).toLowerCase() === "sí" || clean(payload.requiresAdvance).toLowerCase() === "si", advanceAmount: Number(payload.advanceAmount ?? 0), emergencyName: clean(payload.emergencyName), emergencyRelationship: clean(payload.emergencyRelationship), emergencyMobile: clean(payload.emergencyMobile), source,
  };
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as WorkerPayload & { originalIdentityNumber?: string };
    const originalIdentityNumber = clean(body.originalIdentityNumber || body.identityNumber);
    if (!originalIdentityNumber) return Response.json({ error: "No se indicó el trabajador a editar." }, { status: 400 });
    if (missingRequired(body)) return Response.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    const { id: _newId, ...updates } = workerValues(body, "Edición individual");
    const [record] = await getDb().update(workers).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(workers.identityNumber, originalIdentityNumber)).returning();
    if (!record) return Response.json({ error: "No fue posible encontrar al trabajador." }, { status: 404 });
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Trabajadores", action: "Edición de ficha", recordId: record.id, detail: `Ficha actualizada sin eliminar antecedentes: ${record.fullName}` });
    return Response.json({ worker: record });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible editar al trabajador." }, { status: 500 });
  }
}

export async function GET() {
  try { return Response.json({ workers: await getDb().select().from(workers).orderBy(desc(workers.createdAt)).limit(2000) }); }
  catch (error) { return Response.json({ workers: [], error: error instanceof Error ? error.message : "No fue posible consultar los trabajadores." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  try {
    const rut = clean(new URL(request.url).searchParams.get("rut"));
    if (!rut) return Response.json({ error: "No se indicó el trabajador a eliminar." }, { status: 400 });
    const [record] = await getDb().delete(workers).where(eq(workers.identityNumber, rut)).returning();
    if (!record) return Response.json({ error: "No fue posible encontrar al trabajador." }, { status: 404 });
    await getDb().insert(auditEvents).values({ userName: "Francisca", module: "Trabajadores", action: "Eliminar ficha", recordId: record.id, detail: `Ficha eliminada: ${record.fullName || record.identityNumber}` });
    return Response.json({ deleted: true, worker: record });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la ficha." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as WorkerPayload | { workers?: WorkerPayload[] };
    const isBulkUpload = "workers" in body;
    const payloads: WorkerPayload[] = isBulkUpload ? body.workers ?? [] : [body as WorkerPayload];
    if (!payloads.length) return Response.json({ error: "No hay trabajadores para ingresar." }, { status: 400 });
    if (payloads.length > 2000) return Response.json({ error: "La carga admite hasta 2.000 trabajadores por archivo." }, { status: 400 });
    const invalid = payloads.findIndex((payload) => isBulkUpload ? !clean(payload.identityNumber) : missingRequired(payload));
    if (invalid >= 0) return Response.json({ error: isBulkUpload ? `Falta el RUT para identificar al trabajador en el registro ${invalid + 1}.` : `Faltan datos obligatorios en el registro ${invalid + 1}.` }, { status: 400 });
    const db = getDb();
    const saved = [];
    for (const payload of payloads) {
      const values = workerValues(payload, payloads.length > 1 ? "Carga masiva" : "Individual");
      const { id: _newId, ...updates } = values;
      const [record] = await db.insert(workers).values(values).onConflictDoUpdate({ target: workers.identityNumber, set: { ...updates, updatedAt: new Date().toISOString() } }).returning();
      saved.push(record);
    }
    await db.insert(auditEvents).values({ userName: "Francisca", module: "Trabajadores", action: payloads.length > 1 ? "Carga masiva" : "Ingreso individual", recordId: saved[0]?.id ?? "", detail: `${saved.length} trabajador(es) ingresado(s)` });
    return Response.json({ workers: saved }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible ingresar los trabajadores." }, { status: 500 });
  }
}
