"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ProcessRecord = {
  id: string;
  rut: string;
  personName: string;
  company: string;
  costCenter: string;
  role: string;
};

type Worker = {
  rut: string;
  name: string;
  company: string;
  costCenter: string;
  role: string;
  workSites: string[];
};

type AttendanceRow = {
  states: string[];
  amIn: string;
  amOut: string;
  pmIn: string;
  pmOut: string;
};

type AttendanceEntry = { id: string; batchId: string; date: string; workerRut: string; workerName: string; costCenter: string; states: string; amIn: string; amOut: string; pmIn: string; pmOut: string; attachmentType: string; fileName: string; fileKey: string; status: string };

export type MedicalLeaveRecord = {
  id: string;
  workerRut: string;
  workerName: string;
  costCenter: string;
  from: string;
  to: string;
  days: number;
  folio: string;
  specialty: string;
  status?: string;
  fileName?: string;
  fileKey?: string;
};

type WorkerRecord = { id: string; workerRut: string; category: string; subtype: string; title: string; issueDate: string; expiryDate: string; status: string; detail: string; metadata: string; fileName: string; fileKey: string; createdAt: string };

type CompanyRecord = {
  id: string;
  legalName: string;
  rut: string;
  tradeName: string;
  representative: string;
  address: string;
  status: string;
};

export type WorkSiteRecord = { id: string; name: string; costCenter: string; company: string; client: string; address: string; status: string };

export type WorkerProfile = {
  id: string;
  workerCode: string;
  firstNames: string;
  lastNames: string;
  entryDate: string;
  fullName: string;
  identityNumber: string;
  birthDate: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  educationLevel: string;
  professionalTitle: string;
  address: string;
  commune: string;
  region: string;
  mobile: string;
  email: string;
  familyDependents: number;
  disabilityOrInvalidity: string;
  role: string;
  workSite: string;
  workSites: string;
  contractTerm: string;
  agreedSalary: number;
  afp: string;
  health: string;
  isaprePlan: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  requiresAdvance: boolean;
  advanceAmount: number;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyMobile: string;
};

type WorkerField = { name: string; label: string; type?: string; optional?: boolean; options?: string[]; min?: string };

const workerSections: { title: string; fields: WorkerField[] }[] = [
  { title: "I. ANTECEDENTES PERSONALES", fields: [
    { name: "workerCode", label: "Código del trabajador", optional: true }, { name: "entryDate", label: "Fecha de Ingreso", type: "date" }, { name: "firstNames", label: "Nombres" }, { name: "lastNames", label: "Apellidos" }, { name: "identityNumber", label: "Cédula de identidad N°" }, { name: "birthDate", label: "Fecha de Nacimiento", type: "date" }, { name: "nationality", label: "Nacionalidad" }, { name: "gender", label: "Género", options: ["Femenino", "Masculino", "Otro", "Prefiere no informar"] }, { name: "maritalStatus", label: "Estado Civil", options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Acuerdo de Unión Civil"] }, { name: "educationLevel", label: "Nivel Educacional", options: ["Enseñanza Básica", "Enseñanza Media", "Técnico Nivel Medio", "Técnico Nivel Superior", "Técnico Incompleto", "Universitaria", "Universitaria Incompleto"] }, { name: "professionalTitle", label: "Título profesional (Si aplica)", optional: true }, { name: "address", label: "Dirección" }, { name: "commune", label: "Comuna" }, { name: "region", label: "Región" }, { name: "mobile", label: "N° de celular", type: "tel" }, { name: "email", label: "Correo Electrónico", type: "email" }, { name: "familyDependents", label: "Cargas familiares", type: "number", min: "0" }, { name: "disabilityOrInvalidity", label: "Discapacidad o Pensionado por Invalidez", options: ["No", "Sí"] },
  ] },
  { title: "II. ANTECEDENTES LABORALES", fields: [
    { name: "role", label: "Cargo" }, { name: "workSite", label: "Obras" }, { name: "contractTerm", label: "Plazo de contratación", options: ["Plazo fijo", "Indefinido", "Obra o faena"] }, { name: "agreedSalary", label: "Sueldo pactado", type: "number", min: "0" },
  ] },
  { title: "III. INFORMACIÓN PREVISIONAL Y DE SALUD", fields: [
    { name: "afp", label: "AFP", options: ["CAPITAL", "CUPRUM", "HABITAT", "PLAN VITAL", "PROVIDA", "MODELO", "UNO"] }, { name: "health", label: "Salud", options: ["FONASA", "BANMÉDICA", "COLMENA", "CONSALUD", "CRUZ BLANCA", "NUEVA MASVIDA", "ESENCIAL", "Otra"] }, { name: "isaprePlan", label: "Plan Isapre (si aplica)", optional: true },
  ] },
  { title: "IV. INFORMACIÓN BANCARIA", fields: [
    { name: "bank", label: "Banco" }, { name: "accountType", label: "Tipo de Cuenta", options: ["Corriente", "Vista", "Rut"] }, { name: "accountNumber", label: "Número de Cuenta" }, { name: "requiresAdvance", label: "Requiere anticipo", options: ["No", "Sí"] }, { name: "advanceAmount", label: "Monto del anticipo", type: "number", min: "0", optional: true },
  ] },
  { title: "V. CONTACTO DE EMERGENCIA", fields: [
    { name: "emergencyName", label: "Nombre Completo" }, { name: "emergencyRelationship", label: "Parentesco" }, { name: "emergencyMobile", label: "N° celular de contacto", type: "tel" },
  ] },
];

const bulkWorkerColumns = [
  ["Código", "workerCode"],
  ["Fecha de Ingreso", "entryDate"], ["Nombre Completo", "fullName"], ["Cédula de identidad N°", "identityNumber"], ["Fecha de Nacimiento", "birthDate"], ["Nacionalidad", "nationality"], ["Género", "gender"], ["Estado Civil", "maritalStatus"], ["Nivel Educacional", "educationLevel"], ["Título profesional", "professionalTitle"], ["Dirección", "address"], ["Comuna", "commune"], ["Región", "region"], ["N° de celular", "mobile"], ["Correo Electrónico", "email"], ["Cargas familiares", "familyDependents"], ["Discapacidad o Pensionado por Invalidez", "disabilityOrInvalidity"], ["Cargo", "role"], ["Obra", "workSite"], ["Plazo de contratación", "contractTerm"], ["Sueldo pactado", "agreedSalary"], ["AFP", "afp"], ["Salud", "health"], ["Plan Isapre", "isaprePlan"], ["Banco", "bank"], ["Tipo de Cuenta", "accountType"], ["Número de Cuenta", "accountNumber"], ["Requiere anticipo", "requiresAdvance"], ["Nombre Contacto de Emergencia", "emergencyName"], ["Parentesco", "emergencyRelationship"], ["N° celular de contacto", "emergencyMobile"],
] as const;

function csvCells(line: string, separator: string) {
  const cells: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === separator && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += character;
  }
  cells.push(cell.trim()); return cells;
}

function normalizedHeader(value: string) { return value.replace(/^\uFEFF/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }

const documentOptions = [
  "Contrato",
  "Anexo Obra",
  "Anexo de confidencialidad",
  "Anexo de Conductor",
  "Anexo plazo",
  "Anexo Indefinido",
  "Anexo de Cargo",
  "Certificado de antigüedad laboral",
  "Carta de aviso",
  "Acta de Entrega y Recepción",
];

const attendanceStates = [
  "Presente",
  "Vacaciones",
  "Licencia médica",
  "Inasistencia",
  "Permiso con goce",
  "Permiso sin goce",
  "Descanso",
  "Capacitación",
];

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function endDate(from: string, days: number) {
  if (!from || days < 1) return "";
  const date = new Date(`${from}T12:00:00`);
  date.setDate(date.getDate() + days - 1);
  return date.toISOString().slice(0, 10);
}

function workersFrom(processes: ProcessRecord[]) {
  const unique = new Map<string, Worker>();
  processes.forEach((process) => {
    if (!unique.has(process.rut)) unique.set(process.rut, {
      rut: process.rut,
      name: process.personName,
      company: process.company,
      costCenter: process.costCenter,
      role: process.role,
      workSites: process.costCenter ? [process.costCenter] : [],
    });
  });
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function profileWorkSites(profile?: WorkerProfile) {
  if (!profile) return [];
  try {
    const parsed = JSON.parse(profile.workSites || "[]");
    if (Array.isArray(parsed)) { const sites = [...new Set(parsed.map(String).map((site) => site.trim()).filter(Boolean))]; if (sites.length) return sites; }
  } catch { /* Preserve compatibility with workers saved before multiple works were enabled. */ }
  return profile.workSite ? [profile.workSite] : [];
}

function nameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 3) return { names: fullName, surnames: "" };
  return { names: parts.slice(0, -2).join(" "), surnames: parts.slice(-2).join(" ") };
}

function useConnectedWorkers(processes: ProcessRecord[], refreshKey = "") {
  const processWorkers = useMemo(() => workersFrom(processes), [processes]);
  const [profiles, setProfiles] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/api/workers").then((response) => response.ok ? response.json() : { workers: [] }).then((data: { workers?: WorkerProfile[] }) => setProfiles(data.workers ?? [])).catch(() => setProfiles([])).finally(() => setLoading(false));
  }, [refreshKey]);
  const workers = useMemo(() => {
    const connected: Worker[] = profiles.map((profile) => { const sites = profileWorkSites(profile); const separatedName = [profile.firstNames, profile.lastNames].filter(Boolean).join(" "); return { rut: profile.identityNumber, name: separatedName || profile.fullName, role: profile.role, costCenter: sites.join(" · "), workSites: sites, company: "" }; });
    processWorkers.forEach((worker) => { if (!connected.some((item) => item.rut === worker.rut)) connected.push(worker); });
    return connected.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [profiles, processWorkers]);
  return { workers, profiles, loading };
}

function profileValue(profile: WorkerProfile, field: WorkerField) {
  const value = profile[field.name as keyof WorkerProfile];
  if (field.name === "requiresAdvance") return value ? "Sí" : "No";
  if ((field.type === "date") && value) return new Date(`${value}T12:00:00`).toLocaleDateString("es-CL");
  if (field.name === "agreedSalary") return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(value));
  if (field.name === "advanceAmount") return Number(value) ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(value)) : "—";
  return String(value ?? "") || "—";
}

const workerTabs = ["Resumen", "Información personal", "Documentación laboral", "Documentación personal", "Asistencia", "Vacaciones", "Licencias médicas", "Asignación empresa", "Certificaciones / Cursos", "Exámenes", "Observaciones", "Historial"];
const recordTypes: Record<string, string[]> = {
  "Documentación laboral": ["Contrato", "Anexo", "Ingreso a la DT", "IRL", "RIOHS", "Finiquito", "Otro documento laboral"],
  "Documentación personal": ["Cédula de identidad", "Certificado AFP", "Certificado de salud", "Antecedentes", "Licencia de conducir", "Otro documento personal"],
  Asistencia: ["Libro de asistencia", "Declaración jurada", "Otro respaldo de asistencia"],
  Vacaciones: ["Solicitud de vacaciones", "Comprobante", "Documento firmado", "Otro respaldo de vacaciones"],
  "Licencias médicas": ["Respaldo de licencia médica"],
  "Asignación empresa": ["Notebook", "Teléfono", "Tablet", "Radio", "Vehículo", "Herramientas", "EPP", "Credencial", "Uniforme", "Otro equipo"],
  "Certificaciones / Cursos": ["Curso", "Certificación", "Equipo o maquinaria autorizada", "Licencia habilitante", "Otro respaldo"],
  Exámenes: ["Examen ocupacional", "Seguro", "Evaluación", "Otro respaldo"],
  Observaciones: ["General", "RRHH", "Gerencia", "Confidencial", "Sensible"],
  Finiquito: ["Finiquito", "Reserva de derechos", "Reclamo DT", "Otro reclamo"],
};

function metadataOf(record?: WorkerRecord) { try { return JSON.parse(record?.metadata || "{}"); } catch { return {}; } }
function fileUrl(key: string) { return `/api/worker-records/file?key=${encodeURIComponent(key)}`; }
function downloadStoredFile(key: string, fileName = "respaldo") { const link = document.createElement("a"); link.href = fileUrl(key); link.download = fileName; link.click(); }
function monthsBetween(date: string) { if (!date) return "Sin fecha de ingreso"; const start = new Date(`${date}T12:00:00`); const now = new Date(); const total = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth()); return `${Math.floor(total / 12)} años y ${total % 12} meses`; }
function ageFrom(date: string) { if (!date) return "—"; const birth = new Date(`${date}T12:00:00`); const now = new Date(); let age = now.getFullYear() - birth.getFullYear(); if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1; return `${age} años`; }

function useWorkerRecords(rut: string) {
  const [records, setRecords] = useState<WorkerRecord[]>([]); const [loading, setLoading] = useState(false); const [version, setVersion] = useState(0);
  useEffect(() => { if (!rut) { setRecords([]); return; } setLoading(true); fetch(`/api/worker-records?rut=${encodeURIComponent(rut)}`).then((response) => response.ok ? response.json() : { records: [] }).then((data: { records?: WorkerRecord[] }) => setRecords(data.records ?? [])).catch(() => setRecords([])).finally(() => setLoading(false)); }, [rut, version]);
  return { records, loading, reload: () => setVersion((value) => value + 1) };
}

function WorkerRecordPanel({ rut, category, records, reload, medicalLeaves = [] }: { rut: string; category: string; records: WorkerRecord[]; reload: () => void; medicalLeaves?: MedicalLeaveRecord[] }) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const categoryRecords = category === "Historial" ? records : records.filter((record) => record.category === category || (category === "Finiquito" && record.subtype === "Finiquito"));
  if (category === "Historial") return <section className="panel worker-tab-panel"><div className="panel-heading"><div><p className="page-eyebrow">Trazabilidad</p><h2>Historial del trabajador</h2></div></div>{categoryRecords.length || medicalLeaves.length ? <div className="worker-timeline">{[...categoryRecords.map((record) => ({ id: record.id, date: record.createdAt, title: `${record.category} · ${record.subtype}`, detail: record.detail || record.status })), ...medicalLeaves.map((record) => ({ id: record.id, date: record.from, title: `Licencia médica · Folio ${record.folio}`, detail: `${record.days} días · ${record.status ?? "Registrada"}` }))].sort((a, b) => b.date.localeCompare(a.date)).map((event) => <article key={event.id}><span /><div><small>{new Date(event.date).toLocaleDateString("es-CL")}</small><strong>{event.title}</strong><p>{event.detail}</p></div></article>)}</div> : <EmptyResult text="No existen eventos registrados para este trabajador." />}</section>;
  return <section className="panel worker-tab-panel"><div className="panel-heading"><div><p className="page-eyebrow">Ficha del trabajador</p><h2>{category}</h2></div></div>{category === "Licencias médicas" && (medicalLeaves.length ? <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Estado</th><th>Respaldo</th></tr></thead><tbody>{medicalLeaves.map((leave) => <tr key={leave.id}><td>{leave.folio}</td><td>{leave.from}</td><td>{leave.to}</td><td>{leave.days}</td><td>{leave.status ?? "Registrada"}</td><td>{leave.fileKey ? <button className="table-action" onClick={() => window.open(fileUrl(leave.fileKey!), "_blank")}>Descargar</button> : "Pendiente"}</td></tr>)}</tbody></table></div> : <EmptyResult text="No existen licencias médicas registradas para este trabajador." />)}{category !== "Licencias médicas" && (categoryRecords.length ? <div className="table-wrap"><table><thead><tr><th>Tipo</th><th>Fecha</th><th>Vencimiento</th><th>Estado</th><th>Detalle</th><th>Respaldo</th></tr></thead><tbody>{categoryRecords.map((record) => <tr key={record.id}><td>{record.subtype}</td><td>{record.issueDate || "—"}</td><td>{record.expiryDate || "No aplica"}</td><td><span className="status-chip">{record.status}</span></td><td>{record.detail || "—"}</td><td>{record.fileKey ? <button className="table-action" onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Descargar</button> : "Sin archivo"}</td></tr>)}</tbody></table></div> : <EmptyResult text={`No existen registros en ${category.toLowerCase()}.`} />)}<form className="worker-record-form" onSubmit={async (event) => { event.preventDefault(); setSaving(true); setError(""); try { const form = new FormData(event.currentTarget); form.set("workerRut", rut); form.set("category", category); const meta = Object.fromEntries([...form.entries()].filter(([key]) => key.startsWith("meta-")).map(([key, value]) => [key.slice(5), String(value)])); form.set("metadata", JSON.stringify(meta)); const response = await fetch("/api/worker-records", { method: "POST", body: form }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "No fue posible guardar el registro."); event.currentTarget.reset(); reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro."); } finally { setSaving(false); } }}><h3>Agregar registro o respaldo</h3><div className="form-grid"><label>Tipo<select name="subtype" required><option value="">Seleccionar</option>{(recordTypes[category] ?? ["Registro"]).map((type) => <option key={type}>{type}</option>)}</select></label><label>Fecha<input type="date" name="issueDate" /></label><label>Fecha de vencimiento<input type="date" name="expiryDate" /></label><label>Estado<select name="status"><option>Vigente</option><option>Pendiente de firma</option><option>Pendiente de cargar</option><option>Por vencer</option><option>Vencido</option><option>Observado</option></select></label>{category === "Asistencia" && <><label>Porcentaje mensual<input name="meta-percentage" type="number" min="0" max="100" /></label><label>Días de inasistencia<input name="meta-absences" type="number" min="0" /></label><label>Días de vacaciones<input name="meta-vacationDays" type="number" min="0" /></label><label>Días con licencia<input name="meta-leaveDays" type="number" min="0" /></label></>}{category === "Vacaciones" && <><label>Períodos tomados<input name="meta-periodsTaken" type="number" min="0" /></label><label>Documentos pendientes<input name="meta-pendingDocuments" type="number" min="0" /></label></>}<label className="full">Detalle<input name="detail" placeholder={category === "Observaciones" ? "Escribe la observación" : "Descripción, equipo, curso, examen o antecedente"} /></label><label className="full">Respaldo opcional<input name="file" type="file" /></label></div>{error && <div className="form-error">{error}</div>}<footer className="form-footer"><button className="primary-button" disabled={saving}>{saving ? "Guardando…" : "Guardar registro"}</button></footer></form></section>;
}

function WorkerSummary({ records, medicalLeaves }: { records: WorkerRecord[]; medicalLeaves: MedicalLeaveRecord[] }) {
  const currentMonth = localDate().slice(0, 7); const labor = records.filter((record) => record.category === "Documentación laboral"); const personal = records.filter((record) => record.category === "Documentación personal"); const attendance = records.find((record) => record.category === "Asistencia" && record.issueDate.startsWith(currentMonth)); const attendanceMeta = metadataOf(attendance); const vacations = records.filter((record) => record.category === "Vacaciones"); const vacationMeta = metadataOf(vacations[0]); const assignments = records.filter((record) => record.category === "Asignación empresa"); const certifications = records.filter((record) => record.category === "Certificaciones / Cursos"); const exams = records.filter((record) => record.category === "Exámenes"); const soon = records.filter((record) => record.expiryDate && record.expiryDate >= localDate() && record.expiryDate <= endDate(localDate(), 30)).length; const monthLeaves = medicalLeaves.filter((leave) => leave.from.slice(0, 7) === currentMonth || leave.to.slice(0, 7) === currentMonth); const pendingVacationDocs = Number(vacationMeta.pendingDocuments ?? vacations.filter((record) => record.status.startsWith("Pendiente")).length);
  const cards = [{ title: "Contratos y anexos", value: `${Math.min(100, Math.round(labor.length / 2 * 100))}%`, note: `${labor.length} documentos cargados` }, { title: "Cumplimiento personal", value: `${Math.min(100, Math.round(personal.length / 5 * 100))}%`, note: soon ? `${soon} documento(s) por vencer` : "Sin vencimientos próximos" }, { title: "Asistencia del mes", value: `${attendanceMeta.percentage ?? 0}%`, note: `${attendanceMeta.absences ?? 0} inasistencia(s) · ${attendanceMeta.vacationDays ?? 0} vacaciones · ${attendanceMeta.leaveDays ?? monthLeaves.reduce((sum, leave) => sum + leave.days, 0)} licencia` }, { title: "Vacaciones", value: `${vacationMeta.periodsTaken ?? 0} períodos`, note: `${pendingVacationDocs} documento(s) pendientes` }, { title: "Asignación empresa", value: String(assignments.length), note: assignments.map((record) => record.subtype).join(", ") || "Sin equipos asignados" }, { title: "Certificaciones / Cursos", value: String(certifications.length), note: "Cursos y equipos autorizados" }, { title: "Exámenes", value: String(exams.length), note: "Exámenes y seguros registrados" }];
  const finiquito = records.find((record) => record.category === "Finiquito" || record.subtype === "Finiquito");
  if (finiquito) cards.push({ title: "Finiquito", value: finiquito.issueDate || "Registrado", note: finiquito.detail || "Revisa reserva de derechos y reclamos en su pestaña" });
  return <section className="worker-summary-grid">{cards.map((card) => <article className="panel" key={card.title}><small>{card.title}</small><strong>{card.value}</strong><p>{card.note}</p></article>)}</section>;
}

function navigate(path: string, setRoute: (path: string) => void) {
  window.history.pushState({}, "", path);
  setRoute(path);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function EmptyResult({ text }: { text: string }) {
  return <div className="module-empty"><span>⌕</span><strong>Sin resultados</strong><p>{text}</p></div>;
}

function WorkerProfileForm({ profile, catalog, setRoute }: { profile?: WorkerProfile; catalog: WorkSiteRecord[]; setRoute: (path: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requiresAdvance, setRequiresAdvance] = useState(profile?.requiresAdvance ? "Sí" : "No");
  const currentSites = profileWorkSites(profile);
  const siteOptions = [...new Set([...catalog.filter((site) => site.status === "Activa").map((site) => site.name), ...currentSites])].sort((a, b) => a.localeCompare(b, "es"));
  const defaultValue = (field: WorkerField) => {
    if (!profile) return field.name === "familyDependents" ? "0" : "";
    if (field.name === "firstNames" && !profile.firstNames) return nameParts(profile.fullName).names;
    if (field.name === "lastNames" && !profile.lastNames) return nameParts(profile.fullName).surnames;
    const value = profile[field.name as keyof WorkerProfile];
    if (field.name === "requiresAdvance") return value ? "Sí" : "No";
    return String(value ?? "");
  };
  const renderField = (field: WorkerField) => {
    if (field.name === "workSite") return <div className="full worker-works-field" key={field.name}><span>Obras asignadas <small>Puedes seleccionar más de una</small></span>{siteOptions.length ? <div className="worker-worksite-options">{siteOptions.map((site) => <label key={site}><input type="checkbox" name="workSites" value={site} defaultChecked={currentSites.includes(site)} /><span>{site}</span></label>)}</div> : <div className="info-banner"><span>i</span><p>Primero ingresa las obras desde Administración → Obras y centros de costo.</p></div>}</div>;
    if (field.name === "advanceAmount" && requiresAdvance !== "Sí") return null;
    if (field.name === "requiresAdvance") return <label key={field.name}>{field.label}<select name={field.name} value={requiresAdvance} onChange={(event) => setRequiresAdvance(event.target.value)}><option>No</option><option>Sí</option></select></label>;
    return <label key={field.name}>{field.label}{field.options ? <select name={field.name} required={!field.optional} defaultValue={defaultValue(field)}><option value="" disabled>Seleccionar</option>{[...new Set([...(field.options ?? []), defaultValue(field)].filter(Boolean))].map((option) => <option key={option}>{option}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} min={field.min} required={!field.optional} defaultValue={defaultValue(field)} />}</label>;
  };
  return <form className="worker-profile-form" onSubmit={async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const works = form.getAll("workSites").map(String).filter(Boolean);
      if (!works.length) throw new Error("Selecciona al menos una obra para el trabajador.");
      const payload: Record<string, unknown> = Object.fromEntries(form.entries());
      payload.workSites = works; payload.workSite = works[0];
      if (profile) payload.originalIdentityNumber = profile.identityNumber;
      const response = await fetch("/api/workers", { method: profile ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "No fue posible guardar la información.");
      window.alert(profile ? "Ficha del trabajador actualizada correctamente." : "Información del trabajador enviada correctamente.");
      navigate(profile ? `/personas/resumen/${encodeURIComponent(String(payload.identityNumber))}` : "/personas", setRoute);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar la información."); }
    finally { setSaving(false); }
  }}>
    <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Trabajadores</p><h2>{profile ? "Editar ficha del trabajador" : "Ingresar información de una persona"}</h2></div><span className="status-chip status-chip--draft">{profile ? "Edición" : "Nueva solicitud"}</span></div><p className="form-intro">{profile ? "Actualiza únicamente los datos necesarios. Los documentos, licencias e historial existentes se conservarán." : "Completa los antecedentes del trabajador y envíalos a la Jefa de RRHH y Finanzas."}</p></section>
    {workerSections.map((section) => <section className="panel worker-data-section" key={section.title}><h3>{section.title}</h3><div className="form-grid">{section.fields.map(renderField)}</div></section>)}
    {error && <div className="form-error">{error}</div>}
    <footer className="panel form-footer worker-submit"><button type="button" className="secondary-button" onClick={() => navigate(profile ? `/personas/resumen/${encodeURIComponent(profile.identityNumber)}` : "/personas", setRoute)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? "Guardando…" : profile ? "Guardar cambios" : "Enviar"}</button></footer>
  </form>;
}

export function PersonasModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers, profiles, loading } = useConnectedWorkers(processes, route);
  const summaryRut = route.startsWith("/personas/resumen/") ? decodeURIComponent(route.slice("/personas/resumen/".length)) : "";
  const { records: workerRecords, reload: reloadRecords } = useWorkerRecords(summaryRut);
  const [workerMedicalLeaves, setWorkerMedicalLeaves] = useState<MedicalLeaveRecord[]>([]);
  const [activeTab, setActiveTab] = useState("Resumen");
  const [selectedRut, setSelectedRut] = useState("");
  const [workSiteCatalog, setWorkSiteCatalog] = useState<WorkSiteRecord[]>([]);
  useEffect(() => { fetch("/api/work-sites").then((response) => response.ok ? response.json() : { workSites: [] }).then((data: { workSites?: WorkSiteRecord[] }) => setWorkSiteCatalog(data.workSites ?? [])).catch(() => setWorkSiteCatalog([])); }, [route]);
  useEffect(() => { if (!summaryRut) { setWorkerMedicalLeaves([]); return; } let local: MedicalLeaveRecord[] = []; try { local = (JSON.parse(sessionStorage.getItem("sig-medical-leaves") ?? "[]") as MedicalLeaveRecord[]).filter((leave) => leave.workerRut === summaryRut); } catch { local = []; } fetch(`/api/medical-leaves?rut=${encodeURIComponent(summaryRut)}`).then((response) => response.ok ? response.json() : { medicalLeaves: [] }).then((data: { medicalLeaves?: Array<MedicalLeaveRecord & { dateFrom?: string; dateTo?: string }> }) => { const remote = (data.medicalLeaves ?? []).map((leave) => ({ ...leave, from: leave.from || leave.dateFrom || "", to: leave.to || leave.dateTo || "" })); local.forEach((leave) => { if (!remote.some((item) => item.id === leave.id)) remote.push(leave); }); setWorkerMedicalLeaves(remote); }).catch(() => setWorkerMedicalLeaves(local)); }, [summaryRut]);

  if (route.startsWith("/personas/resumen/")) {
    const profile = profiles.find((item) => item.identityNumber === summaryRut);
    const worker = workers.find((item) => item.rut === summaryRut);
    if (loading) return <section className="panel module-panel"><div className="search-prompt"><span>○</span><strong>Cargando trabajador</strong><p>Consultando sus antecedentes registrados.</p></div></section>;
    if (!worker) return <section className="panel module-panel"><EmptyResult text="No fue posible encontrar al trabajador seleccionado." /><footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/personas", setRoute)}>← Volver a Trabajadores</button></footer></section>;
    const initials = worker.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); const availableTabs = workerRecords.some((record) => record.category === "Finiquito" || record.subtype === "Finiquito") ? [...workerTabs, "Finiquito"] : workerTabs; const displayedName = nameParts(worker.name);
    return <div className="worker-profile-summary"><section className="panel worker-identity-card"><div className="worker-photo">{initials}</div><div className="worker-identity-main"><div className="worker-profile-top"><div className="worker-badges"><span className="status-chip status-chip--secure">Activo</span><span className="status-chip">Código {profile?.workerCode || "Sin código"}</span></div>{profile && <button className="secondary-button worker-edit-button" onClick={() => navigate(`/personas/editar/${encodeURIComponent(worker.rut)}`, setRoute)}>Editar ficha</button>}</div><h2><span>{displayedName.names}</span>{displayedName.surnames && <> <span>{displayedName.surnames}</span></>}</h2><p>{worker.role || "Sin cargo informado"} <i>•</i> {worker.costCenter || "Sin obra informada"} <i>•</i> {profile?.contractTerm || "Plazo no informado"}</p><div className="worker-key-data"><div><small>RUT</small><strong>{worker.rut}</strong></div><div><small>Edad / Género</small><strong>{profile ? `${ageFrom(profile.birthDate)} · ${profile.gender || "No informado"}` : "No informado"}</strong></div><div><small>Celular</small><strong>{profile?.mobile || "No informado"}</strong></div><div><small>Correo electrónico</small><strong>{profile?.email || "No informado"}</strong></div><div className="wide"><small>Dirección</small><strong>{profile ? `${profile.address}, ${profile.commune}, ${profile.region}` : "No informada"}</strong></div></div><div className="worker-tenure"><small>Antigüedad</small><strong>{monthsBetween(profile?.entryDate ?? "")}</strong></div></div></section><nav className="worker-profile-tabs" aria-label="Secciones de la ficha">{availableTabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>{activeTab === "Resumen" ? <WorkerSummary records={workerRecords} medicalLeaves={workerMedicalLeaves} /> : activeTab === "Información personal" ? (profile ? <div className="worker-profile-summary">{workerSections.map((section) => <section className="panel worker-data-section" key={section.title}><h3>{section.title}</h3><div className="profile-summary-grid">{section.fields.map((field) => <div key={field.name}><small>{field.label}</small><strong>{field.name === "workSite" ? profileWorkSites(profile).join(" · ") || "—" : profileValue(profile, field)}</strong></div>)}</div></section>)}</div> : <section className="panel module-panel"><EmptyResult text="No existen antecedentes personales ampliados para este trabajador." /></section>) : <WorkerRecordPanel rut={summaryRut} category={activeTab} records={workerRecords} reload={reloadRecords} medicalLeaves={workerMedicalLeaves} />}<footer className="panel form-footer worker-submit"><button className="secondary-button" onClick={() => navigate("/personas", setRoute)}>← Volver a Trabajadores</button></footer></div>;
  }

  if (route === "/personas/nueva-solicitud") return <WorkerProfileForm catalog={workSiteCatalog} setRoute={setRoute} />;
  if (route.startsWith("/personas/editar/")) {
    const editRut = decodeURIComponent(route.slice("/personas/editar/".length)); const profile = profiles.find((item) => item.identityNumber === editRut);
    if (loading) return <section className="panel module-panel"><div className="search-prompt"><span>○</span><strong>Cargando trabajador</strong></div></section>;
    return profile ? <WorkerProfileForm profile={profile} catalog={workSiteCatalog} setRoute={setRoute} /> : <section className="panel module-panel"><EmptyResult text="No fue posible encontrar la ficha a editar." /></section>;
  }

  return <section className="panel module-panel">
    <div className="section-actions">
      <div><p className="page-eyebrow">Trabajadores</p><h2>Seleccionar trabajador</h2></div>
      <button className="primary-button" onClick={() => navigate("/personas/nueva-solicitud", setRoute)}>＋ Nueva solicitud</button>
    </div>
    <div className="worker-selector-row"><label>Trabajador<select value={selectedRut} onChange={(event) => { const rut = event.target.value; setSelectedRut(rut); if (rut) navigate(`/personas/resumen/${encodeURIComponent(rut)}`, setRoute); }}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label></div>
  </section>;
}

export function DocumentModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes);
  const slug = route.startsWith("/documentos/solicitud/") ? decodeURIComponent(route.slice("/documentos/solicitud/".length)) : "";
  const selectedType = documentOptions.find((option) => option.toLowerCase() === slug.toLowerCase()) ?? slug;
  if (route.startsWith("/documentos/solicitud/")) return <form className="panel process-form" onSubmit={(event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    sessionStorage.setItem(`sig-document-request-${Date.now()}`, JSON.stringify({ ...values, type: selectedType }));
    window.alert("Solicitud documental guardada correctamente.");
    navigate("/documentos", setRoute);
  }}>
    <div className="panel-heading"><div><p className="page-eyebrow">Gestión Documental</p><h2>{selectedType}</h2></div><span className="status-chip status-chip--draft">Nueva solicitud</span></div>
    <div className="form-grid">
      <label className="full">Trabajador<select name="worker" required defaultValue=""><option value="" disabled>Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={`${worker.name} · ${worker.rut}`}>{worker.name} · {worker.rut}</option>)}</select></label>
      <label>Fecha de solicitud<input name="date" type="date" defaultValue={localDate()} required /></label>
      <label>Fecha de vigencia<input name="effectiveDate" type="date" /></label>
      <label className="full">Antecedentes de la solicitud<input name="detail" required placeholder="Indica la información necesaria para preparar el documento" /></label>
    </div>
    <footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/documentos", setRoute)}>Cancelar</button><button className="primary-button">Enviar solicitud</button></footer>
  </form>;

  return <section className="panel module-panel">
    <div className="panel-heading"><div><p className="page-eyebrow">Gestión Documental</p><h2>Selecciona el documento a solicitar</h2></div></div>
    <div className="document-option-grid">{documentOptions.map((option) => <button key={option} onClick={() => navigate(`/documentos/solicitud/${encodeURIComponent(option)}`, setRoute)}><span>▤</span><strong>{option}</strong><i>→</i></button>)}</div>
    <div className="document-register"><h3>Documentos registrados</h3><div className="module-empty module-empty--compact"><span>◇</span><p>No existen documentos registrados.</p></div></div>
  </section>;
}

function defaultRow(): AttendanceRow {
  return { states: ["Presente"], amIn: "08:00", amOut: "13:00", pmIn: "15:00", pmOut: "18:00" };
}

export function AttendanceModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes);
  const costCenters = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]);
  const [date, setDate] = useState(localDate());
  const [scope, setScope] = useState("all");
  const [costCenter, setCostCenter] = useState("");
  const [rows, setRows] = useState<Record<string, AttendanceRow>>({});
  const [attachmentType, setAttachmentType] = useState("Libro de asistencia");
  const [customAttachmentName, setCustomAttachmentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(localDate().slice(0, 7));
  const [summaryScope, setSummaryScope] = useState("all");
  const [summaryCenter, setSummaryCenter] = useState("");
  const [summaryMode, setSummaryMode] = useState("month");
  const [summaryMonth, setSummaryMonth] = useState(localDate().slice(0, 7));
  const [summaryDay, setSummaryDay] = useState(localDate());
  const visibleWorkers = scope === "all" ? workers : workers.filter((worker) => worker.workSites.includes(costCenter));
  const loadEntries = () => fetch("/api/attendance").then((response) => response.ok ? response.json() : { entries: [] }).then((data: { entries?: AttendanceEntry[] }) => setEntries(data.entries ?? [])).catch(() => setEntries([]));
  useEffect(() => { loadEntries(); }, []);

  function rowFor(rut: string) { return rows[rut] ?? defaultRow(); }
  function updateRow(rut: string, update: Partial<AttendanceRow>) { setRows((current) => ({ ...current, [rut]: { ...rowFor(rut), ...update } })); }
  function removeFile() { setFile(null); setFileInputKey((key) => key + 1); }
  async function submitReview() {
    if (!visibleWorkers.length) return window.alert("Selecciona una dotación con trabajadores registrados.");
    if (!file) return window.alert("Debes cargar un respaldo antes de enviar a revisión.");
    const form = new FormData(); form.set("date", date); form.set("attachmentType", attachmentType === "Otro" ? customAttachmentName || "Otro" : attachmentType); form.set("file", file); form.set("rows", JSON.stringify(visibleWorkers.map((worker) => ({ workerRut: worker.rut, workerName: worker.name, costCenter: scope === "center" ? costCenter : worker.workSites[0] || worker.costCenter, ...rowFor(worker.rut) }))));
    const response = await fetch("/api/attendance", { method: "POST", body: form }); const data = await response.json() as { error?: string };
    if (!response.ok) return window.alert(data.error ?? "No fue posible enviar la asistencia.");
    setLocked(true); loadEntries();
  }

  const selectedEntries = entries.filter((entry) => entry.workerRut === selectedWorker && entry.date.startsWith(selectedMonth));
  const calendarDays = useMemo(() => { const [year, month] = selectedMonth.split("-").map(Number); const total = new Date(year, month, 0).getDate(); return Array.from({ length: total }, (_, index) => `${selectedMonth}-${String(index + 1).padStart(2, "0")}`); }, [selectedMonth]);
  const summaryEntries = entries.filter((entry) => (summaryScope === "all" || entry.costCenter === summaryCenter) && (summaryMode === "day" ? entry.date === summaryDay : entry.date.startsWith(summaryMonth)));
  const summaryRows = [...new Map(summaryEntries.map((entry) => [entry.workerRut, { workerRut: entry.workerRut, workerName: entry.workerName, costCenter: entry.costCenter, days: summaryEntries.filter((item) => item.workerRut === entry.workerRut).length, status: (() => { try { return (JSON.parse(entry.states) as string[]).join(", "); } catch { return entry.states; } })() }])).values()];

  if (route === "/asistencia/nuevo") return <section className="panel attendance-entry">
    <div className="panel-heading"><div><p className="page-eyebrow">Nuevo ingreso</p><h2>Informar asistencia</h2></div><span className={`status-chip ${locked ? "status-chip--secure" : "status-chip--draft"}`}>{locked ? "En revisión · bloqueado" : "Borrador"}</span></div>
    <fieldset disabled={locked}>
      <div className="attendance-controls">
        <label>Día<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Dotación<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="all">Totalidad de empresa</option><option value="center">Por centro de costo</option></select></label>
        {scope === "center" && <label>Centro de costo<select value={costCenter} onChange={(event) => setCostCenter(event.target.value)}><option value="">Seleccionar</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label>}
      </div>
      <div className="attendance-entry-grid"><div className="attendance-list"><div className="attendance-list-head attendance-list-head--grouped"><span>Trabajador</span><span>Estado</span><span>Primera Jornada (AM)<small>Ingreso · Salida</small></span><span>Jornada PM<small>Ingreso · Salida</small></span></div>{visibleWorkers.length ? visibleWorkers.map((worker) => { const row = rowFor(worker.rut); return <div className="attendance-worker-row attendance-worker-row--grouped" key={worker.rut}><div><strong>{worker.name}</strong><small>{worker.rut} · {worker.costCenter}</small></div><select multiple value={row.states} onChange={(event) => updateRow(worker.rut, { states: [...event.currentTarget.selectedOptions].map((option) => option.value) })} aria-label={`Estado de ${worker.name}`}>{attendanceStates.map((status) => <option key={status}>{status}</option>)}</select><div className="shift-times"><input aria-label={`Ingreso AM de ${worker.name}`} type="time" value={row.amIn} onChange={(event) => updateRow(worker.rut, { amIn: event.target.value })} /><input aria-label={`Salida AM de ${worker.name}`} type="time" value={row.amOut} onChange={(event) => updateRow(worker.rut, { amOut: event.target.value })} /></div><div className="shift-times"><input aria-label={`Ingreso PM de ${worker.name}`} type="time" value={row.pmIn} onChange={(event) => updateRow(worker.rut, { pmIn: event.target.value })} /><input aria-label={`Salida PM de ${worker.name}`} type="time" value={row.pmOut} onChange={(event) => updateRow(worker.rut, { pmOut: event.target.value })} /></div></div>; }) : <EmptyResult text={workers.length ? "Selecciona un centro de costo con trabajadores." : "No hay trabajadores registrados para informar asistencia."} />}</div><aside className="upload-panel attendance-upload"><div><p className="page-eyebrow">Respaldo</p><h3>Cargar archivo</h3></div><label>Tipo de archivo<select value={attachmentType} onChange={(event) => setAttachmentType(event.target.value)}><option>Libro de asistencia</option><option>Declaración jurada</option><option>Otro</option></select></label>{attachmentType === "Otro" && <label>Nombre del respaldo<input value={customAttachmentName} onChange={(event) => setCustomAttachmentName(event.target.value)} required placeholder="Indica el nombre" /></label>}<label className="file-picker">Seleccionar archivo<input key={fileInputKey} type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>{file && <div className="file-loaded"><span>▤</span><div><strong>{file.name}</strong><small>{attachmentType === "Otro" ? customAttachmentName || "Otro" : attachmentType}</small></div><button type="button" onClick={removeFile}>Eliminar</button></div>}</aside></div>
    </fieldset>
    <footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/asistencia", setRoute)}>Volver</button><button className="primary-button" disabled={locked} onClick={submitReview}>{locked ? "Enviado a revisión" : "Enviar a revisión"}</button></footer>
  </section>;

  if (route === "/asistencia/trabajador") return <><div className="tabs"><button onClick={() => navigate("/asistencia", setRoute)}>Resumen mensual</button><button className="active">Por trabajador</button></div><section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Consulta individual</p><h2>Calendario de asistencia por trabajador</h2></div></div><div className="worker-month-filter"><label>Trabajador<select value={selectedWorker} onChange={(event) => setSelectedWorker(event.target.value)}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label><label>Mes<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></label></div>{selectedWorker ? <div className="attendance-calendar">{calendarDays.map((day) => { const entry = selectedEntries.find((item) => item.date === day); let states: string[] = []; try { states = entry ? JSON.parse(entry.states) : []; } catch { states = entry ? [entry.states] : []; } return <article key={day} className={entry ? "has-entry" : ""}><strong>{Number(day.slice(-2))}</strong>{entry ? <><span>{states.join(", ")}</span><small>{entry.amIn}–{entry.amOut} · {entry.pmIn}–{entry.pmOut}</small><div className="backup-actions"><button onClick={() => window.open(fileUrl(entry.fileKey), "_blank")}>Ver</button><button onClick={() => window.open(fileUrl(entry.fileKey), "_blank")}>Descargar</button></div></> : <small>Sin información</small>}</article>; })}</div> : <div className="search-prompt"><span>○</span><strong>Selecciona un trabajador</strong><p>Luego elige el mes para ver los días informados.</p></div>}</section></>;

  return <><div className="tabs"><button className="active">Resumen mensual</button><button onClick={() => navigate("/asistencia/trabajador", setRoute)}>Por trabajador</button></div><section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Resumen mensual</p><h2>Asistencia informada</h2></div><button className="primary-button" onClick={() => { setLocked(false); setFile(null); navigate("/asistencia/nuevo", setRoute); }}>＋ Nuevo ingreso</button></div><div className="attendance-summary-filters"><label>Dotación<select value={summaryScope} onChange={(event) => setSummaryScope(event.target.value)}><option value="all">Totalidad de trabajadores</option><option value="center">Por centro de costo</option></select></label>{summaryScope === "center" && <label>Centro de costo<select value={summaryCenter} onChange={(event) => setSummaryCenter(event.target.value)}><option value="">Seleccionar</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label>}<label>Consultar por<select value={summaryMode} onChange={(event) => setSummaryMode(event.target.value)}><option value="month">Mes</option><option value="day">Día</option></select></label>{summaryMode === "month" ? <label>Mes<input type="month" value={summaryMonth} onChange={(event) => setSummaryMonth(event.target.value)} /></label> : <label>Día<input type="date" value={summaryDay} onChange={(event) => setSummaryDay(event.target.value)} /></label>}</div>{summaryRows.length ? <div className="table-wrap"><table><thead><tr><th>Trabajador</th><th>Centro de costo</th><th>Días informados</th><th>Último estado</th><th>Respaldo</th></tr></thead><tbody>{summaryRows.map((row) => { const latest = summaryEntries.find((entry) => entry.workerRut === row.workerRut)!; return <tr key={row.workerRut}><td>{row.workerName}</td><td>{row.costCenter}</td><td>{row.days}</td><td>{row.status}</td><td><div className="backup-actions"><button onClick={() => window.open(fileUrl(latest.fileKey), "_blank")}>Ver</button><button onClick={() => window.open(fileUrl(latest.fileKey), "_blank")}>Descargar</button></div></td></tr>; })}</tbody></table></div> : <EmptyResult text="No existen registros para los filtros seleccionados." />}</section></>;
}

export function VacationsModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers, profiles } = useConnectedWorkers(processes);
  const routeRut = route.startsWith("/vacaciones/nueva-solicitud/") ? decodeURIComponent(route.slice("/vacaciones/nueva-solicitud/".length)) : "";
  const routeWorker = workers.find((worker) => worker.rut === routeRut);
  const [requestWorker, setRequestWorker] = useState(routeWorker?.rut ?? "");
  const [selectedRut, setSelectedRut] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [records, setRecords] = useState<WorkerRecord[]>([]);
  const costCenters = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]);
  const loadRecords = () => fetch("/api/worker-records?category=Vacaciones").then((response) => response.ok ? response.json() : { records: [] }).then((data: { records?: WorkerRecord[] }) => setRecords(data.records ?? [])).catch(() => setRecords([]));
  useEffect(() => { loadRecords(); }, []);
  const filteredWorkers = centerFilter ? workers.filter((worker) => worker.workSites.includes(centerFilter)) : workers;
  const vacationMeta = (record: WorkerRecord) => metadataOf(record) as { folio?: string; businessDays?: number };
  const balanceFor = (worker: Worker) => { const profile = profiles.find((item) => item.identityNumber === worker.rut); const entry = profile?.entryDate ? new Date(`${profile.entryDate}T12:00:00`) : null; const now = new Date(); const months = entry ? Math.max(0, (now.getFullYear() - entry.getFullYear()) * 12 + now.getMonth() - entry.getMonth()) : 0; const legal = Math.round(months * 1.25 * 100) / 100; const taken = records.filter((record) => record.workerRut === worker.rut && record.status !== "Rechazada").reduce((total, record) => total + Number(vacationMeta(record).businessDays ?? 0), 0); return { legal, taken, available: Math.max(0, Math.round((legal - taken) * 100) / 100), progressive: 0 }; };
  const selected = workers.find((worker) => worker.rut === selectedRut); const selectedBalance = selected ? balanceFor(selected) : null; const selectedRecords = records.filter((record) => record.workerRut === selectedRut);

  if (route.startsWith("/vacaciones/nueva-solicitud")) return <form className="panel process-form" onSubmit={async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const worker = workers.find((item) => item.rut === requestWorker); if (!worker) return window.alert("Selecciona un trabajador."); const source = new FormData(event.currentTarget); const from = String(source.get("from")); const to = String(source.get("to")); const folio = String(source.get("folio")); const start = new Date(`${from}T12:00:00`); const end = new Date(`${to}T12:00:00`); let businessDays = 0; for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) if (day.getDay() !== 0 && day.getDay() !== 6) businessDays += 1; const form = new FormData(); form.set("workerRut", worker.rut); form.set("category", "Vacaciones"); form.set("subtype", "Solicitud de vacaciones"); form.set("title", folio); form.set("issueDate", from); form.set("expiryDate", to); form.set("status", "Pendiente de firma"); form.set("detail", `${businessDays} días hábiles`); form.set("metadata", JSON.stringify({ folio, businessDays })); const response = await fetch("/api/worker-records", { method: "POST", body: form }); const data = await response.json() as { error?: string }; if (!response.ok) return window.alert(data.error ?? "No fue posible enviar la solicitud."); window.alert("Solicitud de vacaciones enviada correctamente."); navigate("/vacaciones", setRoute);
  }}><div className="panel-heading"><div><p className="page-eyebrow">Vacaciones</p><h2>Nueva solicitud</h2></div><span className="status-chip status-chip--draft">Solicitud</span></div><div className="form-grid"><label className="full">Trabajador<select name="worker" value={requestWorker} onChange={(event) => setRequestWorker(event.target.value)} required><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label><label>Número de folio<input name="folio" required /></label><label>Desde<input name="from" type="date" required /></label><label>Hasta<input name="to" type="date" required /></label></div><footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/vacaciones", setRoute)}>Cancelar</button><button className="primary-button">Enviar solicitud</button></footer></form>;

  return <div className="vacation-module"><section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Vacaciones</p><h2>Resumen de saldos por trabajador</h2></div><button className="primary-button" onClick={() => navigate(selected ? `/vacaciones/nueva-solicitud/${encodeURIComponent(selected.rut)}` : "/vacaciones/nueva-solicitud", setRoute)}>＋ Nueva solicitud</button></div><div className="vacation-filters"><label>Centro de costo<select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">Todos los centros de costo</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label></div><div className="table-wrap"><table><thead><tr><th>Trabajador</th><th>Centro de costo</th><th>Saldo disponible</th><th>Vacaciones legales</th><th>Días tomados</th></tr></thead><tbody>{filteredWorkers.map((worker) => { const balance = balanceFor(worker); return <tr key={worker.rut}><td>{worker.name}</td><td>{worker.costCenter || "—"}</td><td>{balance.available.toLocaleString("es-CL")} días</td><td>{balance.legal.toLocaleString("es-CL")} días</td><td>{balance.taken.toLocaleString("es-CL")} días</td></tr>; })}</tbody></table></div></section><section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Detalle individual</p><h2>Vacaciones por trabajador</h2></div></div><div className="worker-selector-row"><label>Trabajador<select value={selectedRut} onChange={(event) => setSelectedRut(event.target.value)}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label></div>{selected && selectedBalance ? <><div className="vacation-balance-cards"><article><small>Saldo disponible</small><strong>{selectedBalance.available.toLocaleString("es-CL")}</strong><span>días hábiles</span></article><article><small>Vacaciones legales</small><strong>{selectedBalance.legal.toLocaleString("es-CL")}</strong><span>devengo estimado a la fecha</span></article><article><small>Progresivas</small><strong>{selectedBalance.progressive.toLocaleString("es-CL")}</strong><span>sin certificado registrado</span></article></div>{selectedRecords.length ? <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Período</th><th>Días hábiles</th><th>Estado</th><th>Documento</th></tr></thead><tbody>{selectedRecords.map((record) => { const meta = vacationMeta(record); return <tr key={record.id}><td>{meta.folio || record.title}</td><td>{record.issueDate} al {record.expiryDate}</td><td>{meta.businessDays ?? "—"}</td><td>{record.status}</td><td>{record.fileKey ? <button className="table-action" onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Ver comprobante</button> : "Pendiente"}</td></tr>; })}</tbody></table></div> : <EmptyResult text="Este trabajador no registra períodos de vacaciones." />}</> : <div className="search-prompt"><span>○</span><strong>Selecciona un trabajador</strong><p>Verás su saldo y períodos registrados.</p></div>}</section></div>;
}

export function MedicalLeaveModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes);
  const costCenters = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]);
  const [records, setRecords] = useState<MedicalLeaveRecord[]>([]);
  const [workerFilter, setWorkerFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(localDate().slice(0, 7));
  const [workerRut, setWorkerRut] = useState("");
  const [days, setDays] = useState(1);
  const [from, setFrom] = useState(localDate());
  const selectedWorker = workers.find((worker) => worker.rut === workerRut);
  const to = endDate(from, days);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let local: MedicalLeaveRecord[] = []; try { local = JSON.parse(sessionStorage.getItem("sig-medical-leaves") ?? "[]"); } catch { local = []; }
      if (local.length) await Promise.all(local.map((record) => fetch("/api/medical-leaves", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(record) }).catch(() => null)));
      try { const response = await fetch("/api/medical-leaves"); const data = response.ok ? await response.json() as { medicalLeaves?: Array<MedicalLeaveRecord & { dateFrom?: string; dateTo?: string }> } : { medicalLeaves: [] }; const remote = (data.medicalLeaves ?? []).map((record) => ({ ...record, from: record.from || record.dateFrom || "", to: record.to || record.dateTo || "" })); const combined = [...remote]; local.forEach((record) => { if (!combined.some((item) => item.id === record.id)) combined.push(record); }); if (!cancelled) setRecords(combined); } catch { if (!cancelled) setRecords(local); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = records.filter((record) => {
    const matchesWorker = !workerFilter || record.workerRut === workerFilter;
    const matchesCenter = !centerFilter || record.costCenter.split(" · ").includes(centerFilter);
    const monthStart = `${monthFilter}-01`;
    const monthEnd = `${monthFilter}-31`;
    return matchesWorker && matchesCenter && (!monthFilter || (record.from <= monthEnd && record.to >= monthStart));
  });

  if (route === "/licencias/nueva") return <form className="panel process-form" onSubmit={async (event) => {
    event.preventDefault();
    if (!selectedWorker) return window.alert("Selecciona un trabajador registrado.");
    const form = new FormData(event.currentTarget); const id = `LIC-${crypto.randomUUID().slice(0, 9).toUpperCase()}`; form.set("id", id); form.set("workerRut", selectedWorker.rut); form.set("workerName", selectedWorker.name); form.set("costCenter", selectedWorker.costCenter); form.set("from", from); form.set("to", to); form.set("days", String(days));
    const response = await fetch("/api/medical-leaves", { method: "POST", body: form }); const data = await response.json() as { error?: string };
    if (!response.ok) return window.alert(data.error ?? "No fue posible registrar la licencia médica.");
    const record: MedicalLeaveRecord = { id, workerRut: selectedWorker.rut, workerName: selectedWorker.name, costCenter: selectedWorker.costCenter, from, to, days, folio: String(form.get("folio")), specialty: String(form.get("specialty")), status: "Registrada", fileName: form.get("file") instanceof File ? (form.get("file") as File).name : "" };
    const updated = [record, ...records]; setRecords(updated); sessionStorage.setItem("sig-medical-leaves", JSON.stringify(updated)); window.alert("Licencia médica registrada correctamente."); navigate("/licencias", setRoute);
  }}>
    <div className="panel-heading"><div><p className="page-eyebrow">Licencias Médicas</p><h2>Nueva licencia médica</h2></div><span className="status-chip status-chip--draft">Nuevo registro</span></div>
    <div className="form-grid">
      <label className="full">Trabajador<select value={workerRut} onChange={(event) => setWorkerRut(event.target.value)} required><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label>
      <label>Centro de costo<input value={selectedWorker?.costCenter ?? ""} readOnly placeholder="Se completa al seleccionar trabajador" /></label>
      <label>Número de días<input type="number" min="1" value={days} onChange={(event) => setDays(Math.max(1, Number(event.target.value)))} required /></label>
      <label>Comienza<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /></label>
      <label>Hasta<input type="date" value={to} readOnly /></label>
      <label>N° de folio<input name="folio" required placeholder="Número de folio" /></label>
      <label>Especialidad<input name="specialty" required placeholder="Especialidad médica" /></label>
      <label className="full">Respaldo opcional<input name="file" type="file" /></label>
    </div>
    <footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/licencias", setRoute)}>Cancelar</button><button className="primary-button">Guardar licencia médica</button></footer>
  </form>;

  return <section className="panel module-panel">
    <div className="section-actions"><div><p className="page-eyebrow">Licencias Médicas</p><h2>Trabajadores con licencia</h2></div><button className="primary-button" onClick={() => navigate("/licencias/nueva", setRoute)}>＋ Nueva licencia médica</button></div>
    <div className="medical-filters"><label>Trabajador<select value={workerFilter} onChange={(event) => setWorkerFilter(event.target.value)}><option value="">Todos los trabajadores</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name}</option>)}</select></label><label>Centro de costo<select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">Todos los centros de costo</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label><label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label></div>
    <div className="license-summary"><div><small>Con licencia en el período</small><strong>{filtered.length}</strong></div><div><small>Días informados</small><strong>{filtered.reduce((total, record) => total + record.days, 0)}</strong></div></div>
    {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Centro de costo</th><th>Trabajador</th><th>Desde</th><th>Hasta</th><th>N° de días</th><th>Folio</th><th>Especialidad</th><th>Respaldo</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td>{record.costCenter}</td><td>{record.workerName}</td><td>{new Date(`${record.from}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{new Date(`${record.to}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.days}</td><td>{record.folio}</td><td>{record.specialty}</td><td>{record.fileKey ? <button className="table-action" onClick={() => window.open(fileUrl(record.fileKey!), "_blank")}>Descargar</button> : "Opcional · no cargado"}</td></tr>)}</tbody></table></div> : <EmptyResult text="No hay trabajadores con licencia para los filtros seleccionados." />}
  </section>;
}

export function CompaniesModule({ route, setRoute }: { route: string; setRoute: (path: string) => void }) {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  useEffect(() => { try { setCompanies(JSON.parse(sessionStorage.getItem("sig-companies") ?? "[]")); } catch { setCompanies([]); } }, []);

  if (route === "/administracion/empresas/nueva") return <form className="panel process-form" onSubmit={(event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const company: CompanyRecord = { id: crypto.randomUUID(), legalName: String(values.legalName), rut: String(values.rut), tradeName: String(values.tradeName), representative: String(values.representative), address: String(values.address), status: String(values.status) };
    const updated = [company, ...companies]; setCompanies(updated); sessionStorage.setItem("sig-companies", JSON.stringify(updated));
    window.alert("Empresa ingresada correctamente."); navigate("/administracion/empresas", setRoute);
  }}><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>Ingresar empresa</h2></div><span className="status-chip status-chip--draft">Nueva empresa</span></div><div className="form-grid"><label>Razón social<input name="legalName" required /></label><label>RUT de la empresa<input name="rut" required placeholder="76.123.456-7" /></label><label>Nombre de fantasía<input name="tradeName" /></label><label>Representante legal<input name="representative" required /></label><label className="full">Dirección<input name="address" required /></label><label>Estado<select name="status"><option>Activa</option><option>Inactiva</option></select></label></div><footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/administracion/empresas", setRoute)}>Cancelar</button><button className="primary-button">Guardar empresa</button></footer></form>;

  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Empresas</h2></div><button className="primary-button" onClick={() => navigate("/administracion/empresas/nueva", setRoute)}>＋ Ingresar empresa</button></div>{companies.length ? <div className="table-wrap"><table><thead><tr><th>Razón social</th><th>RUT</th><th>Nombre de fantasía</th><th>Representante</th><th>Estado</th></tr></thead><tbody>{companies.map((company) => <tr key={company.id}><td>{company.legalName}</td><td>{company.rut}</td><td>{company.tradeName || "—"}</td><td>{company.representative}</td><td><span className="status-chip">{company.status}</span></td></tr>)}</tbody></table></div> : <EmptyResult text="No existen empresas ingresadas." />}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button></footer></section>;
}

export function WorkSitesModule({ route, setRoute }: { route: string; setRoute: (path: string) => void }) {
  const [workSites, setWorkSites] = useState<WorkSiteRecord[]>([]);
  const [error, setError] = useState("");
  const load = () => fetch("/api/work-sites").then((response) => response.ok ? response.json() : { workSites: [] }).then((data: { workSites?: WorkSiteRecord[] }) => setWorkSites(data.workSites ?? [])).catch(() => setWorkSites([]));
  useEffect(() => { load(); }, []);
  if (route === "/administracion/obras-y-centros-de-costo/nueva") return <form className="panel process-form" onSubmit={async (event) => {
    event.preventDefault(); setError("");
    try { const response = await fetch("/api/work-sites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "No fue posible guardar la obra."); window.alert("Obra ingresada correctamente."); navigate("/administracion/obras-y-centros-de-costo", setRoute); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar la obra."); }
  }}><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>Ingresar obra</h2></div><span className="status-chip status-chip--draft">Nueva obra</span></div><div className="form-grid"><label>Nombre de la obra<input name="name" required /></label><label>Centro de costo<input name="costCenter" required /></label><label>Empresa principal<input name="company" /></label><label>Cliente<input name="client" /></label><label>Estado<select name="status"><option>Activa</option><option>Inactiva</option></select></label><label className="full">Dirección<input name="address" /></label></div>{error && <div className="form-error">{error}</div>}<footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/administracion/obras-y-centros-de-costo", setRoute)}>Cancelar</button><button className="primary-button">Guardar obra</button></footer></form>;
  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Ingresar obra</h2></div><button className="primary-button" onClick={() => navigate("/administracion/obras-y-centros-de-costo/nueva", setRoute)}>＋ Ingresar obra</button></div>{workSites.length ? <div className="table-wrap"><table><thead><tr><th>Obra</th><th>Centro de costo</th><th>Empresa principal</th><th>Cliente</th><th>Dirección</th><th>Estado</th></tr></thead><tbody>{workSites.map((site) => <tr key={site.id}><td>{site.name}</td><td>{site.costCenter || "—"}</td><td>{site.company || "—"}</td><td>{site.client || "—"}</td><td>{site.address || "—"}</td><td><span className="status-chip">{site.status}</span></td></tr>)}</tbody></table></div> : <EmptyResult text="No existen obras ingresadas." />}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button></footer></section>;
}

export function BulkWorkersModule({ setRoute }: { setRoute: (path: string) => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function downloadTemplate() {
    const content = `\uFEFF${bulkWorkerColumns.map(([label]) => `"${label}"`).join(";")}\r\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "plantilla-carga-masiva-trabajadores.csv"; link.click(); URL.revokeObjectURL(url);
  }

  async function loadFile(file: File | null) {
    setRows([]); setError(""); setFileName(file?.name ?? ""); if (!file) return;
    try {
      const text = await file.text(); const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) throw new Error("El archivo debe incluir encabezados y al menos un trabajador.");
      const separator = lines[0].includes(";") ? ";" : ",";
      const headers = csvCells(lines[0], separator).map(normalizedHeader);
      const indexes = bulkWorkerColumns.map(([label]) => headers.indexOf(normalizedHeader(label)));
      const missing = bulkWorkerColumns.filter((_, index) => indexes[index] < 0).map(([label]) => label);
      if (missing.length) throw new Error(`Faltan columnas de la plantilla: ${missing.join(", ")}.`);
      const parsed = lines.slice(1).map((line) => { const cells = csvCells(line, separator); return Object.fromEntries(bulkWorkerColumns.map(([, key], index) => [key, cells[indexes[index]] ?? ""])); }).filter((row) => row.fullName || row.identityNumber);
      if (!parsed.length) throw new Error("El archivo no contiene trabajadores para ingresar.");
      setRows(parsed);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible leer el archivo."); }
  }

  async function submit() {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/workers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ workers: rows }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "No fue posible completar la carga masiva.");
      window.alert(`${rows.length} trabajador(es) ingresado(s) correctamente.`); navigate("/personas", setRoute);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible completar la carga masiva."); }
    finally { setSaving(false); }
  }

  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Carga masiva de trabajadores</h2></div><button className="secondary-button" onClick={downloadTemplate}>Descargar plantilla CSV</button></div><div className="bulk-instructions"><span>1</span><p>Descarga y completa la plantilla con los antecedentes personales, laborales, previsionales, bancarios y de emergencia.</p><span>2</span><p>Selecciona el archivo CSV completado, revisa el resumen y envía la carga.</p></div><label className="bulk-file-picker">Seleccionar archivo CSV<input type="file" accept=".csv,text/csv" onChange={(event) => loadFile(event.target.files?.[0] ?? null)} /></label>{fileName && <p className="bulk-file-name"><strong>Archivo:</strong> {fileName}</p>}{error && <div className="form-error">{error}</div>}{rows.length > 0 && <><div className="bulk-summary"><strong>{rows.length}</strong><span>trabajadores listos para ingresar</span></div><div className="table-wrap"><table><thead><tr><th>Nombre completo</th><th>Cédula de identidad</th><th>Cargo</th><th>Obra</th><th>Fecha de ingreso</th></tr></thead><tbody>{rows.slice(0, 10).map((row, index) => <tr key={`${row.identityNumber}-${index}`}><td>{row.fullName}</td><td>{row.identityNumber}</td><td>{row.role}</td><td>{row.workSite}</td><td>{row.entryDate}</td></tr>)}</tbody></table>{rows.length > 10 && <p className="bulk-more">Se muestran los primeros 10 registros de {rows.length}.</p>}</div></>}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button><button className="primary-button" disabled={!rows.length || saving} onClick={submit}>{saving ? "Ingresando…" : "Enviar carga masiva"}</button></footer></section>;
}
