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

export type WorkSiteRecord = { id: string; name: string; costCenter: string; company: string; client: string; address: string; region: string; commune: string; status: string };

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
  "Feriado",
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

function useWorkSiteCatalog() {
  const [catalog, setCatalog] = useState<WorkSiteRecord[]>([]);
  useEffect(() => {
    fetch("/api/work-sites").then((response) => response.ok ? response.json() : { workSites: [] }).then((data: { workSites?: WorkSiteRecord[] }) => setCatalog(data.workSites ?? [])).catch(() => setCatalog([]));
  }, []);
  return catalog;
}

function identifiedWorkSite(value: string, catalog: WorkSiteRecord[]) {
  const site = catalog.find((item) => item.name === value || item.costCenter === value);
  return site ? [site.costCenter, site.name].filter(Boolean).join(" · ") : value;
}

function identifiedWorkSites(values: string[], catalog: WorkSiteRecord[]) {
  return values.map((value) => identifiedWorkSite(value, catalog)).join(" / ");
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
  const categoryRecords = category === "Historial" ? records : records.filter((record) => record.category === category || (category === "Finiquito" && record.subtype === "Finiquito"));
  if (category === "Historial") return <section className="panel worker-tab-panel"><div className="panel-heading"><div><p className="page-eyebrow">Trazabilidad</p><h2>Historial del trabajador</h2></div></div>{categoryRecords.length || medicalLeaves.length ? <div className="worker-timeline">{[...categoryRecords.map((record) => ({ id: record.id, date: record.createdAt, title: `${record.category} · ${record.subtype}`, detail: record.detail || record.status })), ...medicalLeaves.map((record) => ({ id: record.id, date: record.from, title: `Licencia médica · Folio ${record.folio}`, detail: `${record.days} días · ${record.status ?? "Registrada"}` }))].sort((a, b) => b.date.localeCompare(a.date)).map((event) => <article key={event.id}><span /><div><small>{new Date(event.date).toLocaleDateString("es-CL")}</small><strong>{event.title}</strong><p>{event.detail}</p></div></article>)}</div> : <EmptyResult text="No existen eventos registrados para este trabajador." />}</section>;
  return <section className="panel worker-tab-panel"><div className="panel-heading"><div><p className="page-eyebrow">Ficha del trabajador · solo lectura</p><h2>{category}</h2></div></div>{category === "Licencias médicas" && (medicalLeaves.length ? <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Estado</th><th>Respaldo</th></tr></thead><tbody>{medicalLeaves.map((leave) => <tr key={leave.id}><td>{leave.folio}</td><td>{leave.from}</td><td>{leave.to}</td><td>{leave.days}</td><td>{leave.status ?? "Registrada"}</td><td>{leave.fileKey ? <div className="backup-actions"><button onClick={() => window.open(fileUrl(leave.fileKey!), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(leave.fileKey!, leave.fileName)}>Descargar</button></div> : "Pendiente"}</td></tr>)}</tbody></table></div> : <EmptyResult text="No existen licencias médicas registradas para este trabajador." />)}{category !== "Licencias médicas" && (categoryRecords.length ? <div className="table-wrap"><table><thead><tr><th>Tipo</th><th>Fecha</th><th>Vencimiento</th><th>Estado</th><th>Detalle</th><th>Documento</th></tr></thead><tbody>{categoryRecords.map((record) => <tr key={record.id}><td>{record.subtype}</td><td>{record.issueDate || "—"}</td><td>{record.expiryDate || "No aplica"}</td><td><span className="status-chip">{record.status}</span></td><td>{record.detail || "—"}</td><td>{record.fileKey ? <div className="backup-actions"><button onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(record.fileKey, record.fileName)}>Descargar</button></div> : "Sin archivo"}</td></tr>)}</tbody></table></div> : <EmptyResult text={`No existen registros en ${category.toLowerCase()}.`} />)}<div className="info-banner"><span>i</span><p>Los antecedentes se cargan desde el módulo correspondiente y aparecerán automáticamente en esta ficha.</p></div></section>;
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
  const [baseItems, setBaseItems] = useState<Array<{ category: string; name: string; active: boolean }>>([]);
  useEffect(() => { fetch("/api/system-base-items").then((response) => response.ok ? response.json() : { items: [] }).then((data) => setBaseItems(data.items ?? [])).catch(() => setBaseItems([])); }, []);
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
    if (field.name === "workSite") return <div className="full worker-works-field" key={field.name}><span>Obras asignadas <small>Puedes seleccionar más de una</small></span>{siteOptions.length ? <div className="worker-worksite-options">{siteOptions.map((site) => <label key={site}><input type="checkbox" name="workSites" value={site} defaultChecked={currentSites.includes(site)} /><span>{catalog.find((item) => item.name === site)?.costCenter || site}</span></label>)}</div> : <div className="info-banner"><span>i</span><p>Primero ingresa las obras desde Administración → Obras.</p></div>}</div>;
    if (field.name === "advanceAmount" && requiresAdvance !== "Sí") return null;
    if (field.name === "requiresAdvance") return <label key={field.name}>{field.label}<select name={field.name} value={requiresAdvance} onChange={(event) => setRequiresAdvance(event.target.value)}><option>No</option><option>Sí</option></select></label>;
    const category = ({ role: "Cargos", bank: "Bancos", accountType: "Cuentas", afp: "AFP", health: "Salud" } as Record<string, string>)[field.name];
    const configured = category ? baseItems.filter((item) => item.category === category && item.active).map((item) => item.name) : [];
    const options = configured.length ? configured : field.options;
    return <label key={field.name}>{field.label}{options ? <select name={field.name} required={!field.optional} defaultValue={defaultValue(field)}><option value="" disabled>Seleccionar</option>{[...new Set([...(options ?? []), defaultValue(field)].filter(Boolean))].map((option) => <option key={option}>{option}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} min={field.min} required={!field.optional} defaultValue={defaultValue(field)} />}</label>;
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
    return <div className="worker-profile-summary"><section className="panel worker-identity-card"><div className="worker-photo-column"><div className="worker-photo">{initials}</div><div className="worker-photo-dates"><div><small>Fecha de ingreso</small><strong>{profile?.entryDate ? new Date(`${profile.entryDate}T12:00:00`).toLocaleDateString("es-CL") : "No informada"}</strong></div><div><small>Antigüedad</small><strong>{monthsBetween(profile?.entryDate ?? "")}</strong></div></div></div><div className="worker-identity-main"><div className="worker-profile-top"><div className="worker-badges"><span className="status-chip status-chip--secure">Activo</span><span className="status-chip">Código {profile?.workerCode || "Sin código"}</span></div>{profile && <button className="secondary-button worker-edit-button" onClick={() => navigate(`/personas/editar/${encodeURIComponent(worker.rut)}`, setRoute)}>Editar ficha</button>}</div><h2><span>{displayedName.names}</span>{displayedName.surnames && <> <span>{displayedName.surnames}</span></>}</h2><p>{worker.role || "Sin cargo informado"} <i>•</i> {worker.costCenter || "Sin obra informada"} <i>•</i> {profile?.contractTerm || "Plazo no informado"}</p><div className="worker-key-data"><div><small>RUT</small><strong>{worker.rut}</strong></div><div><small>Edad / Género</small><strong>{profile ? `${ageFrom(profile.birthDate)} · ${profile.gender || "No informado"}` : "No informado"}</strong></div><div><small>Celular</small><strong>{profile?.mobile || "No informado"}</strong></div><div><small>Correo electrónico</small><strong>{profile?.email || "No informado"}</strong></div><div className="wide"><small>Dirección</small><strong>{profile ? `${profile.address}, ${profile.commune}, ${profile.region}` : "No informada"}</strong></div></div></div></section><nav className="worker-profile-tabs" aria-label="Secciones de la ficha">{availableTabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>{activeTab === "Resumen" ? <WorkerSummary records={workerRecords} medicalLeaves={workerMedicalLeaves} /> : activeTab === "Información personal" ? (profile ? <div className="worker-profile-summary personal-info-groups">{workerSections.map((section) => <section className="panel worker-data-section" key={section.title}><h3>{section.title}</h3><div className="profile-summary-grid">{section.fields.map((field) => <div key={field.name}><small>{field.label}</small><strong>{field.name === "workSite" ? profileWorkSites(profile).join(" · ") || "—" : profileValue(profile, field)}</strong></div>)}</div></section>)}</div> : <section className="panel module-panel"><EmptyResult text="No existen antecedentes personales ampliados para este trabajador." /></section>) : <WorkerRecordPanel rut={summaryRut} category={activeTab} records={workerRecords} reload={reloadRecords} medicalLeaves={workerMedicalLeaves} />}<footer className="panel form-footer worker-submit"><button className="secondary-button" onClick={() => navigate("/personas", setRoute)}>← Volver a Trabajadores</button></footer></div>;
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

const documentCatalog: Record<string, string[]> = {
  Vacaciones: ["Vacaciones"],
  "Documentación personal": ["Currículum", "Cédula de Identidad", "Certificado AFP", "Certificado de Salud", "Certificado de antecedentes", "Hoja de vida del conductor", "Licencia de conducir", "Certificado de residencia", "Certificado de estudios", "Título profesional", "Certificado de discapacidad COMPIN", "Resolución de pensión de invalidez", "Comprobante de cuenta bancaria", "Otros documentos personales"],
  "Documentación laboral": ["Contrato de trabajo", "Anexo de obra", "Anexo de plazo", "Anexo Indefinido", "Anexo de cambio de cargo", "Anexo de cambio de obra", "Anexo de cambio de jornada", "Anexo de remuneración", "Ingreso a la DT", "IRL", "RIOHS", "Pacto de horas extraordinarias", "Carta de amonestación", "Otros documentos laborales"],
  "Asignación empresa": ["Acta de entrega de equipo", "Acta de devolución de equipo", "Documento de entrega de EPP", "Otros documentos de asignación"],
  "Certificaciones / Cursos": ["Certificado de curso", "Certificado de capacitación", "Certificación de operador de maquinaria", "Certificación de conductor profesional", "Certificado de trabajo en altura", "Certificado de espacios confinados", "Certificación de soldadura", "Certificación Rigger", "Certificado de manejo defensivo", "Certificado para operar retroexcavadora", "Certificado para operar excavadora", "Certificado para operar grúa", "Certificado para operar rodillo", "Certificado para operar minicargador", "Otros certificados de cursos y equipos"],
  "Exámenes": ["Examen preocupacional", "Examen ocupacional", "Examen de altura física", "Examen de altura geográfica", "Examen de alcohol y drogas", "Examen para conductores", "Examen psicosensotécnico", "Otros exámenes", "Certificado de incorporación al seguro", "Otros documentos de seguros"],
  Finiquito: ["Carta de aviso de término", "Finiquito", "Comprobante de envío de finiquito", "Comprobante de pago de finiquito", "Reserva de derechos", "Reclamo ante la Dirección del Trabajo", "Respaldo de otros reclamos", "Acta de devolución de equipos", "Otros documentos de finiquito"],
};
const customDocumentTypes = new Set(["Otros documentos personales", "Otros documentos laborales", "Otros documentos de asignación", "Otros certificados de cursos y equipos", "Otros exámenes", "Otros documentos de seguros", "Respaldo de otros reclamos", "Otros documentos de finiquito"]);
function safeFilePart(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, ""); }
function safePersonFilePart(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 -]+/g, " ").replace(/\s+/g, " ").trim(); }

export function DocumentModule({ processes }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers, profiles } = useConnectedWorkers(processes); const [rut, setRut] = useState(""); const [category, setCategory] = useState("Documentación personal"); const [subtype, setSubtype] = useState(documentCatalog["Documentación personal"][0]); const [records, setRecords] = useState<WorkerRecord[]>([]); const [saving, setSaving] = useState(false);
  const load = () => rut ? fetch(`/api/worker-records?rut=${encodeURIComponent(rut)}`).then((r) => r.ok ? r.json() : { records: [] }).then((d) => setRecords(d.records ?? [])).catch(() => setRecords([])) : setRecords([]);
  useEffect(() => { load(); }, [rut]);
  const worker = workers.find((item) => item.rut === rut); const profile = profiles.find((item) => item.identityNumber === rut);
  return <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Repositorio central</p><h2>Gestión Documental</h2></div></div><div className="document-workspace-filters"><label>Trabajador<select value={rut} onChange={(event) => setRut(event.target.value)}><option value="">Seleccionar trabajador</option>{workers.map((item) => <option key={item.rut} value={item.rut}>{item.name} · {item.rut}</option>)}</select></label><label>Tipo de documentación<select value={category} onChange={(event) => { const value = event.target.value; setCategory(value); setSubtype(documentCatalog[value][0]); }}><option value="Vacaciones">Vacaciones</option><option value="Documentación personal">Documentos personales</option><option value="Documentación laboral">Documentos laborales</option><option value="Asignación empresa">Asignación de empresa y equipos</option><option value="Certificaciones / Cursos">Certificaciones y cursos</option><option value="Exámenes">Exámenes y seguros</option><option value="Finiquito">Finiquitos y desvinculación</option></select></label></div><form className="document-upload-card" onSubmit={async (event) => { event.preventDefault(); if (!worker) return; setSaving(true); const form = new FormData(event.currentTarget); const effectiveType = customDocumentTypes.has(subtype) ? String(form.get("customType") || subtype) : subtype; const issueDate = String(form.get("issueDate")); const folio = String(form.get("folio") || ""); const parts = profile ? { names: profile.firstNames || nameParts(worker.name).names, surnames: profile.lastNames || nameParts(worker.name).surnames } : nameParts(worker.name); const automaticName = category === "Vacaciones" ? `${safePersonFilePart(parts.surnames)} ${safePersonFilePart(parts.names)}_${safeFilePart(folio)}.pdf` : `${safeFilePart(effectiveType)}_${safeFilePart(`${parts.surnames} ${parts.names}`)}_${safeFilePart(profile?.workerCode || worker.rut)}_${issueDate}.pdf`; form.set("workerRut", worker.rut); form.set("category", category); form.set("subtype", effectiveType); form.set("title", category === "Vacaciones" ? folio : effectiveType); if (category === "Vacaciones") form.set("metadata", JSON.stringify({ folio })); form.set("storedFileName", automaticName); const response = await fetch("/api/worker-records", { method: "POST", body: form }); setSaving(false); if (!response.ok) return window.alert((await response.json()).error || "No fue posible cargar el documento."); event.currentTarget.reset(); load(); window.alert(`Documento guardado como ${automaticName}`); }}><div className="section-actions"><div><h3>＋ Agregar documento</h3><p>El archivo se guardará en PDF con nombre automático.</p></div></div><div className="form-grid"><label>Documento<select value={subtype} onChange={(event) => setSubtype(event.target.value)}>{documentCatalog[category].map((item) => <option key={item}>{item}</option>)}</select></label>{customDocumentTypes.has(subtype) && <label>Nombre del documento<input name="customType" required /></label>}{category === "Vacaciones" ? <><label>Folio<input name="folio" required /></label><label>Fecha desde<input name="issueDate" type="date" defaultValue={localDate()} required /></label><label>Fecha hasta<input name="expiryDate" type="date" required /></label></> : <><label>Fecha<input name="issueDate" type="date" defaultValue={localDate()} required /></label><label>Fecha de vencimiento (opcional)<input name="expiryDate" type="date" /></label></>}<label className="full file-picker">Documento PDF<input name="file" type="file" accept="application/pdf,.pdf" required /></label></div><footer className="form-footer"><button className="primary-button" disabled={!rut || saving}>{saving ? "Guardando…" : "Cargar documento"}</button></footer></form>{rut ? records.length ? <div className="table-wrap"><table><thead><tr><th>Categoría</th><th>Documento</th><th>Fecha</th><th>Vencimiento</th><th>Nombre guardado</th><th>Acciones</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{record.category}</td><td>{record.subtype}</td><td>{record.issueDate || "—"}</td><td>{record.expiryDate || "No aplica"}</td><td>{record.fileName}</td><td>{record.fileKey && <div className="backup-actions"><button onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(record.fileKey, record.fileName)}>Descargar</button></div>}</td></tr>)}</tbody></table></div> : <EmptyResult text="Este trabajador aún no tiene documentos cargados." /> : <EmptyResult text="Selecciona un trabajador para administrar sus documentos." />}</section>;
}

function defaultRow(state = "Presente"): AttendanceRow {
  return { states: [state], amIn: "08:00", amOut: "13:00", pmIn: "15:00", pmOut: "18:00" };
}

function AttendanceDayDocuments({ rut, day }: { rut: string; day: string }) {
  const [records, setRecords] = useState<WorkerRecord[]>([]);
  const load = () => fetch(`/api/worker-records?rut=${encodeURIComponent(rut)}&category=Asistencia`).then((r) => r.ok ? r.json() : { records: [] }).then((d) => setRecords((d.records ?? []).filter((item: WorkerRecord) => item.issueDate === day))).catch(() => setRecords([]));
  useEffect(() => { if (rut && day) load(); }, [rut, day]);
  return <div className="attendance-extra-documents"><h4>Documentos adicionales</h4><form onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set("workerRut", rut); form.set("category", "Asistencia"); form.set("issueDate", day); const response = await fetch("/api/worker-records", { method: "POST", body: form }); if (response.ok) { event.currentTarget.reset(); load(); } else window.alert("No fue posible agregar el respaldo."); }}><label>Tipo<select name="subtype"><option>Declaración jurada</option><option>Reinducción</option><option>Otro respaldo</option></select></label><label>Observación escrita<textarea name="detail" rows={3} placeholder="Indica la observación del día" /></label><label>Archivo<input name="file" type="file" /></label><button className="primary-button">Agregar</button></form>{records.map((record) => <article key={record.id}><div><strong>{record.subtype}</strong><small>{record.detail || "Sin observación"}</small></div>{record.fileKey ? <div className="backup-actions"><button onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(record.fileKey, record.fileName)}>Descargar</button></div> : <span>Sin archivo</span>}</article>)}</div>;
}

export function AttendanceModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes);
  const workSiteCatalog = useWorkSiteCatalog();
  const costCenters = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]);
  const [date, setDate] = useState(localDate());
  const [scope, setScope] = useState("all");
  const [rows, setRows] = useState<Record<string, AttendanceRow>>({});
  const [rowFiles, setRowFiles] = useState<Record<string, File | null>>({});
  const [medicalLeaves, setMedicalLeaves] = useState<MedicalLeaveRecord[]>([]);
  const [vacationRecords, setVacationRecords] = useState<WorkerRecord[]>([]);
  const [holidays, setHolidays] = useState<Array<{ value: string }>>([]);
  const [locked, setLocked] = useState(false);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(localDate().slice(0, 7));
  const [summaryScope, setSummaryScope] = useState("all");
  const [summaryCenter, setSummaryCenter] = useState("");
  const [summaryMode, setSummaryMode] = useState("month");
  const [summaryMonth, setSummaryMonth] = useState(localDate().slice(0, 7));
  const [summaryDay, setSummaryDay] = useState(localDate());
  const [selectedDay, setSelectedDay] = useState("");
  const visibleWorkers = scope === "all" ? workers : workers.filter((worker) => worker.workSites.includes(scope));
  const loadEntries = () => fetch("/api/attendance").then((response) => response.ok ? response.json() : { entries: [] }).then((data: { entries?: AttendanceEntry[] }) => setEntries(data.entries ?? [])).catch(() => setEntries([]));
  useEffect(() => { loadEntries(); fetch("/api/medical-leaves").then((r) => r.ok ? r.json() : { medicalLeaves: [] }).then((data) => setMedicalLeaves((data.medicalLeaves ?? []).map((leave: MedicalLeaveRecord & { dateFrom?: string; dateTo?: string }) => ({ ...leave, from: leave.from || leave.dateFrom || "", to: leave.to || leave.dateTo || "" })))); fetch("/api/worker-records?category=Vacaciones").then((r) => r.ok ? r.json() : { records: [] }).then((data) => setVacationRecords(data.records ?? [])); fetch("/api/system-base-items?category=Feriados").then((r) => r.ok ? r.json() : { items: [] }).then((data) => setHolidays(data.items ?? [])); }, []);

  function inferredState(rut: string) { if (medicalLeaves.some((leave) => leave.workerRut === rut && date >= leave.from && date <= leave.to)) return "Licencia médica"; if (vacationRecords.some((record) => record.workerRut === rut && record.status !== "Rechazada" && date >= record.issueDate && date <= record.expiryDate)) return "Vacaciones"; if (holidays.some((holiday) => holiday.value === date)) return "Feriado"; return "Presente"; }
  function rowFor(rut: string) { return rows[rut] ?? defaultRow(inferredState(rut)); }
  function updateRow(rut: string, update: Partial<AttendanceRow>) { setRows((current) => ({ ...current, [rut]: { ...rowFor(rut), ...update } })); }
  async function submitReview() {
    if (!visibleWorkers.length) return window.alert("Selecciona una dotación con trabajadores registrados.");
    const form = new FormData(); form.set("date", date); form.set("attachmentType", "Respaldo individual"); const payload = visibleWorkers.map((worker, index) => { const fileField = `file-${index}`; const file = rowFiles[worker.rut]; if (file) form.set(fileField, file); return { workerRut: worker.rut, workerName: worker.name, costCenter: scope === "all" ? worker.workSites[0] || worker.costCenter : scope, fileField, ...rowFor(worker.rut) }; }); form.set("rows", JSON.stringify(payload));
    const response = await fetch("/api/attendance", { method: "POST", body: form }); const data = await response.json() as { error?: string };
    if (!response.ok) return window.alert(data.error ?? "No fue posible enviar la asistencia.");
    setLocked(true); loadEntries();
  }

  const selectedEntries = entries.filter((entry) => entry.workerRut === selectedWorker && entry.date.startsWith(selectedMonth));
  const calendarDays = useMemo(() => { const [year, month] = selectedMonth.split("-").map(Number); const total = new Date(year, month, 0).getDate(); return Array.from({ length: total }, (_, index) => `${selectedMonth}-${String(index + 1).padStart(2, "0")}`); }, [selectedMonth]);
  const summaryEntries = entries.filter((entry) => (summaryScope === "all" || entry.costCenter === summaryCenter) && (summaryMode === "day" ? entry.date === summaryDay : entry.date.startsWith(summaryMonth)));
  const summaryRows = [...new Map(summaryEntries.map((entry) => [entry.workerRut, { workerRut: entry.workerRut, workerName: entry.workerName, costCenter: entry.costCenter, days: summaryEntries.filter((item) => item.workerRut === entry.workerRut).length, status: (() => { try { return (JSON.parse(entry.states) as string[]).join(", "); } catch { return entry.states; } })() }])).values()];
  const stateOf = (entry?: AttendanceEntry) => { if (!entry) return "Sin información"; try { return (JSON.parse(entry.states) as string[])[0] || "Sin información"; } catch { return entry.states || "Sin información"; } };
  const stateClass = (state: string) => state.includes("Vacaciones") ? "vacation" : state.includes("Licencia") ? "leave" : state.includes("Permiso") ? "permission" : state.includes("Inasistencia") ? "absent" : state === "Presente" ? "worked" : "empty";
  const individualStats = { worked: selectedEntries.filter((entry) => stateOf(entry) === "Presente").length, vacations: selectedEntries.filter((entry) => stateOf(entry) === "Vacaciones").length, leaves: selectedEntries.filter((entry) => stateOf(entry) === "Licencia médica").length, permissions: selectedEntries.filter((entry) => stateOf(entry).includes("Permiso")).length, absences: selectedEntries.filter((entry) => stateOf(entry) === "Inasistencia").length };
  const selectedEntry = selectedEntries.find((entry) => entry.date === selectedDay);

  if (route === "/asistencia/nuevo") return <section className="panel attendance-entry">
    <div className="panel-heading"><div><p className="page-eyebrow">Nuevo ingreso</p><h2>Informar asistencia</h2></div><span className={`status-chip ${locked ? "status-chip--secure" : "status-chip--draft"}`}>{locked ? "En revisión · bloqueado" : "Borrador"}</span></div>
    <fieldset disabled={locked}>
      <div className="attendance-controls">
        <label>Día<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Obra<select value={scope} onChange={(event) => { setScope(event.target.value); setRows({}); }}><option value="all">Total empresa</option>{costCenters.map((center) => <option key={center} value={center}>{identifiedWorkSite(center, workSiteCatalog)}</option>)}</select></label>
      </div>
      <div className="attendance-list"><div className="attendance-list-head attendance-list-head--files"><span>Trabajador</span><span>Estado</span><span>Primera Jornada (AM)<small>Ingreso · Salida</small></span><span>Jornada PM<small>Ingreso · Salida</small></span><span>Archivo del trabajador</span></div>{visibleWorkers.length ? visibleWorkers.map((worker) => { const row = rowFor(worker.rut); return <div className="attendance-worker-row attendance-worker-row--files" key={worker.rut}><div><strong>{worker.name}</strong><small>{worker.rut} · {identifiedWorkSites(worker.workSites, workSiteCatalog)}</small></div><select value={row.states[0]} onChange={(event) => updateRow(worker.rut, { states: [event.target.value] })} aria-label={`Estado de ${worker.name}`}>{attendanceStates.map((status) => <option key={status}>{status}</option>)}</select><div className="shift-times"><input aria-label={`Ingreso AM de ${worker.name}`} type="time" value={row.amIn} onChange={(event) => updateRow(worker.rut, { amIn: event.target.value })} /><input aria-label={`Salida AM de ${worker.name}`} type="time" value={row.amOut} onChange={(event) => updateRow(worker.rut, { amOut: event.target.value })} /></div><div className="shift-times"><input aria-label={`Ingreso PM de ${worker.name}`} type="time" value={row.pmIn} onChange={(event) => updateRow(worker.rut, { pmIn: event.target.value })} /><input aria-label={`Salida PM de ${worker.name}`} type="time" value={row.pmOut} onChange={(event) => updateRow(worker.rut, { pmOut: event.target.value })} /></div><label className="row-file-picker"><input type="file" onChange={(event) => setRowFiles((current) => ({ ...current, [worker.rut]: event.target.files?.[0] ?? null }))} /><small>{rowFiles[worker.rut]?.name || "Seleccionar respaldo"}</small></label></div>; }) : <EmptyResult text={workers.length ? "Selecciona una obra con trabajadores." : "No hay trabajadores registrados para informar asistencia."} />}</div>
    </fieldset>
    <footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/asistencia", setRoute)}>Volver</button><button className="primary-button" disabled={locked} onClick={submitReview}>{locked ? "Enviado a revisión" : "Enviar a revisión"}</button></footer>
  </section>;

  if (route === "/asistencia/trabajador") return <><div className="tabs"><button onClick={() => navigate("/asistencia", setRoute)}>Vista general mensual</button><button className="active">Vista individual</button><button onClick={() => navigate("/reportes/asistencia", setRoute)}>Reporte de asistencia</button></div><section className="panel module-panel"><div className="worker-month-filter"><label>Trabajador<select value={selectedWorker} onChange={(event) => { setSelectedWorker(event.target.value); setSelectedDay(""); }}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.rut} · {worker.name} · {identifiedWorkSites(worker.workSites, workSiteCatalog)}</option>)}</select></label><label>Mes<input type="month" value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setSelectedDay(""); }} /></label></div>{selectedWorker ? <><div className="attendance-stat-grid"><div><small>Horas trabajadas</small><strong>{individualStats.worked * 8}:00</strong></div><div><small>Días trabajados</small><strong>{individualStats.worked}</strong></div><div><small>Vacaciones</small><strong>{individualStats.vacations}</strong></div><div><small>Licencias</small><strong>{individualStats.leaves}</strong></div><div><small>Permisos</small><strong>{individualStats.permissions}</strong></div><div><small>Ausencias</small><strong>{individualStats.absences}</strong></div></div><div className="attendance-individual-layout"><div className="attendance-calendar attendance-calendar--detail">{calendarDays.map((day) => { const entry = selectedEntries.find((item) => item.date === day); const state = stateOf(entry); return <button type="button" key={day} className={`${entry ? "has-entry" : ""} ${selectedDay === day ? "selected" : ""}`} onClick={() => setSelectedDay(day)}><strong>{Number(day.slice(-2))}</strong><span className={`attendance-day-bar ${stateClass(state)}`} /><small>{state}</small></button>; })}</div><aside className="attendance-day-detail"><h3>{selectedDay ? new Date(`${selectedDay}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "long" }) : "Selecciona un día"}</h3>{selectedDay && <><span className={`attendance-legend-chip ${stateClass(stateOf(selectedEntry))}`}>{stateOf(selectedEntry)}</span>{selectedEntry ? <><div className="attendance-times-detail"><div><small>Ingreso 1</small><strong>{selectedEntry.amIn}</strong></div><div><small>Salida 1</small><strong>{selectedEntry.amOut}</strong></div><div><small>Ingreso 2</small><strong>{selectedEntry.pmIn}</strong></div><div><small>Salida 2</small><strong>{selectedEntry.pmOut}</strong></div></div>{selectedEntry.fileKey ? <div className="backup-actions"><button onClick={() => window.open(fileUrl(selectedEntry.fileKey), "_blank")}>Ver respaldo</button><button onClick={() => downloadStoredFile(selectedEntry.fileKey, selectedEntry.fileName)}>Descargar</button></div> : <p>Sin respaldo cargado.</p>}</> : <p>No hay asistencia informada para este día.</p>}<AttendanceDayDocuments rut={selectedWorker} day={selectedDay} /></>}</aside></div></> : <div className="search-prompt"><span>○</span><strong>Selecciona un trabajador</strong><p>Luego elige el mes para ver el calendario y sus respaldos.</p></div>}</section></>;

  const matrixWorkers = (summaryScope === "all" ? workers : workers.filter((worker) => worker.workSites.includes(summaryCenter))).filter((worker) => summaryMode === "month" || summaryEntries.some((entry) => entry.workerRut === worker.rut));
  const matrixDays = summaryMode === "day" ? [summaryDay] : (() => { const [year, month] = summaryMonth.split("-").map(Number); return Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => `${summaryMonth}-${String(index + 1).padStart(2, "0")}`); })();
  return <><section className="panel module-panel attendance-summary-toolbar"><div className="section-actions"><div><p className="page-eyebrow">Asistencia</p><h2>Resumen mensual</h2></div><div className="backup-actions"><button onClick={() => navigate("/reportes/asistencia", setRoute)}>Reporte de asistencia</button><button className="primary-button" onClick={() => { setLocked(false); setRowFiles({}); navigate("/asistencia/nuevo", setRoute); }}>＋ Nuevo ingreso</button></div></div><div className="attendance-summary-filters"><label>Obra<select value={summaryScope === "all" ? "all" : summaryCenter} onChange={(event) => { const value = event.target.value; setSummaryScope(value === "all" ? "all" : "center"); setSummaryCenter(value === "all" ? "" : value); }}><option value="all">Todas las obras</option>{costCenters.map((center) => <option key={center} value={center}>{identifiedWorkSite(center, workSiteCatalog)}</option>)}</select></label><label>Consultar por<select value={summaryMode} onChange={(event) => setSummaryMode(event.target.value)}><option value="month">Mes</option><option value="day">Día</option></select></label>{summaryMode === "month" ? <label>Mes<input type="month" value={summaryMonth} onChange={(event) => setSummaryMonth(event.target.value)} /></label> : <label>Día<input type="date" value={summaryDay} onChange={(event) => setSummaryDay(event.target.value)} /></label>}<button className="secondary-button" onClick={loadEntries}>Actualizar</button></div><div className="tabs"><button className="active">Vista general mensual</button><button onClick={() => navigate("/asistencia/trabajador", setRoute)}>Vista individual</button></div></section><section className="panel module-panel"><div className="attendance-matrix-heading"><h2>Asistencia mensual por trabajador</h2><div className="attendance-legend"><span className="worked">Trabajado</span><span className="vacation">Vacaciones</span><span className="leave">Licencia</span><span className="permission">Permiso</span><span className="absent">Ausente</span></div></div><div className="attendance-matrix-wrap"><table className="attendance-matrix"><thead><tr><th>Trabajador / Obra</th>{matrixDays.map((day) => <th key={day}>{Number(day.slice(-2))}</th>)}</tr></thead><tbody>{matrixWorkers.map((worker) => <tr key={worker.rut}><td><strong>{worker.name}</strong><small>{identifiedWorkSites(worker.workSites, workSiteCatalog) || worker.costCenter}</small></td>{matrixDays.map((day) => { const entry = entries.find((item) => item.workerRut === worker.rut && item.date === day); const state = stateOf(entry); return <td key={day} title={`${day}: ${state}`}><button className={`attendance-dot ${stateClass(state)}`} onClick={() => { setSelectedWorker(worker.rut); setSelectedMonth(day.slice(0, 7)); setSelectedDay(day); navigate("/asistencia/trabajador", setRoute); }} aria-label={`${worker.name}, ${day}: ${state}`} /></td>; })}</tr>)}</tbody></table></div>{!matrixWorkers.length && <EmptyResult text="No existen trabajadores para los filtros seleccionados." />}</section></>;
}

function VacationPeriodDocument({ record, records, reload }: { record: WorkerRecord; records: WorkerRecord[]; reload: () => void }) {
  const support = records.find((item) => metadataOf(item).supportFor === record.id);
  if (record.fileKey || support?.fileKey) { const item = record.fileKey ? record : support!; return <div className="backup-actions"><button onClick={() => window.open(fileUrl(item.fileKey), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(item.fileKey, item.fileName)}>Descargar</button></div>; }
  return <form className="vacation-period-upload" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); form.set("workerRut", record.workerRut); form.set("category", "Vacaciones"); form.set("subtype", "Respaldo del período"); form.set("title", `Respaldo ${record.title}`); form.set("issueDate", record.issueDate); form.set("expiryDate", record.expiryDate); form.set("metadata", JSON.stringify({ supportFor: record.id })); const response = await fetch("/api/worker-records", { method: "POST", body: form }); if (response.ok) reload(); }}><input name="file" type="file" accept="application/pdf,.pdf" required /><button className="table-action">Cargar respaldo</button></form>;
}

export function VacationsModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers, profiles } = useConnectedWorkers(processes);
  const workSiteCatalog = useWorkSiteCatalog();
  const routeRut = route.startsWith("/vacaciones/nueva-solicitud/") ? decodeURIComponent(route.slice("/vacaciones/nueva-solicitud/".length)) : "";
  const routeWorker = workers.find((worker) => worker.rut === routeRut);
  const [requestWorker, setRequestWorker] = useState(routeWorker?.rut ?? "");
  const [selectedRut, setSelectedRut] = useState("");
  const [vacationView, setVacationView] = useState<"general" | "individual">("general");
  const [centerFilter, setCenterFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [folio] = useState(() => `VAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
  const [records, setRecords] = useState<WorkerRecord[]>([]);
  const costCenters = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]);
  const loadRecords = () => fetch("/api/worker-records?category=Vacaciones").then((response) => response.ok ? response.json() : { records: [] }).then((data: { records?: WorkerRecord[] }) => setRecords(data.records ?? [])).catch(() => setRecords([]));
  useEffect(() => { loadRecords(); }, []);
  const filteredWorkers = workers.filter((worker) => (!centerFilter || worker.workSites.includes(centerFilter)) && (!workerFilter || worker.rut === workerFilter));
  const vacationMeta = (record: WorkerRecord) => metadataOf(record) as { folio?: string; businessDays?: number };
  const balanceFor = (worker: Worker) => { const profile = profiles.find((item) => item.identityNumber === worker.rut); const entry = profile?.entryDate ? new Date(`${profile.entryDate}T12:00:00`) : null; const now = new Date(); const months = entry ? Math.max(0, (now.getFullYear() - entry.getFullYear()) * 12 + now.getMonth() - entry.getMonth()) : 0; const legal = Math.round(months * 1.25 * 100) / 100; const taken = records.filter((record) => record.workerRut === worker.rut && record.subtype === "Solicitud de vacaciones" && record.status !== "Rechazada").reduce((total, record) => total + Number(vacationMeta(record).businessDays ?? 0), 0); return { legal, taken, available: Math.max(0, Math.round((legal - taken) * 100) / 100), progressive: 0 }; };
  const selected = workers.find((worker) => worker.rut === selectedRut); const selectedBalance = selected ? balanceFor(selected) : null; const selectedRecords = records.filter((record) => record.workerRut === selectedRut && ["Solicitud de vacaciones", "Vacaciones"].includes(record.subtype));

  if (route.startsWith("/vacaciones/nueva-solicitud")) return <form className="panel process-form" onSubmit={async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const worker = workers.find((item) => item.rut === requestWorker); if (!worker) return window.alert("Selecciona un trabajador."); const source = new FormData(event.currentTarget); const from = String(source.get("from")); const to = String(source.get("to")); const folio = String(source.get("folio")); const start = new Date(`${from}T12:00:00`); const end = new Date(`${to}T12:00:00`); let businessDays = 0; for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) if (day.getDay() !== 0 && day.getDay() !== 6) businessDays += 1; const form = new FormData(); form.set("workerRut", worker.rut); form.set("category", "Vacaciones"); form.set("subtype", "Solicitud de vacaciones"); form.set("title", folio); form.set("issueDate", from); form.set("expiryDate", to); form.set("status", "Pendiente de firma"); form.set("detail", `${businessDays} días hábiles`); form.set("metadata", JSON.stringify({ folio, businessDays })); const response = await fetch("/api/worker-records", { method: "POST", body: form }); const data = await response.json() as { error?: string }; if (!response.ok) return window.alert(data.error ?? "No fue posible enviar la solicitud."); window.alert("Solicitud de vacaciones enviada correctamente."); navigate("/vacaciones", setRoute);
  }}><div className="panel-heading"><div><p className="page-eyebrow">Vacaciones</p><h2>Nueva solicitud</h2></div><span className="status-chip status-chip--draft">Solicitud</span></div><div className="form-grid"><label>Número de folio<input name="folio" value={folio} readOnly /></label><label className="full">Trabajador<select name="worker" value={requestWorker} onChange={(event) => setRequestWorker(event.target.value)} required><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label><label>Desde<input name="from" type="date" required /></label><label>Hasta<input name="to" type="date" required /></label></div><footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/vacaciones", setRoute)}>Cancelar</button><button className="primary-button">Enviar solicitud</button></footer></form>;

  return <div className="vacation-module"><div className="tabs"><button className={vacationView === "general" ? "active" : ""} onClick={() => setVacationView("general")}>Vista general</button><button className={vacationView === "individual" ? "active" : ""} onClick={() => setVacationView("individual")}>Vista individual</button><button onClick={() => navigate("/reportes/vacaciones", setRoute)}>Reporte de vacaciones</button></div>{vacationView === "general" ? <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Vacaciones</p><h2>Resumen de saldos por trabajador</h2></div><button className="primary-button" onClick={() => navigate(selected ? `/vacaciones/nueva-solicitud/${encodeURIComponent(selected.rut)}` : "/vacaciones/nueva-solicitud", setRoute)}>＋ Nueva solicitud</button></div><div className="vacation-filters"><label>Obra<select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">Todas las obras</option>{costCenters.map((center) => <option key={center} value={center}>{identifiedWorkSite(center, workSiteCatalog)}</option>)}</select></label><label>Trabajador<select value={workerFilter} onChange={(event) => setWorkerFilter(event.target.value)}><option value="">Todos los trabajadores</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name}</option>)}</select></label></div><div className="table-wrap"><table><thead><tr><th>Trabajador</th><th>Obra</th><th>Saldo disponible</th></tr></thead><tbody>{filteredWorkers.map((worker) => { const balance = balanceFor(worker); return <tr key={worker.rut}><td>{worker.name}</td><td>{identifiedWorkSites(worker.workSites, workSiteCatalog) || worker.costCenter || "—"}</td><td>{balance.available.toLocaleString("es-CL")} días</td></tr>; })}</tbody></table></div></section> : <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Vista individual</p><h2>Vacaciones por trabajador</h2></div></div><div className="worker-selector-row"><label>Trabajador<select value={selectedRut} onChange={(event) => setSelectedRut(event.target.value)}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label></div>{selected && selectedBalance ? <><div className="vacation-balance-cards"><article><small>Saldo disponible</small><strong>{selectedBalance.available.toLocaleString("es-CL")}</strong><span>días hábiles</span></article><article><small>Vacaciones legales</small><strong>{selectedBalance.legal.toLocaleString("es-CL")}</strong><span>devengo estimado a la fecha</span></article><article><small>Progresivas</small><strong>{selectedBalance.progressive.toLocaleString("es-CL")}</strong><span>sin certificado registrado</span></article></div>{selectedRecords.length ? <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Período</th><th>Días hábiles</th><th>Estado</th><th>Documento</th></tr></thead><tbody>{selectedRecords.map((record) => { const meta = vacationMeta(record); return <tr key={record.id}><td>{meta.folio || record.title}</td><td>{record.issueDate} al {record.expiryDate}</td><td>{meta.businessDays ?? "—"}</td><td>{record.status}</td><td><VacationPeriodDocument record={record} records={records} reload={loadRecords} /></td></tr>; })}</tbody></table></div> : <EmptyResult text="Este trabajador no registra períodos de vacaciones." />}</> : <div className="search-prompt"><span>○</span><strong>Selecciona un trabajador</strong><p>Verás su resumen, períodos y documentos de respaldo.</p></div>}</section>}</div>;
}

export function MedicalLeaveModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes);
  const workSiteCatalog = useWorkSiteCatalog();
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
      <label>Obra<input value={selectedWorker ? identifiedWorkSites(selectedWorker.workSites, workSiteCatalog) : ""} readOnly placeholder="Se completa al seleccionar trabajador" /></label>
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
    <div className="medical-filters"><label>Trabajador<select value={workerFilter} onChange={(event) => setWorkerFilter(event.target.value)}><option value="">Todos los trabajadores</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name}</option>)}</select></label><label>Obra<select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">Todas las obras</option>{costCenters.map((center) => <option key={center} value={center}>{identifiedWorkSite(center, workSiteCatalog)}</option>)}</select></label><label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label></div>
    <div className="license-summary"><div><small>Con licencia en el período</small><strong>{filtered.length}</strong></div><div><small>Días informados</small><strong>{filtered.reduce((total, record) => total + record.days, 0)}</strong></div></div>
    {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Obra</th><th>Trabajador</th><th>Desde</th><th>Hasta</th><th>N° de días</th><th>Folio</th><th>Especialidad</th><th>Respaldo</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td>{identifiedWorkSites(record.costCenter.split(" · ").filter(Boolean), workSiteCatalog) || "—"}</td><td>{record.workerName}</td><td>{new Date(`${record.from}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{new Date(`${record.to}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.days}</td><td>{record.folio}</td><td>{record.specialty}</td><td>{record.fileKey ? <div className="backup-actions"><button onClick={() => window.open(fileUrl(record.fileKey!), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(record.fileKey!, record.fileName)}>Descargar</button></div> : "Opcional · no cargado"}</td></tr>)}</tbody></table></div> : <EmptyResult text="No hay trabajadores con licencia para los filtros seleccionados." />}
  </section>;
}

const laborFolderTypes = ["F30", "F30-1", "Liquidaciones de sueldo", "Comprobantes de pago de remuneraciones", "Certificado de cotizaciones", "Libro de Remuneraciones Electrónico", "LRE SUCAL", "Nómina de trabajadores", "Facturas de seguro", "Comprobantes de pago de seguro", "Certificados de incorporación", "Otros documentos de la carpeta laboral mensual"];

export function LaborFolderModule({ processes }: { processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes); const workSiteCatalog = useWorkSiteCatalog(); const works = useMemo(() => [...new Set(workers.flatMap((worker) => worker.workSites).filter(Boolean))], [workers]); const [month, setMonth] = useState(localDate().slice(0, 7)); const [work, setWork] = useState(""); const [type, setType] = useState(laborFolderTypes[0]); const [records, setRecords] = useState<WorkerRecord[]>([]);
  const folderRut = work ? `OBRA:${work}` : ""; const load = () => folderRut ? fetch(`/api/worker-records?rut=${encodeURIComponent(folderRut)}&category=${encodeURIComponent("Carpeta Laboral")}`).then((r) => r.ok ? r.json() : { records: [] }).then((d) => setRecords((d.records ?? []).filter((item: WorkerRecord) => item.issueDate.startsWith(month)))).catch(() => setRecords([])) : setRecords([]); useEffect(() => { load(); }, [folderRut, month]);
  return <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Respaldo mensual</p><h2>Carpeta Laboral</h2></div></div><div className="document-workspace-filters"><label>Mes<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label><label>Obra<select value={work} onChange={(event) => setWork(event.target.value)}><option value="">Seleccionar obra</option>{works.map((item) => <option key={item} value={item}>{identifiedWorkSite(item, workSiteCatalog)}</option>)}</select></label></div><form className="document-upload-card" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const effectiveType = type.startsWith("Otros") ? String(form.get("customType")) : type; form.set("workerRut", folderRut); form.set("category", "Carpeta Laboral"); form.set("subtype", effectiveType); form.set("title", effectiveType); form.set("issueDate", `${month}-01`); form.set("storedFileName", `${safeFilePart(effectiveType)}_${safeFilePart(work)}_${month}.pdf`); const response = await fetch("/api/worker-records", { method: "POST", body: form }); if (response.ok) { event.currentTarget.reset(); load(); } else window.alert((await response.json()).error || "No fue posible cargar el archivo."); }}><h3>＋ Agregar archivo</h3><div className="form-grid"><label>Documento<select value={type} onChange={(event) => setType(event.target.value)}>{laborFolderTypes.map((item) => <option key={item}>{item}</option>)}</select></label>{type.startsWith("Otros") && <label>Nombre del documento<input name="customType" required /></label>}<label className="full file-picker">Archivo PDF<input name="file" type="file" accept="application/pdf,.pdf" required /></label></div><footer className="form-footer"><button className="primary-button" disabled={!work}>Cargar archivo</button></footer></form>{records.length ? <div className="table-wrap"><table><thead><tr><th>Mes</th><th>Obra</th><th>Documento</th><th>Archivo</th><th>Acciones</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{month}</td><td>{identifiedWorkSite(work, workSiteCatalog)}</td><td>{record.subtype}</td><td>{record.fileName}</td><td><div className="backup-actions"><button onClick={() => window.open(fileUrl(record.fileKey), "_blank")}>Ver</button><button onClick={() => downloadStoredFile(record.fileKey, record.fileName)}>Descargar</button></div></td></tr>)}</tbody></table></div> : <EmptyResult text={work ? "No hay documentos para esta obra y mes." : "Selecciona una obra para consultar su carpeta laboral."} />}</section>;
}

export function CompaniesModule({ route, setRoute }: { route: string; setRoute: (path: string) => void }) {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  useEffect(() => { try { setCompanies(JSON.parse(sessionStorage.getItem("sig-companies") ?? "[]")); } catch { setCompanies([]); } }, []);
  const editId = route.startsWith("/administracion/empresas/editar/") ? decodeURIComponent(route.slice("/administracion/empresas/editar/".length)) : ""; const editing = companies.find((item) => item.id === editId);
  if (route === "/administracion/empresas/nueva" || editId) return <form className="panel process-form" onSubmit={(event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const company: CompanyRecord = { id: editing?.id || crypto.randomUUID(), legalName: String(values.legalName), rut: String(values.rut), tradeName: String(values.tradeName), representative: String(values.representative), address: String(values.address), status: String(values.status) };
    const updated = editing ? companies.map((item) => item.id === editing.id ? company : item) : [company, ...companies]; setCompanies(updated); sessionStorage.setItem("sig-companies", JSON.stringify(updated));
    window.alert(editing ? "Empresa modificada correctamente." : "Empresa ingresada correctamente."); navigate("/administracion/empresas", setRoute);
  }}><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>{editing ? "Modificar empresa" : "Ingresar empresa"}</h2></div><span className="status-chip status-chip--draft">{editing ? "Edición" : "Nueva empresa"}</span></div><div className="form-grid"><label>Razón social<input name="legalName" required defaultValue={editing?.legalName} /></label><label>RUT de la empresa<input name="rut" required placeholder="76.123.456-7" defaultValue={editing?.rut} /></label><label>Nombre de fantasía<input name="tradeName" defaultValue={editing?.tradeName} /></label><label>Representante legal<input name="representative" required defaultValue={editing?.representative} /></label><label className="full">Dirección<input name="address" required defaultValue={editing?.address} /></label><label>Estado<select name="status" defaultValue={editing?.status || "Activa"}><option>Activa</option><option>Inactiva</option></select></label></div><footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/administracion/empresas", setRoute)}>Cancelar</button><button className="primary-button">{editing ? "Guardar modificación" : "Guardar empresa"}</button></footer></form>;

  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Empresas</h2></div><button className="primary-button" onClick={() => navigate("/administracion/empresas/nueva", setRoute)}>＋ Ingresar empresa</button></div>{companies.length ? <><label className="admin-record-selector">Seleccionar empresa para modificar<select defaultValue="" onChange={(event) => event.target.value && navigate(`/administracion/empresas/editar/${encodeURIComponent(event.target.value)}`, setRoute)}><option value="">Seleccionar empresa</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.legalName} · {company.rut}</option>)}</select></label><div className="table-wrap"><table><thead><tr><th>Razón social</th><th>RUT</th><th>Nombre de fantasía</th><th>Representante</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{companies.map((company) => <tr key={company.id}><td>{company.legalName}</td><td>{company.rut}</td><td>{company.tradeName || "—"}</td><td>{company.representative}</td><td><span className="status-chip">{company.status}</span></td><td><button className="table-action" onClick={() => navigate(`/administracion/empresas/editar/${encodeURIComponent(company.id)}`, setRoute)}>Modificar</button></td></tr>)}</tbody></table></div></> : <EmptyResult text="No existen empresas ingresadas." />}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button></footer></section>;
}

export function WorkSitesModule({ route, setRoute }: { route: string; setRoute: (path: string) => void }) {
  const [workSites, setWorkSites] = useState<WorkSiteRecord[]>([]);
  const [error, setError] = useState("");
  const load = () => fetch("/api/work-sites").then((response) => response.ok ? response.json() : { workSites: [] }).then((data: { workSites?: WorkSiteRecord[] }) => setWorkSites(data.workSites ?? [])).catch(() => setWorkSites([]));
  useEffect(() => { load(); }, []);
  const editId = route.startsWith("/administracion/obras-y-centros-de-costo/editar/") ? decodeURIComponent(route.slice("/administracion/obras-y-centros-de-costo/editar/".length)) : "";
  const editing = workSites.find((site) => site.id === editId);
  if (route === "/administracion/obras-y-centros-de-costo/nueva" || editId) return <form className="panel process-form" onSubmit={async (event) => {
    event.preventDefault(); setError("");
    try { const payload = { ...Object.fromEntries(new FormData(event.currentTarget).entries()), id: editing?.id }; const response = await fetch("/api/work-sites", { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "No fue posible guardar la obra."); window.alert(editing ? "Obra modificada correctamente." : "Obra ingresada correctamente."); navigate("/administracion/obras-y-centros-de-costo", setRoute); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar la obra."); }
  }}><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>{editing ? "Modificar obra" : "Ingresar obra"}</h2></div><span className="status-chip status-chip--draft">{editing ? "Edición" : "Nueva obra"}</span></div><div className="form-grid"><label>Estado<select name="status" defaultValue={editing?.status || "Activa"}><option>Activa</option><option>Inactiva</option></select></label><label>Nombre de la obra<input name="name" required defaultValue={editing?.name} /></label><label>Obra<input name="costCenter" required defaultValue={editing?.costCenter} /></label><label>Empresa principal<input name="company" defaultValue={editing?.company} /></label><label className="full">Dirección<input name="address" defaultValue={editing?.address} /></label><label>Región<input name="region" defaultValue={editing?.region} /></label><label>Comuna<input name="commune" defaultValue={editing?.commune} /></label></div>{error && <div className="form-error">{error}</div>}<footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/administracion/obras-y-centros-de-costo", setRoute)}>Cancelar</button><button className="primary-button">{editing ? "Guardar modificación" : "Guardar obra"}</button></footer></form>;
  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Ingresar obra</h2></div><button className="primary-button" onClick={() => navigate("/administracion/obras-y-centros-de-costo/nueva", setRoute)}>＋ Ingresar obra</button></div>{workSites.length ? <><label className="admin-record-selector">Seleccionar obra para modificar<select defaultValue="" onChange={(event) => event.target.value && navigate(`/administracion/obras-y-centros-de-costo/editar/${encodeURIComponent(event.target.value)}`, setRoute)}><option value="">Seleccionar obra</option>{workSites.map((site) => <option key={site.id} value={site.id}>{site.costCenter} · {site.name}</option>)}</select></label><div className="table-wrap"><table><thead><tr><th>Nombre de la obra</th><th>Obra</th><th>Empresa principal</th><th>Dirección</th><th>Región</th><th>Comuna</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{workSites.map((site) => <tr key={site.id}><td>{site.name}</td><td>{site.costCenter || "—"}</td><td>{site.company || "—"}</td><td>{site.address || "—"}</td><td>{site.region || "—"}</td><td>{site.commune || "—"}</td><td><span className="status-chip">{site.status}</span></td><td><button className="table-action" onClick={() => navigate(`/administracion/obras-y-centros-de-costo/editar/${encodeURIComponent(site.id)}`, setRoute)}>Modificar</button></td></tr>)}</tbody></table></div></> : <EmptyResult text="No existen obras ingresadas." />}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button></footer></section>;
}

export function BulkWorkersModule({ setRoute }: { setRoute: (path: string) => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");

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
      window.alert(`${rows.length} trabajador(es) ${mode === "update" ? "modificado(s)" : "ingresado(s)"} correctamente.`); navigate("/personas", setRoute);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible completar la carga masiva."); }
    finally { setSaving(false); }
  }

  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Administración</p><h2>Carga masiva de trabajadores</h2></div><button className="secondary-button" onClick={downloadTemplate}>Descargar plantilla CSV</button></div><div className="tabs"><button className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Ingreso masivo</button><button className={mode === "update" ? "active" : ""} onClick={() => setMode("update")}>Modificación masiva</button></div><div className="bulk-instructions"><span>1</span><p>Descarga la plantilla y conserva exactamente los encabezados. Las obras múltiples se separan con el signo |.</p><span>2</span><p>{mode === "update" ? "Para modificar, usa el mismo RUT existente. Los demás campos pueden quedar vacíos." : "Solo el RUT es necesario para identificar al trabajador. Los demás campos pueden quedar vacíos."}</p><span>3</span><p>Usa nombres permitidos en Bases del sistema para cargos, bancos, cuentas, AFP y salud; luego revisa la vista previa antes de enviar.</p></div><label className="bulk-file-picker">Seleccionar archivo CSV<input type="file" accept=".csv,text/csv" onChange={(event) => loadFile(event.target.files?.[0] ?? null)} /></label>{fileName && <p className="bulk-file-name"><strong>Archivo:</strong> {fileName}</p>}{error && <div className="form-error">{error}</div>}{rows.length > 0 && <><div className="bulk-summary"><strong>{rows.length}</strong><span>trabajadores listos para {mode === "update" ? "modificar" : "ingresar"}</span></div><div className="table-wrap"><table><thead><tr><th>Nombre completo</th><th>Cédula de identidad</th><th>Cargo</th><th>Obra</th><th>Fecha de ingreso</th></tr></thead><tbody>{rows.slice(0, 10).map((row, index) => <tr key={`${row.identityNumber}-${index}`}><td>{row.fullName}</td><td>{row.identityNumber}</td><td>{row.role}</td><td>{row.workSite}</td><td>{row.entryDate}</td></tr>)}</tbody></table>{rows.length > 10 && <p className="bulk-more">Se muestran los primeros 10 registros de {rows.length}.</p>}</div></>}<footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver a Administración</button><button className="primary-button" disabled={!rows.length || saving} onClick={submit}>{saving ? "Procesando…" : mode === "update" ? "Enviar modificación masiva" : "Enviar carga masiva"}</button></footer></section>;
}

export function UsersPermissionsModule({ processes, setRoute }: { processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const { workers } = useConnectedWorkers(processes); const [profiles, setProfiles] = useState<Array<{ workerRut: string; workerName: string; profile: string; scope: string; active: boolean }>>([]); const [selected, setSelected] = useState("");
  const load = () => fetch("/api/user-profiles").then((r) => r.ok ? r.json() : { profiles: [] }).then((data) => setProfiles(data.profiles ?? [])).catch(() => setProfiles([])); useEffect(() => { load(); }, []);
  const worker = workers.find((item) => item.rut === selected); const saved = profiles.find((item) => item.workerRut === selected);
  return <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>Usuarios y permisos</h2></div></div><form className="form-grid" key={`${selected}-${saved?.profile}`} onSubmit={async (event) => { event.preventDefault(); if (!worker) return; const values = Object.fromEntries(new FormData(event.currentTarget).entries()); const response = await fetch("/api/user-profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, workerRut: worker.rut, workerName: worker.name, active: values.active === "true" }) }); if (response.ok) { window.alert("Perfil de usuario guardado."); load(); } }}><label className="full">Buscar trabajador<select value={selected} onChange={(event) => setSelected(event.target.value)} required><option value="">Seleccionar trabajador existente</option>{workers.map((item) => <option key={item.rut} value={item.rut}>{item.name} · {item.rut}</option>)}</select></label><label>Perfil<select name="profile" defaultValue={saved?.profile || ""} required><option value="">Seleccionar perfil</option>{["Jefa de RRHH y Finanzas", "Encargada de RRHH", "Gerencia", "Administrador general de contrato", "Administrador de contrato", "Administrativo/a"].map((profile) => <option key={profile}>{profile}</option>)}</select></label><label>Alcance<select name="scope" defaultValue={saved?.scope || "Total empresa"}><option>Total empresa</option>{[...new Set(workers.flatMap((item) => item.workSites))].map((center) => <option key={center}>{center}</option>)}</select></label><label>Estado<select name="active" defaultValue={saved?.active === false ? "false" : "true"}><option value="true">Activo</option><option value="false">Inactivo</option></select></label><footer className="form-footer full"><button type="button" className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver</button><button className="primary-button" disabled={!selected}>Guardar perfil</button></footer></form>{profiles.length > 0 && <div className="table-wrap"><table><thead><tr><th>Trabajador</th><th>Perfil</th><th>Alcance</th><th>Estado</th></tr></thead><tbody>{profiles.map((item) => <tr key={item.workerRut}><td>{item.workerName}</td><td>{item.profile}</td><td>{item.scope}</td><td>{item.active ? "Activo" : "Inactivo"}</td></tr>)}</tbody></table></div>}</section>;
}

export function SystemBasesModule({ setRoute }: { setRoute: (path: string) => void }) {
  const categories = ["Cargos", "Bancos", "Cuentas", "AFP", "Salud", "Feriados", "Otros"]; const [category, setCategory] = useState("Cargos"); const [items, setItems] = useState<Array<{ id: string; category: string; name: string; value: string; active: boolean }>>([]);
  const load = () => fetch("/api/system-base-items").then((r) => r.ok ? r.json() : { items: [] }).then((data) => setItems(data.items ?? [])).catch(() => setItems([])); useEffect(() => { load(); }, []);
  return <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>Bases del sistema</h2></div></div><div className="tabs">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><form className="form-grid" onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); const response = await fetch("/api/system-base-items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, category }) }); if (response.ok) { event.currentTarget.reset(); load(); } }}><label>{category === "Feriados" ? "Nombre del feriado" : `Nombre de ${category.toLowerCase()}`}<input name="name" required /></label><label>{category === "Feriados" ? "Fecha" : "Código o detalle (opcional)"}<input name="value" type={category === "Feriados" ? "date" : "text"} /></label><label>Estado<select name="active"><option value="true">Activo</option></select></label><footer className="form-footer full"><button type="button" className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver</button><button className="primary-button">Agregar registro</button></footer></form><div className="table-wrap"><table><thead><tr><th>Categoría</th><th>Nombre</th><th>{category === "Feriados" ? "Fecha" : "Detalle"}</th><th>Estado</th></tr></thead><tbody>{items.filter((item) => item.category === category).map((item) => <tr key={item.id}><td>{item.category}</td><td>{item.name}</td><td>{item.value || "—"}</td><td>{item.active ? "Activo" : "Inactivo"}</td></tr>)}</tbody></table></div></section>;
}

export function DocumentTemplatesModule({ setRoute }: { setRoute: (path: string) => void }) {
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; documentType: string; description: string; fileName: string; fileKey: string }>>([]); const load = () => fetch("/api/document-templates").then((r) => r.ok ? r.json() : { templates: [] }).then((data) => setTemplates(data.templates ?? [])).catch(() => setTemplates([])); useEffect(() => { load(); }, []);
  return <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Administración</p><h2>Maestros (Documentos)</h2></div></div><div className="info-banner"><span>i</span><p>Carga formatos de contrato, anexos u otros documentos. Puedes usar campos como {"{{NOMBRES}}"}, {"{{APELLIDOS}}"}, {"{{RUT}}"}, {"{{CARGO}}"}, {"{{OBRA}}"} y {"{{SUELDO}}"} para completar el documento con la ficha del trabajador.</p></div><form className="form-grid" onSubmit={async (event) => { event.preventDefault(); const response = await fetch("/api/document-templates", { method: "POST", body: new FormData(event.currentTarget) }); if (response.ok) { event.currentTarget.reset(); load(); } else window.alert("No fue posible cargar el formato."); }}><label>Nombre del formato<input name="name" required /></label><label>Tipo<select name="documentType"><option>Contrato</option><option>Anexo</option><option>Otro</option></select></label><label className="full">Descripción<input name="description" /></label><label className="full file-picker">Archivo del formato<input name="file" type="file" accept=".doc,.docx,.odt,.pdf" required /></label><footer className="form-footer full"><button type="button" className="secondary-button" onClick={() => navigate("/administracion", setRoute)}>← Volver</button><button className="primary-button">Cargar formato</button></footer></form>{templates.length ? <div className="table-wrap"><table><thead><tr><th>Formato</th><th>Tipo</th><th>Archivo</th><th>Uso</th></tr></thead><tbody>{templates.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.documentType}</td><td><button className="table-action" onClick={() => window.open(fileUrl(item.fileKey), "_blank")}>{item.fileName}</button></td><td>Disponible para generación automática</td></tr>)}</tbody></table></div> : <EmptyResult text="No existen formatos documentales cargados." />}</section>;
}
