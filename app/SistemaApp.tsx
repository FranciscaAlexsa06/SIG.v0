"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AttendanceModule, BulkWorkersModule, CompaniesModule, DocumentModule, DocumentTemplatesModule, MedicalLeaveModule, PersonasModule, SystemBasesModule, UsersPermissionsModule, VacationsModule, WorkSitesModule, type MedicalLeaveRecord, type WorkerProfile } from "./OperationalModules";

type ProcessRecord = {
  id: string;
  type: string;
  rut: string;
  personName: string;
  company: string;
  costCenter: string;
  role: string;
  workday: string;
  startDate: string;
  status: string;
  stage: string;
  createdAt: string;
};

type HiringDraft = {
  rut: string;
  firstName: string;
  lastName: string;
  company: string;
  costCenter: string;
  role: string;
  workday: string;
  startDate: string;
  documents: string[];
};

const emptyDraft: HiringDraft = {
  rut: "",
  firstName: "",
  lastName: "",
  company: "",
  costCenter: "",
  role: "",
  workday: "Jornada administrativa",
  startDate: "",
  documents: [],
};

const navItems = [
  ["/dashboard", "▦", "Dashboard"],
  ["/bandeja", "✓", "Bandeja de trabajo"],
  ["/personas", "○", "Trabajadores"],
  ["/asistencia", "◷", "Asistencia"],
  ["/vacaciones", "☼", "Vacaciones"],
  ["/licencias", "+", "Licencias Médicas"],
  ["/documentos", "▤", "Gestión Documental"],
  ["/procesos", "↻", "Procesos"],
  ["/reportes", "▥", "Reportes"],
  ["/auditoria", "◎", "Auditoría"],
  ["/administracion", "⚙", "Administración"],
] as const;

const routeTitles: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  "/dashboard": { eyebrow: "Control mensual", title: "Dashboard", subtitle: "Indicadores y alertas del período seleccionado." },
  "/bandeja": { eyebrow: "Mi trabajo", title: "Bandeja de trabajo", subtitle: "Tareas asignadas, supervisadas y próximas a vencer." },
  "/personas": { eyebrow: "Gestión de trabajadores", title: "Trabajadores", subtitle: "Busca, consulta e ingresa información de trabajadores." },
  "/asistencia": { eyebrow: "Registro diario", title: "Asistencia", subtitle: "Control por centro de costo, trabajador y período." },
  "/vacaciones": { eyebrow: "Saldos y solicitudes", title: "Vacaciones", subtitle: "Períodos, folios, documentos y aprobaciones." },
  "/licencias": { eyebrow: "Control de ausencias", title: "Licencias Médicas", subtitle: "Resumen y registro de licencias por trabajador, centro de costo y mes." },
  "/documentos": { eyebrow: "Repositorio central", title: "Gestión Documental", subtitle: "Documentos laborales, personales y de procesos." },
  "/procesos": { eyebrow: "Flujos de trabajo", title: "Procesos", subtitle: "Solicitudes, responsables, etapas y documentos relacionados." },
  "/reportes": { eyebrow: "Información de gestión", title: "Reportes", subtitle: "Consultas exportables según el alcance del usuario." },
  "/auditoria": { eyebrow: "Trazabilidad", title: "Auditoría", subtitle: "Registro protegido de accesos y acciones relevantes." },
  "/administracion": { eyebrow: "Configuración", title: "Administración del Sistema", subtitle: "Empresas, permisos, feriados y maestros compartidos." },
};

const emptyMessages: Record<string, string> = {
  personas: "No hay personas registradas con los filtros seleccionados.",
  asistencia: "No hay asistencia informada para este período.",
  contratos: "No existen contratos ni anexos próximos a vencer.",
  licencias: "No hay licencias médicas activas en el período.",
  finiquitos: "No hay personas finiquitadas en el período.",
};

function go(path: string, setRoute: (path: string) => void) {
  window.history.pushState({}, "", path);
  setRoute(path);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [user, setUser] = useState("");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (user.trim().toLowerCase() === "francisca" && pin === "1234") {
      onLogin("Francisca");
      return;
    }
    setError("Usuario o PIN incorrecto. Revisa los datos e inténtalo nuevamente.");
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="Portada del Sistema Integral de Gestión"><img src="/login-cover-v2.png" alt="Sistema Integral de Gestión" /></section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="brand-mark"><span>SIG</span></div>
          <p className="kicker kicker--blue">Bienvenida</p>
          <h2>Accede a tu espacio de trabajo</h2>
          <p className="muted">Ingresa tus credenciales para continuar.</p>
          <label>Usuario<input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Nombre de usuario" autoComplete="username" /></label>
          <label>Contraseña o PIN<div className="password-wrap"><input value={pin} onChange={(e) => setPin(e.target.value)} type={show ? "text" : "password"} placeholder="Ingresa tu PIN" autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar PIN" : "Mostrar PIN"}>{show ? "Ocultar" : "Ver"}</button></div></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button primary-button--wide" type="submit">Iniciar sesión <span>→</span></button>
          <div className="secure-note"><span>◆</span><div><strong>Conexión segura</strong><small>Tu acceso queda protegido y registrado.</small></div></div>
          <p className="demo-access">Acceso inicial: <strong>francisca</strong> · PIN <strong>1234</strong></p>
        </form>
      </section>
    </main>
  );
}

function Header({ route, setRoute, name, onLogout }: { route: string; setRoute: (v: string) => void; name: string; onLogout: () => void }) {
  const meta = route.startsWith("/procesos/nueva-contratacion")
    ? { eyebrow: "Procesos · Nueva contratación", title: "Nueva contratación", subtitle: "Identifica a la persona y crea una nueva relación laboral." }
    : route === "/personas/nueva-solicitud" ? { eyebrow: "Trabajadores · Nueva solicitud", title: "Ingreso de trabajador", subtitle: "Completa los antecedentes personales, laborales y previsionales." }
    : route === "/asistencia/nuevo" ? { eyebrow: "Asistencia · Nuevo ingreso", title: "Nuevo ingreso de asistencia", subtitle: "Informa la jornada de la dotación seleccionada." }
    : route.startsWith("/vacaciones/nueva-solicitud") ? { eyebrow: "Vacaciones · Solicitud", title: "Nueva solicitud de vacaciones", subtitle: "Calcula días hábiles y genera el folio del proceso." }
    : route === "/licencias/nueva" ? { eyebrow: "Licencias Médicas · Registro", title: "Nueva licencia médica", subtitle: "Registra el período, folio y especialidad del trabajador." }
    : route.startsWith("/documentos/solicitud/") ? { eyebrow: "Gestión Documental · Solicitud", title: "Nueva solicitud documental", subtitle: "Completa los antecedentes del documento seleccionado." }
    : route.startsWith("/reportes/") ? { eyebrow: "Reportes · Vista previa", title: "Vista previa del reporte", subtitle: "Revisa los campos antes de exportar." }
    : route.startsWith("/administracion/") ? { eyebrow: "Administración · Maestro", title: "Configuración del maestro", subtitle: "Gestiona definiciones compartidas sin borrar su historial." }
    : routeTitles[route] ?? routeTitles["/dashboard"];
  return (
    <header className="app-header">
      <div><p className="page-eyebrow">{meta.eyebrow}</p><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Notificaciones" onClick={() => window.alert("No hay notificaciones nuevas.")}>♢<span className="notification-dot" /></button>
        <div className="user-menu"><span>{name.slice(0, 1)}</span><div><strong>{name}</strong><small>Product Owner</small></div><button onClick={onLogout}>Salir</button></div>
      </div>
    </header>
  );
}

function Sidebar({ route, setRoute, open, close }: { route: string; setRoute: (v: string) => void; open: boolean; close: () => void }) {
  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar-brand"><div className="brand-mark brand-mark--small"><span>SIG</span></div><div><strong>Sistema Integral</strong><small>de Gestión</small></div><button className="mobile-close" onClick={close}>×</button></div>
      <nav>{navItems.map(([path, icon, label]) => <button key={path} className={route === path || (path !== "/dashboard" && route.startsWith(`${path}/`)) ? "active" : ""} onClick={() => { go(path, setRoute); close(); }}><span>{icon}</span>{label}</button>)}</nav>
      <div className="sidebar-scope"><small>Ámbito activo</small><strong>Todas las empresas</strong><span>Acceso Product Owner</span></div>
    </aside>
  );
}

function PeriodFilters() {
  return <div className="period-filters"><label>Período<select defaultValue="7"><option value="7">Julio</option><option value="6">Junio</option></select></label><label>Año<select defaultValue="2026"><option>2026</option><option>2025</option></select></label><label>Empresa<select><option>Todas las empresas</option></select></label></div>;
}

function EmptyTable({ columns, message }: { columns: string[]; message: string }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr></thead></table><div className="table-empty"><span>◇</span><strong>Sin registros</strong><p>{message}</p></div></div>;
}

function Dashboard({ setRoute, processes }: { setRoute: (v: string) => void; processes: ProcessRecord[] }) {
  const [detail, setDetail] = useState<string | null>(null);
  const [medicalLeaves, setMedicalLeaves] = useState<MedicalLeaveRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  useEffect(() => { let local: MedicalLeaveRecord[] = []; try { local = JSON.parse(sessionStorage.getItem("sig-medical-leaves") ?? "[]"); } catch { local = []; } fetch("/api/medical-leaves").then((response) => response.ok ? response.json() : { medicalLeaves: [] }).then((data: { medicalLeaves?: Array<MedicalLeaveRecord & { dateFrom?: string; dateTo?: string }> }) => { const remote = (data.medicalLeaves ?? []).map((leave) => ({ ...leave, from: leave.from || leave.dateFrom || "", to: leave.to || leave.dateTo || "" })); local.forEach((leave) => { if (!remote.some((item) => item.id === leave.id)) remote.push(leave); }); setMedicalLeaves(remote); }).catch(() => setMedicalLeaves(local)); }, []);
  useEffect(() => { fetch("/api/workers").then((response) => response.ok ? response.json() : { workers: [] }).then((data: { workers?: WorkerProfile[] }) => setWorkers(data.workers ?? [])).catch(() => setWorkers([])); }, []);
  const currentDay = useMemo(() => { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }, []);
  const activeMedicalLeaves = medicalLeaves.filter((record) => record.from <= currentDay && record.to >= currentDay);
  const women = workers.filter((worker) => worker.gender === "Femenino").length;
  const men = workers.filter((worker) => worker.gender === "Masculino").length;
  const tasks = processes.filter((p) => p.status !== "Finalizado").length;
  const cards = [
    { id: "personas", icon: "○", value: String(workers.length), label: "Trabajadores activos", note: `${women} mujeres · ${men} hombres`, tone: "blue" },
    { id: "asistencia", icon: "◷", value: "0%", label: "Asistencia informada", note: "Sin registros del período", tone: "green" },
    { id: "contratos", icon: "▤", value: "0", label: "Contratos por vencer", note: "Próximos 30 días", tone: "amber" },
    { id: "licencias", icon: "+", value: String(activeMedicalLeaves.length), label: "Licencias médicas", note: "Activas en el período", tone: "violet" },
    { id: "finiquitos", icon: "□", value: "0", label: "Personas finiquitadas", note: "Durante el período", tone: "slate" },
    { id: "tareas", icon: "✓", value: String(tasks), label: "Tareas pendientes", note: tasks ? "Procesos por continuar" : "Sin tareas asignadas", tone: "red" },
  ];
  return (
    <>
      <PeriodFilters />
      <section className="metrics-grid">{cards.map((card) => <button key={card.id} className={`metric-card metric-card--${card.tone}`} onClick={() => setDetail(card.id)}><span className="metric-icon">{card.icon}</span><div><strong>{card.value}</strong><h3>{card.label}</h3><p>{card.note}</p></div><i>→</i></button>)}</section>
      <section className="dashboard-lower">
        <article className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Seguimiento</p><h2>Estado operativo del mes</h2></div><span className="status-chip status-chip--neutral">Sin información registrada</span></div><div className="empty-chart"><div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /></div><strong>Aún no hay datos para graficar</strong><p>Los indicadores se actualizarán cuando se registren personas, asistencia y procesos.</p></div></article>
        <article className="panel quick-panel"><div className="panel-heading"><div><p className="page-eyebrow">Acciones rápidas</p><h2>Comenzar una gestión</h2></div></div><button onClick={() => go("/procesos/nueva-contratacion", setRoute)}><span>＋</span><div><strong>Nueva contratación</strong><small>Iniciar proceso guiado</small></div><b>→</b></button><button onClick={() => go("/asistencia", setRoute)}><span>◷</span><div><strong>Informar asistencia</strong><small>Abrir registro por obra</small></div><b>→</b></button><button onClick={() => go("/documentos", setRoute)}><span>▤</span><div><strong>Gestionar documentos</strong><small>Consultar repositorio</small></div><b>→</b></button></article>
      </section>
      {detail && <DashboardDetail kind={detail} close={() => setDetail(null)} setRoute={setRoute} processes={processes} medicalLeaves={activeMedicalLeaves} workers={workers} />}
    </>
  );
}

function DashboardDetail({ kind, close, setRoute, processes, medicalLeaves, workers }: { kind: string; close: () => void; setRoute: (v: string) => void; processes: ProcessRecord[]; medicalLeaves: MedicalLeaveRecord[]; workers: WorkerProfile[] }) {
  const config: Record<string, { title: string; description: string; columns: string[]; action: string; path: string }> = {
    personas: { title: "Dotación vigente por obra", description: "Cantidad de trabajadores activos asignados a cada obra.", columns: ["Obra", "Dotación", "Hombres", "Mujeres"], action: "Ir a Trabajadores", path: "/personas" },
    asistencia: { title: "Asistencia informada", description: "Cobertura diaria por centro de costo y responsable.", columns: ["Centro de costo", "Responsable", "Total", "Informados", "Pendientes", "Estado"], action: "Ir al módulo Asistencia", path: "/asistencia?estado=pendiente" },
    contratos: { title: "Contratos por vencer", description: "Contratos y anexos que vencen en los próximos 30 días.", columns: ["Trabajador", "Centro de costo", "Documento", "Vencimiento", "Días", "Estado"], action: "Ir a Gestión Documental", path: "/documentos?filtro=por-vencer" },
    licencias: { title: "Licencias médicas activas", description: "Licencias que se cruzan con el período consultado.", columns: ["Centro de costo", "Trabajador", "Desde", "Hasta", "N° de días"], action: "Ir a Licencias Médicas", path: "/licencias" },
    finiquitos: { title: "Personas finiquitadas", description: "Procesos de finiquito correspondientes al período.", columns: ["Trabajador", "Centro de costo", "Fecha", "Causal", "Fecha límite", "Estado", "Legalizado", "Pagado"], action: "Ir a Finiquitos", path: "/procesos?tipo=finiquito" },
    tareas: { title: "Tareas pendientes", description: "Acciones que debes realizar o supervisar.", columns: ["Tarea", "Trabajador", "Responsable", "Creación", "Fecha límite", "Estado", "Prioridad", "Acción"], action: "Ir a Bandeja", path: "/bandeja" },
  };
  const item = config[kind];
  const licenseTable = kind === "licencias" && medicalLeaves.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{medicalLeaves.map((record) => <tr key={record.id}><td>{record.costCenter}</td><td>{record.workerName}</td><td>{new Date(`${record.from}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{new Date(`${record.to}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.days}</td></tr>)}</tbody></table></div> : null;
  const staffByWork = new Map<string, WorkerProfile[]>(); workers.forEach((worker) => { let sites: string[] = []; try { const parsed = JSON.parse(worker.workSites || "[]"); if (Array.isArray(parsed)) sites = parsed.map(String).filter(Boolean); } catch { sites = []; } if (!sites.length && worker.workSite) sites = [worker.workSite]; (sites.length ? sites : ["Sin obra asignada"]).forEach((site) => staffByWork.set(site, [...(staffByWork.get(site) ?? []), worker])); });
  const workersTable = kind === "personas" && workers.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{[...staffByWork.entries()].sort(([a], [b]) => a.localeCompare(b, "es")).map(([site, staff]) => <tr key={site}><td>{site}</td><td><strong>{staff.length}</strong></td><td>{staff.filter((worker) => worker.gender === "Masculino").length}</td><td>{staff.filter((worker) => worker.gender === "Femenino").length}</td></tr>)}</tbody></table></div> : null;
  return <div className="modal-backdrop" onMouseDown={close}><section className="detail-drawer" onMouseDown={(e) => e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><p className="page-eyebrow">Resumen del período</p><h2>{item.title}</h2><p className="muted">{item.description}</p>{workersTable ?? licenseTable ?? (kind === "tareas" && processes.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{processes.map((p) => <tr key={p.id}><td>Nueva contratación</td><td>{p.personName}</td><td>RRHH</td><td>{new Date(p.createdAt).toLocaleDateString("es-CL")}</td><td>Por definir</td><td><span className="status-chip">{p.status}</span></td><td>Media</td><td><button className="table-action" onClick={() => { close(); go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute); }}>Continuar</button></td></tr>)}</tbody></table></div> : <EmptyTable columns={item.columns} message={emptyMessages[kind] ?? "No hay tareas pendientes."} />)}<div className="drawer-footer"><button className="secondary-button" onClick={close}>Cerrar</button><button className="primary-button" onClick={() => { close(); go(item.path, setRoute); }}>{item.action} →</button></div></section></div>;
}

function Toolbar({ children }: { children?: React.ReactNode }) {
  return <div className="toolbar"><div className="search-field"><span>⌕</span><input placeholder="Buscar por nombre, RUT, código o centro de costo" /></div>{children}</div>;
}

function HiringProcess({ onSaved }: { onSaved: (p: ProcessRecord) => void }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<HiringDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const steps = ["Identificación", "Relación laboral", "Documentos", "Revisión"];
  function update(field: keyof HiringDraft, value: string | string[]) { setDraft((prev) => ({ ...prev, [field]: value })); setMessage(""); }
  function validCurrent() {
    if (step === 1) return Boolean(draft.rut && draft.firstName && draft.lastName);
    if (step === 2) return Boolean(draft.company && draft.costCenter && draft.role && draft.startDate);
    return true;
  }
  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/processes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
      const body = await response.json() as { process?: ProcessRecord; error?: string };
      if (!response.ok || !body.process) throw new Error(body.error ?? "No fue posible guardar el proceso.");
      onSaved(body.process); setMessage(`Proceso ${body.process.id} creado correctamente.`); setStep(4);
    } catch (error) { setMessage(error instanceof Error ? error.message : "No fue posible guardar el proceso."); }
    finally { setSaving(false); }
  }
  return <section className="process-layout"><aside className="process-steps"><p className="page-eyebrow">Progreso</p>{steps.map((label, index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} onClick={() => index + 1 < step && setStep(index + 1)}><span>{step > index + 1 ? "✓" : index + 1}</span><div><strong>{label}</strong><small>{["RUT y antecedentes", "Cargo, jornada y centro", "Respaldos iniciales", "Validación de RRHH"][index]}</small></div></button>)}<div className="process-note"><strong>El proceso continuará con</strong><p>Generación de contrato → firmas → respaldo → cierre.</p></div></aside><article className="panel process-form"><div className="panel-heading"><div><p className="page-eyebrow">Etapa {step} de 4</p><h2>{steps[step - 1]}</h2></div><span className="status-chip status-chip--draft">Borrador</span></div>{step === 1 && <div className="form-grid"><label className="full">RUT<input value={draft.rut} onChange={(e) => update("rut", e.target.value)} placeholder="12.345.678-9" /><small>El sistema buscará coincidencias antes de crear una persona.</small></label><label>Nombres<input value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Nombres" /></label><label>Apellidos<input value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Apellidos" /></label><div className="info-banner full"><span>i</span><p>Si el RUT ya existe, se recuperará la persona y solo se creará una nueva relación laboral.</p></div></div>}{step === 2 && <div className="form-grid"><label>Empresa<input value={draft.company} onChange={(e) => update("company", e.target.value)} placeholder="Razón social" /></label><label>Centro de costo<input value={draft.costCenter} onChange={(e) => update("costCenter", e.target.value)} placeholder="Obra o centro de costo" /></label><label>Cargo<input value={draft.role} onChange={(e) => update("role", e.target.value)} placeholder="Cargo" /></label><label>Jornada<select value={draft.workday} onChange={(e) => update("workday", e.target.value)}><option>Jornada administrativa</option><option>7x7</option><option>10x10</option><option>Turno especial</option></select></label><label>Fecha de ingreso<input type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} /></label></div>}{step === 3 && <div><p className="form-intro">Selecciona los documentos iniciales que quedarán requeridos en el proceso. Los archivos se cargarán desde Gestión Documental.</p><div className="check-grid">{["Cédula de identidad", "Currículum", "Certificado AFP", "Certificado de salud", "Antecedentes", "Licencia de conducir"].map((doc) => <label key={doc}><input type="checkbox" checked={draft.documents.includes(doc)} onChange={(e) => update("documents", e.target.checked ? [...draft.documents, doc] : draft.documents.filter((x) => x !== doc))} /><span>▤</span><strong>{doc}</strong></label>)}</div></div>}{step === 4 && <div className="review-grid"><div><small>Persona</small><strong>{draft.firstName} {draft.lastName}</strong><span>{draft.rut}</span></div><div><small>Relación laboral</small><strong>{draft.role}</strong><span>{draft.company} · {draft.costCenter}</span></div><div><small>Ingreso y jornada</small><strong>{draft.startDate ? new Date(`${draft.startDate}T12:00:00`).toLocaleDateString("es-CL") : "Por definir"}</strong><span>{draft.workday}</span></div><div><small>Documentos requeridos</small><strong>{draft.documents.length}</strong><span>{draft.documents.join(", ") || "Sin documentos seleccionados"}</span></div><div className="workflow-preview full"><p>Identificación</p><i>→</i><p>RRHH revisa</p><i>→</i><p>Generar contrato</p><i>→</i><p>Firmas</p><i>→</i><p>Cierre</p></div></div>}{message && <div className={message.startsWith("Proceso") ? "form-success" : "form-error"}>{message}</div>}<footer className="form-footer"><button className="secondary-button" disabled={step === 1} onClick={() => setStep(step - 1)}>← Anterior</button>{step < 4 ? <button className="primary-button" disabled={!validCurrent()} onClick={() => setStep(step + 1)}>Continuar →</button> : <button className="primary-button" disabled={saving || !validCurrent()} onClick={save}>{saving ? "Guardando…" : "Crear proceso"}</button>}</footer></article></section>;
}

function storeDraft(event: FormEvent<HTMLFormElement>, key: string, setRoute: (v: string) => void, back: string) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  sessionStorage.setItem(`sig-draft-${key}`, JSON.stringify(values));
  window.alert("Borrador guardado en esta sesión. Podrás continuar después de completar los datos maestros requeridos.");
  go(back, setRoute);
}

function exportEmptyReport(name: string) {
  const content = `Reporte;Estado;Período\r\n${name};Sin registros;Julio 2026\r\n`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = `reporte-${name.toLowerCase().replaceAll(" ", "-")}.csv`; link.click(); URL.revokeObjectURL(url);
}

function GenericModule({ route, setRoute, processes }: { route: string; setRoute: (v: string) => void; processes: ProcessRecord[] }) {
  if (route.startsWith("/asistencia")) return <AttendanceModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/vacaciones")) return <VacationsModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/documentos")) return <DocumentModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/licencias")) return <MedicalLeaveModule route={route} processes={processes} setRoute={setRoute} />;
  if (route === "/administracion/carga-masiva-de-trabajadores") return <BulkWorkersModule setRoute={setRoute} />;
  if (route === "/administracion/usuarios-y-permisos") return <UsersPermissionsModule processes={processes} setRoute={setRoute} />;
  if (route === "/administracion/bases-del-sistema") return <SystemBasesModule setRoute={setRoute} />;
  if (route === "/administracion/maestros-documentos") return <DocumentTemplatesModule setRoute={setRoute} />;
  if (route.startsWith("/administracion/empresas")) return <CompaniesModule route={route} setRoute={setRoute} />;
  if (route.startsWith("/administracion/obras-y-centros-de-costo")) return <WorkSitesModule route={route} setRoute={setRoute} />;
  if (route === "/bandeja") return <section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Prioridad y vencimiento</p><h2>Mis tareas</h2></div><span className="count-badge">{processes.length} tareas</span></div>{processes.length ? <div className="record-list">{processes.map((p) => <article key={p.id}><span className="record-icon">✓</span><div><small>Nueva contratación</small><strong>{p.personName}</strong><p>{p.stage} · {p.costCenter}</p></div><span className="status-chip">{p.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute)}>Continuar</button></article>)}</div> : <EmptyTable columns={["Tarea", "Trabajador", "Responsable", "Fecha límite", "Prioridad", "Estado", "Acción"]} message="No tienes tareas pendientes." />}</section>;

  if (route === "/procesos") return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Todos los flujos</p><h2>Procesos</h2></div><button className="primary-button" onClick={() => go("/procesos/nueva-contratacion", setRoute)}>＋ Nueva contratación</button></div><Toolbar><select><option>Todos los tipos</option><option>Nueva contratación</option><option>Anexo</option><option>Finiquito</option></select></Toolbar>{processes.length ? <div className="record-list">{processes.map((p) => <article key={p.id}><span className="record-icon">↻</span><div><small>{p.id}</small><strong>{p.type} · {p.personName}</strong><p>{p.company} · {p.costCenter} · {p.stage}</p></div><span className="status-chip">{p.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute)}>Abrir</button></article>)}</div> : <EmptyTable columns={["Proceso", "Trabajador", "Solicitante", "Responsable", "Etapa", "Fecha límite", "Estado", "Acciones"]} message="No hay procesos registrados." />}</section>;

  if (route.startsWith("/reportes/")) { const name = decodeURIComponent(route.split("/").pop() ?? "reporte").replaceAll("-", " "); return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Vista previa</p><h2>Reporte de {name}</h2></div><button className="primary-button" onClick={() => exportEmptyReport(name)}>Exportar CSV</button></div><PeriodFilters /><EmptyTable columns={["Registro", "Empresa", "Centro de costo", "Período", "Estado"]} message="No hay datos registrados para exportar en el período seleccionado." /><footer className="form-footer"><button className="secondary-button" onClick={() => go("/reportes", setRoute)}>← Volver a reportes</button><button className="table-action" onClick={() => window.print()}>Imprimir / PDF</button></footer></section>; }
  if (route === "/reportes") return <div className="report-grid">{[["Dotación", "Personas activas, relaciones laborales y centros de costo."],["Asistencia", "Días, horas, inasistencias y porcentaje informado."],["Vacaciones", "Saldos legales, progresivos y períodos utilizados."],["Documental", "Cumplimiento, faltantes, vencidos y firmas."],["Procesos", "Etapas, responsables, demoras y resultados."],["Auditoría", "Usuarios, acciones, valores anteriores y nuevos."]].map(([title, text]) => <article className="panel report-card" key={title}><span>▥</span><h2>{title}</h2><p>{text}</p><div><button className="secondary-button" onClick={() => go(`/reportes/${title.toLowerCase().replaceAll(" ", "-")}`, setRoute)}>Vista previa</button><button className="table-action" onClick={() => exportEmptyReport(title)}>Exportar</button></div></article>)}</div>;
  if (route === "/auditoria") return <section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Registro inalterable</p><h2>Eventos de auditoría</h2></div><span className="status-chip status-chip--secure">Solo lectura</span></div><Toolbar /><EmptyTable columns={["Fecha y hora", "Usuario", "Módulo", "Acción", "Registro", "Resultado", "Sesión"]} message="No hay eventos para mostrar en esta instalación inicial." /></section>;

  const masters = [["Empresas", "Razón social, RUT, representante y estado.", "/administracion/empresas"],["Carga masiva de trabajadores", "Ingreso y modificación masiva mediante plantilla CSV.", "/administracion/carga-masiva-de-trabajadores"],["Obras y centros de costo", "Empresa principal, dirección, región, comuna y estado.", "/administracion/obras-y-centros-de-costo"],["Usuarios y permisos", "Perfil para trabajadores existentes y alcance por centro de costo.", "/administracion/usuarios-y-permisos"],["Bases del sistema", "Cargos, bancos, cuentas, AFP, salud, feriados y otros valores permitidos.", "/administracion/bases-del-sistema"],["Maestros (Documentos)", "Formatos de contratos, anexos y otros documentos automáticos.", "/administracion/maestros-documentos"]];
  if (route.startsWith("/administracion/")) { const selected = decodeURIComponent(route.split("/").pop() ?? "maestro").replaceAll("-", " "); return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Maestro activo</p><h2>{selected}</h2></div><button className="primary-button" onClick={() => window.alert("Se abrió un nuevo registro del maestro. Completa los datos cuando las empresas y permisos estén configurados.")}>＋ Agregar registro</button></div><Toolbar /><EmptyTable columns={["Nombre", "Descripción", "Estado", "Última modificación", "Acciones"]} message="No existen registros en este maestro." /><footer className="form-footer"><button className="secondary-button" onClick={() => go("/administracion", setRoute)}>← Volver a Administración</button></footer></section>; }
  return <div className="admin-grid">{masters.map(([title, text, path], index) => <article className="panel admin-card" key={title}><span>{["▣","⇧","⌂","○","◇","⚙"][index]}</span><div><h2>{title}</h2><p>{text}</p></div><button className="table-action" onClick={() => go(path, setRoute)}>Administrar →</button></article>)}</div>;
}

export function SistemaApp() {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("/dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  useEffect(() => { const sync = () => setRoute(window.location.pathname); sync(); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  useEffect(() => { if (!name) return; fetch("/api/processes").then((r) => r.ok ? r.json() : { processes: [] }).then((data: { processes?: ProcessRecord[] }) => setProcesses(data.processes ?? [])).catch(() => setProcesses([])); }, [name]);
  const current = useMemo(() => route.split("?")[0], [route]);
  if (!name) return <Login onLogin={(user) => { setName(user); go("/dashboard", setRoute); }} />;
  return <div className="app-shell"><Sidebar route={current} setRoute={setRoute} open={mobileNav} close={() => setMobileNav(false)} /><div className="app-main"><button className="mobile-menu" onClick={() => setMobileNav(true)}>☰ <span>Menú</span></button><Header route={current} setRoute={setRoute} name={name} onLogout={() => setName("")} /><main className="content">{current === "/dashboard" ? <Dashboard setRoute={setRoute} processes={processes} /> : current.startsWith("/personas") ? <PersonasModule route={current} processes={processes} setRoute={setRoute} /> : current.startsWith("/procesos/nueva-contratacion") ? <HiringProcess onSaved={(record) => setProcesses((prev) => [record, ...prev])} /> : <GenericModule route={current} setRoute={setRoute} processes={processes} />}</main></div>{mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Cerrar menú" />}</div>;
}
