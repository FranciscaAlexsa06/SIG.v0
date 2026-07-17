import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditEvents, workers } from "../../../db/schema";

type WorkerPayload = {
  entryDate?: string;
  fullName?: string;
  identityNumber?: string;
  birthDate?: string;
  nationality?: string;
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
  contractTerm?: string;
  agreedSalary?: string | number;
  afp?: string;
  health?: string;
  isaprePlan?: string;
  bank?: string;
  accountType?: string;
  accountNumber?: string;
  requiresAdvance?: string | boolean;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyMobile?: string;
};

const requiredKeys: (keyof WorkerPayload)[] = ["entryDate", "fullName", "identityNumber", "birthDate", "nationality", "maritalStatus", "educationLevel", "address", "commune", "region", "mobile", "email", "disabilityOrInvalidity", "role", "workSite", "contractTerm", "agreedSalary", "afp", "health", "bank", "accountType", "accountNumber", "emergencyName", "emergencyRelationship", "emergencyMobile"];

function clean(value: unknown) { return String(value ?? "").trim(); }

function workerValues(payload: WorkerPayload, source: string) {
  return {
    id: `TRA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    entryDate: clean(payload.entryDate), fullName: clean(payload.fullName), identityNumber: clean(payload.identityNumber), birthDate: clean(payload.birthDate), nationality: clean(payload.nationality), maritalStatus: clean(payload.maritalStatus), educationLevel: clean(payload.educationLevel), professionalTitle: clean(payload.professionalTitle), address: clean(payload.address), commune: clean(payload.commune), region: clean(payload.region), mobile: clean(payload.mobile), email: clean(payload.email), familyDependents: Number(payload.familyDependents ?? 0), disabilityOrInvalidity: clean(payload.disabilityOrInvalidity), role: clean(payload.role), workSite: clean(payload.workSite), contractTerm: clean(payload.contractTerm), agreedSalary: Number(payload.agreedSalary ?? 0), afp: clean(payload.afp), health: clean(payload.health), isaprePlan: clean(payload.isaprePlan), bank: clean(payload.bank), accountType: clean(payload.accountType), accountNumber: clean(payload.accountNumber), requiresAdvance: payload.requiresAdvance === true || clean(payload.requiresAdvance).toLowerCase() === "sí" || clean(payload.requiresAdvance).toLowerCase() === "si", emergencyName: clean(payload.emergencyName), emergencyRelationship: clean(payload.emergencyRelationship), emergencyMobile: clean(payload.emergencyMobile), source,
  };
}

export async function GET() {
  try { return Response.json({ workers: await getDb().select().from(workers).orderBy(desc(workers.createdAt)).limit(2000) }); }
  catch (error) { return Response.json({ workers: [], error: error instanceof Error ? error.message : "No fue posible consultar los trabajadores." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as WorkerPayload | { workers?: WorkerPayload[] };
    const payloads: WorkerPayload[] = "workers" in body ? body.workers ?? [] : [body as WorkerPayload];
    if (!payloads.length) return Response.json({ error: "No hay trabajadores para ingresar." }, { status: 400 });
    if (payloads.length > 2000) return Response.json({ error: "La carga admite hasta 2.000 trabajadores por archivo." }, { status: 400 });
    const invalid = payloads.findIndex((payload) => requiredKeys.some((key) => !clean(payload[key])));
    if (invalid >= 0) return Response.json({ error: `Faltan datos obligatorios en el registro ${invalid + 1}.` }, { status: 400 });
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
