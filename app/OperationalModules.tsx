"use client";

import { FormEvent, useMemo, useState } from "react";

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

export function PersonasModule({ processes, setRoute }: { processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const workers = useMemo(() => workersFrom(processes), [processes]);
  const [query, setQuery] = useState("");
  const filtered = query.trim() ? workers.filter((worker) => `${worker.name} ${worker.rut}`.toLowerCase().includes(query.toLowerCase())) : [];

  return <section className="panel module-panel">
    <div className="section-actions">
      <div><p className="page-eyebrow">Personas</p><h2>Buscar trabajador</h2></div>
      <button className="primary-button" onClick={() => navigate("/documentos", setRoute)}>＋ Nueva solicitud</button>
    </div>
    <label className="worker-search"><span>Nombre o RUT del trabajador</span><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe para buscar un trabajador" /></div></label>
    {!query.trim() ? <div className="search-prompt"><span>○</span><strong>Busca un trabajador</strong><p>Ingresa su nombre o RUT para consultar el registro.</p></div> : filtered.length ? <div className="worker-results">{filtered.map((worker) => <article key={worker.rut}><div className="worker-avatar">{worker.name.slice(0, 1)}</div><div><strong>{worker.name}</strong><span>{worker.rut} · {worker.role || "Sin cargo informado"}</span><small>{worker.company} · {worker.costCenter}</small></div><button className="table-action" onClick={() => navigate(`/documentos/solicitud/${encodeURIComponent("Contrato")}`, setRoute)}>Nueva solicitud →</button></article>)}</div> : <EmptyResult text="No existe un trabajador registrado con ese nombre o RUT." />}
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
