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
};

type AttendanceRow = {
  states: string[];
  amIn: string;
  amOut: string;
  pmIn: string;
  pmOut: string;
};

type AttendanceRecord = {
  id: string;
  date: string;
  workerNames: string[];
  status: string;
  file: File;
  fileUrl: string;
  attachmentType: string;
};

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
};

type CompanyRecord = {
  id: string;
  legalName: string;
  rut: string;
  tradeName: string;
  representative: string;
  address: string;
  status: string;
};

type WorkerProfile = {
  id: string;
  fullName: string;
  identityNumber: string;
  role: string;
  workSite: string;
  entryDate: string;
};

type WorkerField = { name: string; label: string; type?: string; optional?: boolean; options?: string[]; min?: string };

const workerSections: { title: string; fields: WorkerField[] }[] = [
  { title: "I. ANTECEDENTES PERSONALES", fields: [
    { name: "entryDate", label: "Fecha de Ingreso", type: "date" }, { name: "fullName", label: "Nombre Completo" }, { name: "identityNumber", label: "Cédula de identidad N°" }, { name: "birthDate", label: "Fecha de Nacimiento", type: "date" }, { name: "nationality", label: "Nacionalidad" }, { name: "maritalStatus", label: "Estado Civil" }, { name: "educationLevel", label: "Nivel Educacional" }, { name: "professionalTitle", label: "Título profesional (Si aplica)", optional: true }, { name: "address", label: "Dirección" }, { name: "commune", label: "Comuna" }, { name: "region", label: "Región" }, { name: "mobile", label: "N° de celular", type: "tel" }, { name: "email", label: "Correo Electrónico", type: "email" }, { name: "familyDependents", label: "Cargas familiares", type: "number", min: "0" }, { name: "disabilityOrInvalidity", label: "Discapacidad o Pensionado por Invalidez", options: ["No", "Sí"] },
  ] },
  { title: "II. ANTECEDENTES LABORALES", fields: [
    { name: "role", label: "Cargo" }, { name: "workSite", label: "Obra" }, { name: "contractTerm", label: "Plazo de contratación" }, { name: "agreedSalary", label: "Sueldo pactado", type: "number", min: "0" },
  ] },
  { title: "III. INFORMACIÓN PREVISIONAL Y DE SALUD", fields: [
    { name: "afp", label: "AFP" }, { name: "health", label: "Salud" }, { name: "isaprePlan", label: "Plan Isapre (si aplica)", optional: true },
  ] },
  { title: "IV. INFORMACIÓN BANCARIA", fields: [
    { name: "bank", label: "Banco" }, { name: "accountType", label: "Tipo de Cuenta" }, { name: "accountNumber", label: "Número de Cuenta" }, { name: "requiresAdvance", label: "Requiere anticipo", options: ["No", "Sí"] },
  ] },
  { title: "V. CONTACTO DE EMERGENCIA", fields: [
    { name: "emergencyName", label: "Nombre Completo" }, { name: "emergencyRelationship", label: "Parentesco" }, { name: "emergencyMobile", label: "N° celular de contacto", type: "tel" },
  ] },
];

const bulkWorkerColumns = [
  ["Fecha de Ingreso", "entryDate"], ["Nombre Completo", "fullName"], ["Cédula de identidad N°", "identityNumber"], ["Fecha de Nacimiento", "birthDate"], ["Nacionalidad", "nationality"], ["Estado Civil", "maritalStatus"], ["Nivel Educacional", "educationLevel"], ["Título profesional", "professionalTitle"], ["Dirección", "address"], ["Comuna", "commune"], ["Región", "region"], ["N° de celular", "mobile"], ["Correo Electrónico", "email"], ["Cargas familiares", "familyDependents"], ["Discapacidad o Pensionado por Invalidez", "disabilityOrInvalidity"], ["Cargo", "role"], ["Obra", "workSite"], ["Plazo de contratación", "contractTerm"], ["Sueldo pactado", "agreedSalary"], ["AFP", "afp"], ["Salud", "health"], ["Plan Isapre", "isaprePlan"], ["Banco", "bank"], ["Tipo de Cuenta", "accountType"], ["Número de Cuenta", "accountNumber"], ["Requiere anticipo", "requiresAdvance"], ["Nombre Contacto de Emergencia", "emergencyName"], ["Parentesco", "emergencyRelationship"], ["N° celular de contacto", "emergencyMobile"],
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
    });
  });
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function navigate(path: string, setRoute: (path: string) => void) {
  window.history.pushState({}, "", path);
  setRoute(path);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function EmptyResult({ text }: { text: string }) {
  return <div className="module-empty"><span>⌕</span><strong>Sin resultados</strong><p>{text}</p></div>;
}

export function PersonasModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const processWorkers = useMemo(() => workersFrom(processes), [processes]);
  const [profiles, setProfiles] = useState<WorkerProfile[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/workers").then((response) => response.ok ? response.json() : { workers: [] }).then((data: { workers?: WorkerProfile[] }) => setProfiles(data.workers ?? [])).catch(() => setProfiles([])); }, [route]);
  const workers = useMemo(() => {
    const listed = profiles.map((profile) => ({ rut: profile.identityNumber, name: profile.fullName, role: profile.role, costCenter: profile.workSite, company: "" }));
    processWorkers.forEach((worker) => { if (!listed.some((item) => item.rut === worker.rut)) listed.push(worker); });
    return listed;
  }, [profiles, processWorkers]);
  const filtered = query.trim() ? workers.filter((worker) => `${worker.name} ${worker.rut}`.toLowerCase().includes(query.toLowerCase())) : [];

  if (route === "/personas/nueva-solicitud") return <form className="worker-profile-form" onSubmit={async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/workers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "No fue posible enviar la información.");
      window.alert("Información del trabajador enviada correctamente."); navigate("/personas", setRoute);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible enviar la información."); }
    finally { setSaving(false); }
  }}>
    <section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Trabajadores</p><h2>Ingresar información de una persona</h2></div><span className="status-chip status-chip--draft">Nueva solicitud</span></div><p className="form-intro">Completa los antecedentes del trabajador y envíalos a la Jefa de RRHH y Finanzas.</p></section>
    {workerSections.map((section) => <section className="panel worker-data-section" key={section.title}><h3>{section.title}</h3><div className="form-grid">{section.fields.map((field) => <label key={field.name}>{field.label}{field.options ? <select name={field.name} required={!field.optional} defaultValue=""><option value="" disabled>Seleccionar</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} min={field.min} required={!field.optional} defaultValue={field.name === "familyDependents" ? "0" : undefined} />}</label>)}</div></section>)}
    {error && <div className="form-error">{error}</div>}
    <footer className="panel form-footer worker-submit"><button type="button" className="secondary-button" onClick={() => navigate("/personas", setRoute)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? "Enviando…" : "Enviar"}</button></footer>
  </form>;

  return <section className="panel module-panel">
    <div className="section-actions">
      <div><p className="page-eyebrow">Trabajadores</p><h2>Buscar trabajador</h2></div>
      <button className="primary-button" onClick={() => navigate("/personas/nueva-solicitud", setRoute)}>＋ Nueva solicitud</button>
    </div>
    <label className="worker-search"><span>Nombre o RUT del trabajador</span><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe para buscar un trabajador" /></div></label>
    {!query.trim() ? <div className="search-prompt"><span>○</span><strong>Busca un trabajador</strong><p>Ingresa su nombre o RUT para consultar el registro.</p></div> : filtered.length ? <div className="worker-results">{filtered.map((worker) => <article key={worker.rut}><div className="worker-avatar">{worker.name.slice(0, 1)}</div><div><strong>{worker.name}</strong><span>{worker.rut} · {worker.role || "Sin cargo informado"}</span><small>{[worker.company, worker.costCenter].filter(Boolean).join(" · ")}</small></div></article>)}</div> : <EmptyResult text="No existe un trabajador registrado con ese nombre o RUT." />}
  </section>;
}

export function DocumentModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const workers = useMemo(() => workersFrom(processes), [processes]);
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
      <label className="full">Trabajador<input name="worker" list="document-workers" required placeholder="Buscar por nombre o RUT" /><datalist id="document-workers">{workers.map((worker) => <option key={worker.rut} value={`${worker.name} · ${worker.rut}`} />)}</datalist></label>
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
  return { states: ["Presente"], amIn: "08:00", amOut: "12:30", pmIn: "13:30", pmOut: "18:00" };
}

export function AttendanceModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const workers = useMemo(() => workersFrom(processes), [processes]);
  const costCenters = useMemo(() => [...new Set(workers.map((worker) => worker.costCenter).filter(Boolean))], [workers]);
  const [date, setDate] = useState(localDate());
  const [scope, setScope] = useState("all");
  const [costCenter, setCostCenter] = useState("");
  const [rows, setRows] = useState<Record<string, AttendanceRow>>({});
  const [attachmentType, setAttachmentType] = useState("Libro de asistencia");
  const [customAttachmentName, setCustomAttachmentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(localDate().slice(0, 7));
  const visibleWorkers = scope === "all" ? workers : workers.filter((worker) => worker.costCenter === costCenter);

  function rowFor(rut: string) { return rows[rut] ?? defaultRow(); }
  function updateRow(rut: string, update: Partial<AttendanceRow>) { setRows((current) => ({ ...current, [rut]: { ...rowFor(rut), ...update } })); }
  function removeFile() { setFile(null); setFileInputKey((key) => key + 1); }
  function downloadRecord(record: AttendanceRecord) { const link = document.createElement("a"); link.href = record.fileUrl; link.download = record.file.name; link.click(); }
  function submitReview() {
    if (!visibleWorkers.length) return window.alert("Selecciona una dotación con trabajadores registrados.");
    if (!file) return window.alert("Debes cargar un respaldo antes de enviar a revisión.");
    const record: AttendanceRecord = { id: crypto.randomUUID(), date, workerNames: visibleWorkers.map((worker) => worker.name), status: "En revisión", file, fileUrl: URL.createObjectURL(file), attachmentType: attachmentType === "Otro" ? customAttachmentName || "Otro" : attachmentType };
    setRecords((current) => [record, ...current]); setLocked(true);
    sessionStorage.setItem(`sig-attendance-${record.id}`, JSON.stringify({ id: record.id, date, workers: record.workerNames, status: record.status, fileName: file.name, attachmentType: record.attachmentType }));
  }

  if (route === "/asistencia/nuevo") return <section className="panel attendance-entry">
    <div className="panel-heading"><div><p className="page-eyebrow">Nuevo ingreso</p><h2>Informar asistencia</h2></div><span className={`status-chip ${locked ? "status-chip--secure" : "status-chip--draft"}`}>{locked ? "En revisión · bloqueado" : "Borrador"}</span></div>
    <fieldset disabled={locked}>
      <div className="attendance-controls">
        <label>Día<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Dotación<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="all">Dotación completa</option><option value="center">Por centro de costo</option></select></label>
        {scope === "center" && <label>Centro de costo<select value={costCenter} onChange={(event) => setCostCenter(event.target.value)}><option value="">Seleccionar</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label>}
      </div>
      <div className="attendance-list"><div className="attendance-list-head"><span>Trabajador</span><span>Estado</span><span>AM entrada</span><span>AM salida</span><span>PM ingreso</span><span>PM salida</span></div>{visibleWorkers.length ? visibleWorkers.map((worker) => { const row = rowFor(worker.rut); return <div className="attendance-worker-row" key={worker.rut}><div><strong>{worker.name}</strong><small>{worker.rut} · {worker.costCenter}</small></div><select multiple value={row.states} onChange={(event) => updateRow(worker.rut, { states: [...event.currentTarget.selectedOptions].map((option) => option.value) })} aria-label={`Estado de ${worker.name}`}>{attendanceStates.map((status) => <option key={status}>{status}</option>)}</select><input type="time" value={row.amIn} onChange={(event) => updateRow(worker.rut, { amIn: event.target.value })} /><input type="time" value={row.amOut} onChange={(event) => updateRow(worker.rut, { amOut: event.target.value })} /><input type="time" value={row.pmIn} onChange={(event) => updateRow(worker.rut, { pmIn: event.target.value })} /><input type="time" value={row.pmOut} onChange={(event) => updateRow(worker.rut, { pmOut: event.target.value })} /></div>; }) : <EmptyResult text={workers.length ? "Selecciona un centro de costo con trabajadores." : "No hay trabajadores registrados para informar asistencia."} />}</div>
      <div className="upload-panel"><div><p className="page-eyebrow">Respaldo</p><h3>Cargar archivo</h3></div><label>Tipo<select value={attachmentType} onChange={(event) => setAttachmentType(event.target.value)}><option>Libro de asistencia</option><option>Declaración jurada</option><option>Otro</option></select></label>{attachmentType === "Otro" && <label>Nombre del respaldo<input value={customAttachmentName} onChange={(event) => setCustomAttachmentName(event.target.value)} required placeholder="Indica el nombre" /></label>}<label className="file-picker">Seleccionar archivo<input key={fileInputKey} type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>{file && <div className="file-loaded"><span>▤</span><div><strong>{file.name}</strong><small>{attachmentType === "Otro" ? customAttachmentName || "Otro" : attachmentType}</small></div><button type="button" onClick={removeFile}>Eliminar</button></div>}</div>
    </fieldset>
    <footer className="form-footer"><button className="secondary-button" onClick={() => navigate("/asistencia", setRoute)}>Volver</button><button className="primary-button" disabled={locked} onClick={submitReview}>{locked ? "Enviado a revisión" : "Enviar a revisión"}</button></footer>
  </section>;

  if (route === "/asistencia/trabajador") return <><div className="tabs"><button onClick={() => navigate("/asistencia", setRoute)}>Por obra y día</button><button className="active">Por trabajador</button><button onClick={() => navigate("/asistencia/resumen", setRoute)}>Resumen mensual</button></div><section className="panel module-panel"><div className="panel-heading"><div><p className="page-eyebrow">Consulta individual</p><h2>Asistencia por trabajador</h2></div></div><div className="worker-month-filter"><label>Trabajador<select value={selectedWorker} onChange={(event) => setSelectedWorker(event.target.value)}><option value="">Seleccionar trabajador</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name} · {worker.rut}</option>)}</select></label><label>Mes<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></label></div>{selectedWorker ? <div className="module-empty module-empty--compact"><span>◷</span><p>No hay registros de asistencia para el trabajador en {selectedMonth}.</p></div> : <div className="search-prompt"><span>○</span><strong>Selecciona un trabajador</strong><p>Luego elige el mes que deseas consultar.</p></div>}</section></>;

  const monthly = route === "/asistencia/resumen";
  return <><div className="tabs"><button className={!monthly ? "active" : ""} onClick={() => navigate("/asistencia", setRoute)}>Por obra y día</button><button onClick={() => navigate("/asistencia/trabajador", setRoute)}>Por trabajador</button><button className={monthly ? "active" : ""} onClick={() => navigate("/asistencia/resumen", setRoute)}>Resumen mensual</button></div><section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">{monthly ? "Resumen mensual" : "Registros informados"}</p><h2>{monthly ? "Asistencia del período" : "Asistencia por obra y día"}</h2></div><button className="primary-button" onClick={() => { setLocked(false); setFile(null); navigate("/asistencia/nuevo", setRoute); }}>＋ Nuevo ingreso</button></div>{records.length ? <div className="table-wrap"><table><thead><tr><th>Día</th><th>Trabajadores</th><th>Estado</th><th>Respaldo</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{new Date(`${record.date}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.workerNames.length} trabajadores</td><td><span className="status-chip">{record.status}</span></td><td><div className="backup-actions"><button onClick={() => window.open(record.fileUrl, "_blank", "noopener,noreferrer")}>Ver</button><button onClick={() => downloadRecord(record)}>Descargar</button></div></td></tr>)}</tbody></table></div> : <EmptyResult text="No existen ingresos de asistencia enviados a revisión." />}</section></>;
}

export function VacationsModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const workers = useMemo(() => workersFrom(processes), [processes]);
  const routeRut = route.startsWith("/vacaciones/nueva-solicitud/") ? decodeURIComponent(route.slice("/vacaciones/nueva-solicitud/".length)) : "";
  const routeWorker = workers.find((worker) => worker.rut === routeRut);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Worker | null>(null);
  const [requestWorker, setRequestWorker] = useState(routeWorker ? `${routeWorker.name} · ${routeWorker.rut}` : "");
  const filtered = query.trim() ? workers.filter((worker) => `${worker.name} ${worker.rut}`.toLowerCase().includes(query.toLowerCase())) : [];

  if (route.startsWith("/vacaciones/nueva-solicitud")) return <form className="panel process-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    sessionStorage.setItem(`sig-vacation-request-${Date.now()}`, JSON.stringify(values));
    window.alert("Solicitud de vacaciones enviada correctamente.");
    navigate("/vacaciones", setRoute);
  }}><div className="panel-heading"><div><p className="page-eyebrow">Vacaciones</p><h2>Nueva solicitud</h2></div><span className="status-chip status-chip--draft">Solicitud</span></div><div className="form-grid"><label className="full">Trabajador<input name="worker" list="vacation-workers" value={requestWorker} onChange={(event) => setRequestWorker(event.target.value)} required placeholder="Buscar o modificar trabajador" /><datalist id="vacation-workers">{workers.map((worker) => <option key={worker.rut} value={`${worker.name} · ${worker.rut}`} />)}</datalist></label><label>Desde<input name="from" type="date" required /></label><label>Hasta<input name="to" type="date" required /></label></div><footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/vacaciones", setRoute)}>Cancelar</button><button className="primary-button">Enviar solicitud</button></footer></form>;

  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Vacaciones</p><h2>Buscar trabajador</h2></div><button className="primary-button" onClick={() => navigate(selected ? `/vacaciones/nueva-solicitud/${encodeURIComponent(selected.rut)}` : "/vacaciones/nueva-solicitud", setRoute)}>＋ Nueva solicitud</button></div><label className="worker-search"><span>Nombre o RUT del trabajador</span><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe para buscar un trabajador" /></div></label>{selected && <div className="selected-worker"><div className="worker-avatar">{selected.name.slice(0, 1)}</div><div><small>Trabajador seleccionado</small><strong>{selected.name}</strong><span>{selected.rut} · {selected.costCenter}</span></div><button className="table-action" onClick={() => setSelected(null)}>Cambiar</button></div>}{query.trim() && !selected && (filtered.length ? <div className="worker-results">{filtered.map((worker) => <article key={worker.rut}><div className="worker-avatar">{worker.name.slice(0, 1)}</div><div><strong>{worker.name}</strong><span>{worker.rut}</span><small>{worker.company} · {worker.costCenter}</small></div><button className="table-action" onClick={() => { setSelected(worker); setQuery(worker.name); }}>Seleccionar</button></article>)}</div> : <EmptyResult text="No existe un trabajador registrado con ese nombre o RUT." />)}{!query.trim() && !selected && <div className="search-prompt"><span>☼</span><strong>Selecciona un trabajador</strong><p>Busca por nombre o RUT para revisar y crear solicitudes.</p></div>}</section>;
}

export function MedicalLeaveModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const workers = useMemo(() => workersFrom(processes), [processes]);
  const costCenters = useMemo(() => [...new Set(workers.map((worker) => worker.costCenter).filter(Boolean))], [workers]);
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
    try { setRecords(JSON.parse(sessionStorage.getItem("sig-medical-leaves") ?? "[]")); } catch { setRecords([]); }
  }, []);

  const filtered = records.filter((record) => {
    const matchesWorker = !workerFilter || record.workerRut === workerFilter;
    const matchesCenter = !centerFilter || record.costCenter === centerFilter;
    const monthStart = `${monthFilter}-01`;
    const monthEnd = `${monthFilter}-31`;
    return matchesWorker && matchesCenter && (!monthFilter || (record.from <= monthEnd && record.to >= monthStart));
  });

  if (route === "/licencias/nueva") return <form className="panel process-form" onSubmit={(event) => {
    event.preventDefault();
    if (!selectedWorker) return window.alert("Selecciona un trabajador registrado.");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const record: MedicalLeaveRecord = { id: crypto.randomUUID(), workerRut: selectedWorker.rut, workerName: selectedWorker.name, costCenter: selectedWorker.costCenter, from, to, days, folio: String(values.folio), specialty: String(values.specialty) };
    const updated = [record, ...records];
    setRecords(updated);
    sessionStorage.setItem("sig-medical-leaves", JSON.stringify(updated));
    window.alert("Licencia médica registrada correctamente.");
    navigate("/licencias", setRoute);
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
    </div>
    <footer className="form-footer"><button type="button" className="secondary-button" onClick={() => navigate("/licencias", setRoute)}>Cancelar</button><button className="primary-button">Guardar licencia médica</button></footer>
  </form>;

  return <section className="panel module-panel">
    <div className="section-actions"><div><p className="page-eyebrow">Licencias Médicas</p><h2>Trabajadores con licencia</h2></div><button className="primary-button" onClick={() => navigate("/licencias/nueva", setRoute)}>＋ Nueva licencia médica</button></div>
    <div className="medical-filters"><label>Trabajador<select value={workerFilter} onChange={(event) => setWorkerFilter(event.target.value)}><option value="">Todos los trabajadores</option>{workers.map((worker) => <option key={worker.rut} value={worker.rut}>{worker.name}</option>)}</select></label><label>Centro de costo<select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">Todos los centros de costo</option>{costCenters.map((center) => <option key={center}>{center}</option>)}</select></label><label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label></div>
    <div className="license-summary"><div><small>Con licencia en el período</small><strong>{filtered.length}</strong></div><div><small>Días informados</small><strong>{filtered.reduce((total, record) => total + record.days, 0)}</strong></div></div>
    {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Centro de costo</th><th>Trabajador</th><th>Desde</th><th>Hasta</th><th>N° de días</th><th>Folio</th><th>Especialidad</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td>{record.costCenter}</td><td>{record.workerName}</td><td>{new Date(`${record.from}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{new Date(`${record.to}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.days}</td><td>{record.folio}</td><td>{record.specialty}</td></tr>)}</tbody></table></div> : <EmptyResult text="No hay trabajadores con licencia para los filtros seleccionados." />}
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
