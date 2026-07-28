"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AttendanceModule, BulkWorkersModule, CajaLosAndesModule, CompaniesModule, DocumentModule, DocumentTemplatesModule, identifiedWorkSite, identifiedWorkSites, LaborFolderModule, MedicalLeaveModule, PersonasModule, SystemBasesModule, UsersPermissionsModule, VacationsModule, WorkSitesModule, type MedicalLeaveRecord, type WorkerProfile, type WorkSiteRecord } from "./OperationalModules";

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

type VacationInboxRecord = {
  id: string;
  workerRut: string;
  category: string;
  subtype: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  metadata: string;
  fileKey: string;
};

type AttendanceInboxEntry = { id: string; batchId: string; date: string; workerRut: string; workerName: string; costCenter: string; status: string; states: string; reviewNote: string };
type DashboardWorkerRecord = { id: string; workerRut: string; category: string; subtype: string; title: string; issueDate: string; expiryDate: string; status: string; detail: string; metadata: string; fileKey: string; createdAt: string };
type AuditEvent = { id: number; userName: string; module: string; action: string; recordId: string; detail: string; createdAt: string };
type DashboardTask = { id: string; task: string; worker: string; createdAt: string; status: string; path: string };

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
  ["/carpeta-laboral", "▣", "Carpeta Laboral"],
  ["/procesos", "↻", "Procesos"],
  ["/reportes", "▥", "Reportes"],
  ["/auditoria", "◎", "Auditoría"],
  ["/administracion", "⚙", "Administración"],
] as const;

const routeTitles: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  "/dashboard": { eyebrow: "Control mensual", title: "Dashboard", subtitle: "Indicadores y alertas del período seleccionado." },
  "/bandeja": { eyebrow: "Mi trabajo", title: "Bandeja de trabajo", subtitle: "Tareas asignadas, supervisadas y próximas a vencer." },
  "/personas": { eyebrow: "Gestión de trabajadores", title: "Trabajadores", subtitle: "Busca, consulta e ingresa información de trabajadores." },
  "/asistencia": { eyebrow: "Registro diario", title: "Asistencia", subtitle: "Control por obra, trabajador y período." },
  "/vacaciones": { eyebrow: "Saldos y solicitudes", title: "Vacaciones", subtitle: "Períodos, folios, documentos y aprobaciones." },
  "/licencias": { eyebrow: "Control de ausencias", title: "Licencias Médicas", subtitle: "Resumen y registro de licencias por trabajador, obra y mes." },
  "/carpeta-laboral": { eyebrow: "Respaldo mensual", title: "Carpeta Laboral", subtitle: "Documentos mensuales organizados por obra y período." },
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

  return <main className="login-page"><section className="login-hero" aria-label="Portada del Sistema Integral de Gestión"><img src="/login-cover-v2.png" alt="Sistema Integral de Gestión" /></section><section className="login-panel"><form className="login-card" onSubmit={submit}><div className="brand-mark"><span>SIG</span></div><p className="kicker kicker--blue">Bienvenida</p><h2>Accede a tu espacio de trabajo</h2><p className="muted">Ingresa tus credenciales para continuar.</p><label>Usuario<input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Nombre de usuario" autoComplete="username" autoFocus /></label><label>Contraseña o PIN<div className="password-wrap"><input value={pin} onChange={(e) => setPin(e.target.value)} type={show ? "text" : "password"} placeholder="Ingresa tu PIN" autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)}>{show ? "Ocultar" : "Ver"}</button></div></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button primary-button--wide" type="submit">Iniciar sesión <span>→</span></button><div className="secure-note"><span>◆</span><div><strong>Conexión segura</strong><small>Tu acceso queda protegido y registrado.</small></div></div><p className="demo-access">Acceso inicial: <strong>francisca</strong> · PIN <strong>1234</strong></p></form></section></main>;
}

function Header({ route, setRoute, name, onLogout }: { route: string; setRoute: (v: string) => void; name: string; onLogout: () => void }) {
  const meta = route.startsWith("/procesos/nueva-contratacion")
    ? { eyebrow: "Procesos · Nueva contratación", title: "Nueva contratación", subtitle: "Identifica a la persona y crea una nueva relación laboral." }
    : route === "/personas/nueva-solicitud" ? { eyebrow: "Trabajadores · Nueva solicitud", title: "Ingreso de trabajador", subtitle: "Completa los antecedentes personales, laborales y previsionales." }
    : route === "/asistencia/nuevo" ? { eyebrow: "Asistencia · Nuevo ingreso", title: "Nuevo ingreso de asistencia", subtitle: "Informa la jornada de la dotación seleccionada." }
    : route.startsWith("/vacaciones/nueva-solicitud") ? { eyebrow: "Vacaciones · Solicitud", title: "Nueva solicitud de vacaciones", subtitle: "Calcula días hábiles y genera el folio del proceso." }
    : route === "/licencias/nueva" ? { eyebrow: "Licencias Médicas · Registro", title: "Nueva licencia médica", subtitle: "Registra el período, folio y especialidad del trabajador." }
    : route.startsWith("/documentos/solicitud/") ? { eyebrow: "Gestión Documental · Solicitud", title: "Nueva solicitud documental", subtitle: "Completa los antecedentes del documento seleccionado." }
    : route.startsWith("/vacaciones/") ? routeTitles["/vacaciones"]
    : route.startsWith("/asistencia/") ? routeTitles["/asistencia"]
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
  const [workSites, setWorkSites] = useState<WorkSiteRecord[]>([]);
  const [workerRecords, setWorkerRecords] = useState<DashboardWorkerRecord[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceInboxEntry[]>([]);
  useEffect(() => { fetch("/api/medical-leaves", { cache: "no-store" }).then((response) => response.ok ? response.json() : { medicalLeaves: [] }).then((data: { medicalLeaves?: Array<MedicalLeaveRecord & { dateFrom?: string; dateTo?: string }> }) => setMedicalLeaves((data.medicalLeaves ?? []).map((leave) => ({ ...leave, from: leave.from || leave.dateFrom || "", to: leave.to || leave.dateTo || "" })))).catch(() => setMedicalLeaves([])); }, []);
  useEffect(() => { fetch("/api/workers").then((response) => response.ok ? response.json() : { workers: [] }).then((data: { workers?: WorkerProfile[] }) => setWorkers(data.workers ?? [])).catch(() => setWorkers([])); }, []);
  useEffect(() => { fetch("/api/work-sites").then((response) => response.ok ? response.json() : { workSites: [] }).then((data: { workSites?: WorkSiteRecord[] }) => setWorkSites(data.workSites ?? [])).catch(() => setWorkSites([])); }, []);
  useEffect(() => { Promise.all([fetch("/api/worker-records", { cache: "no-store" }).then((response) => response.ok ? response.json() : { records: [] }), fetch("/api/attendance", { cache: "no-store" }).then((response) => response.ok ? response.json() : { entries: [] })]).then(([recordData, attendanceData]) => { setWorkerRecords(recordData.records ?? []); setAttendanceEntries(attendanceData.entries ?? []); }).catch(() => { setWorkerRecords([]); setAttendanceEntries([]); }); }, []);
  const currentDay = useMemo(() => { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }, []);
  const currentMonth = currentDay.slice(0, 7); const monthStart = `${currentMonth}-01`; const monthEnd = `${currentMonth}-31`;
  const activeMedicalLeaves = medicalLeaves.filter((record) => record.from <= monthEnd && record.to >= monthStart);
  const activeWorkers = workers.filter((worker) => worker.active !== false);
  const workerName = (rut: string) => { const worker = workers.find((item) => item.identityNumber === rut); return worker ? [worker.firstNames, worker.lastNames].filter(Boolean).join(" ") || worker.fullName : rut; };
  const recordMeta = (record: DashboardWorkerRecord) => { try { return JSON.parse(record.metadata || "{}") as { supportFor?: string }; } catch { return {}; } };
  const approvedVacation = ["Aprobada", "Aprobado", "Firmado", "Firmada", "Completado", "Completada"];
  const pendingTasks: DashboardTask[] = [
    ...processes.filter((process) => process.status !== "Finalizado").map((process) => ({ id: process.id, task: process.type, worker: process.personName, createdAt: process.createdAt, status: process.status, path: `/procesos/nueva-contratacion?id=${process.id}` })),
    ...workerRecords.filter((record) => ["Pendiente de aprobación", "Pendiente de firma", "En revisión"].includes(record.status)).map((record) => ({ id: record.id, task: `${record.category} · ${record.subtype}`, worker: workerName(record.workerRut), createdAt: record.createdAt, status: record.status, path: record.category === "Vacaciones" ? "/vacaciones/pendientes" : "/documentos" })),
    ...workerRecords.filter((record) => ["Solicitud de vacaciones", "Vacaciones"].includes(record.subtype) && approvedVacation.includes(record.status) && !record.fileKey && !workerRecords.some((support) => recordMeta(support).supportFor === record.id && support.fileKey)).map((record) => ({ id: `doc-${record.id}`, task: "Vacaciones · documento por cargar", worker: workerName(record.workerRut), createdAt: record.createdAt, status: "Pendiente de documento", path: "/vacaciones/documentos-aprobados" })),
    ...[...new Map(attendanceEntries.filter((entry) => entry.status === "En revisión").map((entry) => [entry.batchId, entry])).values()].map((entry) => ({ id: entry.batchId, task: "Asistencia · revisión por trabajador", worker: entry.costCenter || "Total empresa", createdAt: entry.date, status: "En revisión", path: `/asistencia/revision/${encodeURIComponent(entry.batchId)}` })),
  ];
  const monthAttendance = attendanceEntries.filter((entry) => entry.date.startsWith(currentMonth) && entry.status !== "Rechazada"); const attendanceCoverage = activeWorkers.length ? Math.min(100, Math.round(new Set(monthAttendance.map((entry) => entry.workerRut)).size / activeWorkers.length * 100)) : 0;
  const expiringContracts = workerRecords.filter((record) => record.category === "Documentación laboral" && record.expiryDate >= currentDay && record.expiryDate <= new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const terminations = workerRecords.filter((record) => (record.category === "Finiquito" || record.subtype === "Finiquito") && record.issueDate.startsWith(currentMonth));
  const men = activeWorkers.filter((worker) => worker.gender.trim().toLocaleLowerCase("es").startsWith("mascul")).length;
  const women = activeWorkers.filter((worker) => worker.gender.trim().toLocaleLowerCase("es").startsWith("femen")).length;
  const cards = [
    { id: "personas", icon: "○", value: String(activeWorkers.length), label: "Trabajadores activos", note: `${men} hombres · ${women} mujeres`, tone: "blue" },
    { id: "asistencia", icon: "◷", value: `${attendanceCoverage}%`, label: "Asistencia informada", note: `${monthAttendance.length} registros válidos del mes`, tone: "green" },
    { id: "contratos", icon: "▤", value: String(expiringContracts.length), label: "Contratos por vencer", note: "Próximos 30 días", tone: "amber" },
    { id: "licencias", icon: "+", value: String(activeMedicalLeaves.length), label: "Licencias médicas", note: "Activas en el período", tone: "violet" },
    { id: "finiquitos", icon: "□", value: String(terminations.length), label: "Personas finiquitadas", note: "Durante el período", tone: "slate" },
    { id: "tareas", icon: "✓", value: String(pendingTasks.length), label: "Tareas pendientes", note: pendingTasks.length ? "Acciones por resolver" : "Sin tareas asignadas", tone: "red" },
  ];
  return (
    <>
      <PeriodFilters />
      <section className="metrics-grid">{cards.map((card) => <button key={card.id} className={`metric-card metric-card--${card.tone}`} onClick={() => setDetail(card.id)}><span className="metric-icon">{card.icon}</span><div><strong>{card.value}</strong><h3>{card.label}</h3><p>{card.note}</p></div><i>→</i></button>)}</section>
      <section className="dashboard-lower">
        <article className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Seguimiento</p><h2>Estado operativo del mes</h2></div><span className="status-chip status-chip--secure">Información actualizada</span></div><div className="dashboard-status-list"><div><strong>{activeWorkers.length}</strong><span>Trabajadores activos</span></div><div><strong>{monthAttendance.length}</strong><span>Asistencias informadas</span></div><div><strong>{activeMedicalLeaves.length}</strong><span>Licencias del mes</span></div><div><strong>{pendingTasks.length}</strong><span>Tareas pendientes</span></div></div></article>
        <article className="panel quick-panel"><div className="panel-heading"><div><p className="page-eyebrow">Acciones rápidas</p><h2>Comenzar una gestión</h2></div></div><button onClick={() => go("/procesos/nueva-contratacion", setRoute)}><span>＋</span><div><strong>Nueva contratación</strong><small>Iniciar proceso guiado</small></div><b>→</b></button><button onClick={() => go("/asistencia", setRoute)}><span>◷</span><div><strong>Informar asistencia</strong><small>Abrir registro por obra</small></div><b>→</b></button><button onClick={() => go("/documentos", setRoute)}><span>▤</span><div><strong>Gestionar documentos</strong><small>Consultar repositorio</small></div><b>→</b></button></article>
      </section>
      {detail && <DashboardDetail kind={detail} close={() => setDetail(null)} setRoute={setRoute} processes={processes} medicalLeaves={activeMedicalLeaves} workers={activeWorkers} workSites={workSites} tasks={pendingTasks} workerRecords={workerRecords} attendance={monthAttendance} />}
    </>
  );
}

function DashboardDetail({ kind, close, setRoute, processes, medicalLeaves, workers, workSites, tasks, workerRecords, attendance }: { kind: string; close: () => void; setRoute: (v: string) => void; processes: ProcessRecord[]; medicalLeaves: MedicalLeaveRecord[]; workers: WorkerProfile[]; workSites: WorkSiteRecord[]; tasks: DashboardTask[]; workerRecords: DashboardWorkerRecord[]; attendance: AttendanceInboxEntry[] }) {
  const config: Record<string, { title: string; description: string; columns: string[]; action: string; path: string }> = {
    personas: { title: "Dotación vigente por obra", description: "Cantidad de trabajadores activos asignados a cada obra.", columns: ["Obra", "Dotación"], action: "Ir a Trabajadores", path: "/personas" },
    asistencia: { title: "Asistencia informada", description: "Cobertura diaria por obra y responsable.", columns: ["Obra", "Responsable", "Total", "Informados", "Pendientes", "Estado"], action: "Ir al módulo Asistencia", path: "/asistencia?estado=pendiente" },
    contratos: { title: "Contratos por vencer", description: "Contratos y anexos que vencen en los próximos 30 días.", columns: ["Trabajador", "Obra", "Documento", "Vencimiento", "Días", "Estado"], action: "Ir a Gestión Documental", path: "/documentos?filtro=por-vencer" },
    licencias: { title: "Licencias médicas activas", description: "Licencias que se cruzan con el período consultado.", columns: ["Obra", "Trabajador", "Desde", "Hasta", "N° de días"], action: "Ir a Licencias Médicas", path: "/licencias" },
    finiquitos: { title: "Personas finiquitadas", description: "Procesos de finiquito correspondientes al período.", columns: ["Trabajador", "Obra", "Fecha", "Causal", "Fecha límite", "Estado", "Legalizado", "Pagado"], action: "Ir a Finiquitos", path: "/procesos?tipo=finiquito" },
    tareas: { title: "Tareas pendientes", description: "Acciones que debes realizar o supervisar.", columns: ["Tarea", "Trabajador", "Responsable", "Creación", "Fecha límite", "Estado", "Prioridad", "Acción"], action: "Ir a Bandeja", path: "/bandeja" },
  };
  const item = config[kind];
  const licenseTable = kind === "licencias" && medicalLeaves.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{medicalLeaves.map((record) => <tr key={record.id}><td>{identifiedWorkSites(record.costCenter.split(" · ").filter(Boolean), workSites) || "Sin obra asignada"}</td><td>{record.workerName}</td><td>{new Date(`${record.from}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{new Date(`${record.to}T12:00:00`).toLocaleDateString("es-CL")}</td><td>{record.days}</td></tr>)}</tbody></table></div> : null;
  const staffByWork = new Map<string, WorkerProfile[]>(); workers.forEach((worker) => { let sites: string[] = []; try { const parsed = JSON.parse(worker.workSites || "[]"); if (Array.isArray(parsed)) sites = parsed.map(String).map((site) => identifiedWorkSite(site, workSites)).filter(Boolean); } catch { sites = []; } if (!sites.length && worker.workSite) { const code = identifiedWorkSite(worker.workSite, workSites); if (code) sites = [code]; } (sites.length ? [...new Set(sites)] : ["Sin obra asignada"]).forEach((site) => staffByWork.set(site, [...(staffByWork.get(site) ?? []), worker])); });
  const workersTable = kind === "personas" && workers.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{[...staffByWork.entries()].sort(([a], [b]) => a.localeCompare(b, "es")).map(([site, staff]) => <tr key={site}><td>{site}</td><td><strong>{staff.length}</strong></td></tr>)}</tbody></table></div> : null;
  const attendanceByWork = [...new Map(attendance.map((entry) => [entry.costCenter || "Total empresa", attendance.filter((item) => (item.costCenter || "Total empresa") === (entry.costCenter || "Total empresa"))])).entries()];
  const attendanceTable = kind === "asistencia" && attendanceByWork.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{attendanceByWork.map(([site, entries]) => <tr key={site}><td>{identifiedWorkSite(site, workSites) || site}</td><td>RRHH</td><td>{entries.length}</td><td>{entries.filter((entry) => entry.status === "Aprobada").length}</td><td>{entries.filter((entry) => entry.status === "En revisión").length}</td><td>{entries.some((entry) => entry.status === "En revisión") ? "En revisión" : "Revisado"}</td></tr>)}</tbody></table></div> : null;
  const today = new Date().toISOString().slice(0, 10); const limit = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10); const expiring = workerRecords.filter((record) => record.category === "Documentación laboral" && record.expiryDate >= today && record.expiryDate <= limit);
  const contractsTable = kind === "contratos" && expiring.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{expiring.map((record) => { const worker = workers.find((item) => item.identityNumber === record.workerRut); const days = Math.ceil((new Date(`${record.expiryDate}T12:00:00`).getTime() - Date.now()) / 86_400_000); return <tr key={record.id}><td>{worker ? `${worker.firstNames} ${worker.lastNames}`.trim() || worker.fullName : record.workerRut}</td><td>{worker ? identifiedWorkSites(worker.workSites || worker.workSite, workSites) : "—"}</td><td>{record.subtype}</td><td>{record.expiryDate.split("-").reverse().join("-")}</td><td>{days}</td><td>{record.status}</td></tr>; })}</tbody></table></div> : null;
  const finiquitos = workerRecords.filter((record) => record.category === "Finiquito" || record.subtype === "Finiquito");
  const terminationTable = kind === "finiquitos" && finiquitos.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{finiquitos.map((record) => <tr key={record.id}><td>{record.workerRut}</td><td>—</td><td>{record.issueDate || "—"}</td><td>{record.title || record.detail}</td><td>—</td><td>{record.status}</td><td>{record.fileKey ? "Sí" : "Pendiente"}</td><td>{record.status === "Completado" ? "Sí" : "Pendiente"}</td></tr>)}</tbody></table></div> : null;
  const taskTable = kind === "tareas" && tasks.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td>{task.task}</td><td>{task.worker}</td><td>RRHH</td><td>{task.createdAt ? new Date(`${task.createdAt.slice(0, 10)}T12:00:00`).toLocaleDateString("es-CL") : "—"}</td><td>Por resolver</td><td><span className="status-chip">{task.status}</span></td><td>Media</td><td><button className="table-action" onClick={() => { close(); go(task.path, setRoute); }}>Revisar</button></td></tr>)}</tbody></table></div> : null;
  return <div className="modal-backdrop" onMouseDown={close}><section className="detail-drawer" onMouseDown={(e) => e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><p className="page-eyebrow">Resumen del período</p><h2>{item.title}</h2><p className="muted">{item.description}</p>{workersTable ?? licenseTable ?? attendanceTable ?? contractsTable ?? terminationTable ?? taskTable ?? <EmptyTable columns={item.columns} message={emptyMessages[kind] ?? "No hay tareas pendientes."} />}<div className="drawer-footer"><button className="secondary-button" onClick={close}>Cerrar</button><button className="primary-button" onClick={() => { close(); go(item.path, setRoute); }}>{item.action} →</button></div></section></div>;
}

function Toolbar({ children }: { children?: React.ReactNode }) {
  return <div className="toolbar"><div className="search-field"><span>⌕</span><input placeholder="Buscar por nombre, RUT, código u obra" /></div>{children}</div>;
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
  return <section className="process-layout"><aside className="process-steps"><p className="page-eyebrow">Progreso</p>{steps.map((label, index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} onClick={() => index + 1 < step && setStep(index + 1)}><span>{step > index + 1 ? "✓" : index + 1}</span><div><strong>{label}</strong><small>{["RUT y antecedentes", "Cargo, jornada y obra", "Respaldos iniciales", "Validación de RRHH"][index]}</small></div></button>)}<div className="process-note"><strong>El proceso continuará con</strong><p>Generación de contrato → firmas → respaldo → cierre.</p></div></aside><article className="panel process-form"><div className="panel-heading"><div><p className="page-eyebrow">Etapa {step} de 4</p><h2>{steps[step - 1]}</h2></div><span className="status-chip status-chip--draft">Borrador</span></div>{step === 1 && <div className="form-grid"><label className="full">RUT<input value={draft.rut} onChange={(e) => update("rut", e.target.value)} placeholder="12.345.678-9" /><small>El sistema buscará coincidencias antes de crear una persona.</small></label><label>Nombres<input value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Nombres" /></label><label>Apellidos<input value={draft.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Apellidos" /></label><div className="info-banner full"><span>i</span><p>Si el RUT ya existe, se recuperará la persona y solo se creará una nueva relación laboral.</p></div></div>}{step === 2 && <div className="form-grid"><label>Empresa<input value={draft.company} onChange={(e) => update("company", e.target.value)} placeholder="Razón social" /></label><label>Obra<input value={draft.costCenter} onChange={(e) => update("costCenter", e.target.value)} placeholder="Nombre de la obra" /></label><label>Cargo<input value={draft.role} onChange={(e) => update("role", e.target.value)} placeholder="Cargo" /></label><label>Jornada<select value={draft.workday} onChange={(e) => update("workday", e.target.value)}><option>Jornada administrativa</option><option>7x7</option><option>10x10</option><option>Turno especial</option></select></label><label>Fecha de ingreso<input type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} /></label></div>}{step === 3 && <div><p className="form-intro">Selecciona los documentos iniciales que quedarán requeridos en el proceso. Los archivos se cargarán desde Gestión Documental.</p><div className="check-grid">{["Cédula de identidad", "Currículum", "Certificado AFP", "Certificado de salud", "Antecedentes", "Licencia de conducir"].map((doc) => <label key={doc}><input type="checkbox" checked={draft.documents.includes(doc)} onChange={(e) => update("documents", e.target.checked ? [...draft.documents, doc] : draft.documents.filter((x) => x !== doc))} /><span>▤</span><strong>{doc}</strong></label>)}</div></div>}{step === 4 && <div className="review-grid"><div><small>Persona</small><strong>{draft.firstName} {draft.lastName}</strong><span>{draft.rut}</span></div><div><small>Relación laboral</small><strong>{draft.role}</strong><span>{draft.company} · {draft.costCenter}</span></div><div><small>Ingreso y jornada</small><strong>{draft.startDate ? new Date(`${draft.startDate}T12:00:00`).toLocaleDateString("es-CL") : "Por definir"}</strong><span>{draft.workday}</span></div><div><small>Documentos requeridos</small><strong>{draft.documents.length}</strong><span>{draft.documents.join(", ") || "Sin documentos seleccionados"}</span></div><div className="workflow-preview full"><p>Identificación</p><i>→</i><p>RRHH revisa</p><i>→</i><p>Generar contrato</p><i>→</i><p>Firmas</p><i>→</i><p>Cierre</p></div></div>}{message && <div className={message.startsWith("Proceso") ? "form-success" : "form-error"}>{message}</div>}<footer className="form-footer"><button className="secondary-button" disabled={step === 1} onClick={() => setStep(step - 1)}>← Anterior</button>{step < 4 ? <button className="primary-button" disabled={!validCurrent()} onClick={() => setStep(step + 1)}>Continuar →</button> : <button className="primary-button" disabled={saving || !validCurrent()} onClick={save}>{saving ? "Guardando…" : "Crear proceso"}</button>}</footer></article></section>;
}

function storeDraft(event: FormEvent<HTMLFormElement>, key: string, setRoute: (v: string) => void, back: string) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  sessionStorage.setItem(`sig-draft-${key}`, JSON.stringify(values));
  window.alert("Borrador guardado en esta sesión. Podrás continuar después de completar los datos maestros requeridos.");
  go(back, setRoute);
}

function exportRows(name: string, columns: string[], rows: string[][]) {
  const csvCell = (value: string) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const content = `\uFEFF${[columns, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = `reporte-${name.toLowerCase().replaceAll(" ", "-")}.csv`; link.click(); URL.revokeObjectURL(url);
}

function ReportsModule({ route, processes, setRoute }: { route: string; processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]); const [attendance, setAttendance] = useState<AttendanceInboxEntry[]>([]); const [records, setRecords] = useState<DashboardWorkerRecord[]>([]); const [events, setEvents] = useState<AuditEvent[]>([]); const [workSites, setWorkSites] = useState<WorkSiteRecord[]>([]); const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  useEffect(() => { Promise.all([fetch("/api/workers", { cache: "no-store" }).then((r) => r.ok ? r.json() : { workers: [] }), fetch("/api/attendance", { cache: "no-store" }).then((r) => r.ok ? r.json() : { entries: [] }), fetch("/api/worker-records", { cache: "no-store" }).then((r) => r.ok ? r.json() : { records: [] }), fetch("/api/audit-events", { cache: "no-store" }).then((r) => r.ok ? r.json() : { events: [] }), fetch("/api/work-sites", { cache: "no-store" }).then((r) => r.ok ? r.json() : { workSites: [] })]).then(([w, a, r, e, s]) => { setWorkers(w.workers ?? []); setAttendance(a.entries ?? []); setRecords(r.records ?? []); setEvents(e.events ?? []); setWorkSites(s.workSites ?? []); }).catch(() => { setWorkers([]); setAttendance([]); setRecords([]); setEvents([]); setWorkSites([]); }); }, []);
  if (route === "/reportes") return <div className="report-grid">{[["Dotación", "Personas activas, relaciones laborales y obras."],["Asistencia", "Días, horas, inasistencias y estado de revisión."],["Vacaciones", "Solicitudes, saldos informados y documentos pendientes."],["Documental", "Documentos cargados, vencimientos y estado."],["Procesos", "Etapas, responsables y estado."],["Auditoría", "Usuarios y acciones realizadas en el sistema."]].map(([title, text]) => <article className="panel report-card" key={title}><span>▥</span><h2>{title}</h2><p>{text}</p><div><button className="secondary-button" onClick={() => go(`/reportes/${title.toLowerCase().replaceAll(" ", "-")}`, setRoute)}>Vista previa</button><button className="table-action" onClick={() => go(`/reportes/${title.toLowerCase().replaceAll(" ", "-")}`, setRoute)}>Preparar exportación</button></div></article>)}</div>;
  const key = decodeURIComponent(route.slice("/reportes/".length)).toLocaleLowerCase("es"); const workerName = (rut: string) => { const worker = workers.find((item) => item.identityNumber === rut); return worker ? [worker.firstNames, worker.lastNames].filter(Boolean).join(" ") || worker.fullName : rut; }; const sitesOf = (worker?: WorkerProfile) => worker ? identifiedWorkSites(worker.workSites || worker.workSite, workSites) || "Sin obra" : "Sin obra";
  let name = "Dotación"; let columns = ["Código", "Trabajador", "RUT", "Obra", "Cargo", "Estado"]; let rows = workers.map((worker) => [worker.workerCode || "—", workerName(worker.identityNumber), worker.identityNumber, sitesOf(worker), worker.role, worker.active === false ? "Inactivo" : "Activo"]);
  if (key.includes("asistencia")) { name = "Asistencia"; columns = ["Fecha", "Trabajador", "RUT", "Obra", "Estado informado", "Revisión", "Observación"]; rows = attendance.filter((entry) => entry.date.startsWith(month)).map((entry) => { let state = entry.states; try { state = (JSON.parse(entry.states) as string[]).join(", "); } catch {} return [entry.date.split("-").reverse().join("-"), entry.workerName, entry.workerRut, entry.costCenter || "Total empresa", state, entry.status, entry.reviewNote || "—"]; }); }
  else if (key.includes("vacaciones")) { name = "Vacaciones"; columns = ["Trabajador", "Folio", "Desde", "Hasta", "Estado", "Documento"]; rows = records.filter((record) => record.category === "Vacaciones" && (!month || record.issueDate.startsWith(month))).map((record) => [workerName(record.workerRut), record.title, record.issueDate.split("-").reverse().join("-"), record.expiryDate.split("-").reverse().join("-"), record.status, record.fileKey ? "Cargado" : "Pendiente"]); }
  else if (key.includes("documental")) { name = "Documental"; columns = ["Trabajador / Obra", "Categoría", "Documento", "Fecha", "Vencimiento", "Estado"]; rows = records.filter((record) => record.category !== "Vacaciones" && (!month || !record.issueDate || record.issueDate.startsWith(month))).map((record) => [record.workerRut.startsWith("OBRA:") ? record.workerRut.slice(5) : workerName(record.workerRut), record.category, record.subtype, record.issueDate || "—", record.expiryDate || "No aplica", record.fileKey ? "Cargado" : record.status]); }
  else if (key.includes("procesos")) { name = "Procesos"; columns = ["Proceso", "Trabajador", "Obra", "Cargo", "Etapa", "Estado"]; rows = processes.map((process) => [process.type, process.personName, process.costCenter, process.role, process.stage, process.status]); }
  else if (key.includes("auditor")) { name = "Auditoría"; columns = ["Fecha y hora", "Usuario", "Módulo", "Acción", "Registro", "Detalle"]; rows = events.filter((event) => !month || event.createdAt.startsWith(month)).map((event) => [event.createdAt, event.userName, event.module, event.action, event.recordId, event.detail]); }
  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Vista previa con datos reales</p><h2>Reporte de {name}</h2></div><button className="primary-button" disabled={!rows.length} onClick={() => exportRows(name, columns, rows)}>Exportar CSV ({rows.length})</button></div>{name !== "Dotación" && name !== "Procesos" && <div className="period-filters"><label>Mes<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div>}<div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.slice(0, 500).map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell}>{value}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="table-empty"><span>◇</span><strong>Sin registros</strong><p>No hay información para los filtros seleccionados.</p></div>}</div><footer className="form-footer"><button className="secondary-button" onClick={() => go("/reportes", setRoute)}>← Volver a reportes</button><button className="table-action" onClick={() => window.print()}>Imprimir / Guardar PDF</button></footer></section>;
}

function AuditModule() {
  const [events, setEvents] = useState<AuditEvent[]>([]); const [search, setSearch] = useState(""); const [module, setModule] = useState("");
  useEffect(() => { fetch("/api/audit-events", { cache: "no-store" }).then((response) => response.ok ? response.json() : { events: [] }).then((data) => setEvents(data.events ?? [])).catch(() => setEvents([])); }, []);
  const modules = [...new Set(events.map((event) => event.module).filter(Boolean))].sort(); const filtered = events.filter((event) => (!module || event.module === module) && (!search || `${event.userName} ${event.module} ${event.action} ${event.recordId} ${event.detail}`.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")))); const columns = ["Fecha y hora", "Usuario", "Módulo", "Acción", "Registro", "Detalle"]; const rows = filtered.map((event) => [event.createdAt, event.userName, event.module, event.action, event.recordId, event.detail]);
  return <section className="panel module-panel"><div className="section-actions"><div><p className="page-eyebrow">Registro protegido</p><h2>Eventos de auditoría</h2><p>Consulta las acciones realizadas en los distintos módulos.</p></div><button className="primary-button" disabled={!rows.length} onClick={() => exportRows("Auditoría", columns, rows)}>Exportar auditoría</button></div><div className="audit-filters"><label>Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Usuario, acción o registro" /></label><label>Módulo<select value={module} onChange={(event) => setModule(event.target.value)}><option value="">Todos los módulos</option>{modules.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={filtered[index].id}>{row.map((value, cell) => <td key={cell}>{value || "—"}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="table-empty"><span>◇</span><strong>Sin eventos</strong><p>No hay acciones que coincidan con los filtros.</p></div>}</div></section>;
}

function WorkInbox({ processes, setRoute }: { processes: ProcessRecord[]; setRoute: (path: string) => void }) {
  const [vacationRecords, setVacationRecords] = useState<VacationInboxRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceInboxEntry[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/worker-records", { cache: "no-store" }).then((response) => response.ok ? response.json() : { records: [] }),
      fetch("/api/workers", { cache: "no-store" }).then((response) => response.ok ? response.json() : { workers: [] }),
      fetch("/api/attendance", { cache: "no-store" }).then((response) => response.ok ? response.json() : { entries: [] }),
    ]).then(([recordData, workerData, attendanceData]) => { setVacationRecords(recordData.records ?? []); setWorkers(workerData.workers ?? []); setAttendanceEntries(attendanceData.entries ?? []); }).catch(() => { setVacationRecords([]); setWorkers([]); setAttendanceEntries([]); });
  }, []);
  const metadata = (record: VacationInboxRecord) => { try { return JSON.parse(record.metadata || "{}") as { supportFor?: string; businessDays?: number; folio?: string | number }; } catch { return {}; } };
  const requests = vacationRecords.filter((record) => record.subtype === "Solicitud de vacaciones");
  const pendingApprovals = requests.filter((record) => ["Pendiente de aprobación", "Pendiente de firma"].includes(record.status));
  const pendingDocuments = vacationRecords.filter((record) => ["Solicitud de vacaciones", "Vacaciones"].includes(record.subtype) && ["Aprobada", "Aprobado", "Firmado", "Firmada", "Completado", "Completada"].includes(record.status) && !record.fileKey && !vacationRecords.some((support) => metadata(support).supportFor === record.id && support.fileKey));
  const otherApprovals = vacationRecords.filter((record) => record.subtype !== "Solicitud de vacaciones" && ["Pendiente de aprobación", "Pendiente de firma", "En revisión"].includes(record.status));
  const attendanceBatches = [...new Map(attendanceEntries.filter((entry) => entry.status === "En revisión").map((entry) => [entry.batchId, attendanceEntries.filter((item) => item.batchId === entry.batchId)])).entries()];
  const workerName = (rut: string) => { const worker = workers.find((item) => item.identityNumber === rut); return worker ? [worker.firstNames, worker.lastNames].filter(Boolean).join(" ") || worker.fullName : rut; };
  const pendingProcesses = processes.filter((process) => process.status !== "Finalizado"); const total = pendingProcesses.length + pendingApprovals.length + pendingDocuments.length + otherApprovals.length + attendanceBatches.length;
  return <section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Prioridad y vencimiento</p><h2>Mis tareas</h2></div><span className="count-badge">{total} tareas</span></div>{total ? <div className="record-list">
    {pendingApprovals.map((record) => <article key={record.id}><span className="record-icon">☼</span><div><small>Vacaciones · aprobación pendiente</small><strong>{workerName(record.workerRut)}</strong><p>Folio {metadata(record).folio || record.title} · {record.issueDate.split("-").reverse().join("-")} al {record.expiryDate.split("-").reverse().join("-")}</p></div><span className="status-chip status-chip--draft">{record.status}</span><button className="table-action" onClick={() => go("/vacaciones/pendientes", setRoute)}>Revisar solicitud</button></article>)}
    {pendingDocuments.map((record) => <article key={`document-${record.id}`}><span className="record-icon">▤</span><div><small>Vacaciones · documento aprobado pendiente</small><strong>{workerName(record.workerRut)}</strong><p>Folio {metadata(record).folio || record.title} · cargar PDF para habilitar la descarga</p></div><span className="status-chip">Pendiente de documento</span><button className="table-action" onClick={() => go("/vacaciones/documentos-aprobados", setRoute)}>Cargar documento</button></article>)}
    {otherApprovals.map((record) => <article key={`approval-${record.id}`}><span className="record-icon">✓</span><div><small>{record.category} · revisión pendiente</small><strong>{workerName(record.workerRut)}</strong><p>{record.title || record.subtype}</p></div><span className="status-chip status-chip--draft">{record.status}</span><button className="table-action" onClick={() => go(record.category === "Vacaciones" ? "/vacaciones/pendientes" : "/documentos", setRoute)}>Revisar</button></article>)}
    {attendanceBatches.map(([batchId, batch]) => <article key={batchId}><span className="record-icon">◷</span><div><small>Asistencia · revisión pendiente</small><strong>{batch.length} trabajador(es)</strong><p>{batch[0].date.split("-").reverse().join("-")} · {batch[0].costCenter || "Total empresa"}</p></div><span className="status-chip status-chip--draft">En revisión</span><button className="table-action" onClick={() => go(`/asistencia/revision/${encodeURIComponent(batchId)}`, setRoute)}>Revisar asistencia</button></article>)}
    {pendingProcesses.map((process) => <article key={process.id}><span className="record-icon">✓</span><div><small>Nueva contratación</small><strong>{process.personName}</strong><p>{process.stage} · {process.costCenter}</p></div><span className="status-chip">{process.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${process.id}`, setRoute)}>Continuar</button></article>)}
  </div> : <EmptyTable columns={["Tarea", "Trabajador", "Responsable", "Fecha límite", "Prioridad", "Estado", "Acción"]} message="No tienes tareas pendientes." />}</section>;
}

function GenericModule({ route, setRoute, processes }: { route: string; setRoute: (v: string) => void; processes: ProcessRecord[] }) {
  if (route.startsWith("/carpeta-laboral")) return <LaborFolderModule processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/asistencia")) return <AttendanceModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/vacaciones")) return <VacationsModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/documentos")) return <DocumentModule route={route} processes={processes} setRoute={setRoute} />;
  if (route.startsWith("/licencias")) return <MedicalLeaveModule route={route} processes={processes} setRoute={setRoute} />;
  if (route === "/administracion/carga-masiva-de-trabajadores") return <BulkWorkersModule setRoute={setRoute} />;
  if (route === "/administracion/caja-los-andes") return <CajaLosAndesModule setRoute={setRoute} />;
  if (route === "/administracion/usuarios-y-permisos") return <UsersPermissionsModule processes={processes} setRoute={setRoute} />;
  if (route === "/administracion/bases-del-sistema") return <SystemBasesModule setRoute={setRoute} />;
  if (route === "/administracion/maestros-documentos") return <DocumentTemplatesModule setRoute={setRoute} />;
  if (route.startsWith("/administracion/empresas")) return <CompaniesModule route={route} setRoute={setRoute} />;
  if (route.startsWith("/administracion/obras-y-centros-de-costo")) return <WorkSitesModule route={route} setRoute={setRoute} />;
  if (route === "/bandeja") return <WorkInbox processes={processes} setRoute={setRoute} />;

  if (route === "/procesos") return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Todos los flujos</p><h2>Procesos</h2></div><button className="primary-button" onClick={() => go("/procesos/nueva-contratacion", setRoute)}>＋ Nueva contratación</button></div><Toolbar><select><option>Todos los tipos</option><option>Nueva contratación</option><option>Anexo</option><option>Finiquito</option></select></Toolbar>{processes.length ? <div className="record-list">{processes.map((p) => <article key={p.id}><span className="record-icon">↻</span><div><small>{p.id}</small><strong>{p.type} · {p.personName}</strong><p>{p.company} · {p.costCenter} · {p.stage}</p></div><span className="status-chip">{p.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute)}>Abrir</button></article>)}</div> : <EmptyTable columns={["Proceso", "Trabajador", "Solicitante", "Responsable", "Etapa", "Fecha límite", "Estado", "Acciones"]} message="No hay procesos registrados." />}</section>;

  if (route.startsWith("/reportes")) return <ReportsModule route={route} processes={processes} setRoute={setRoute} />;
  if (route === "/auditoria") return <AuditModule />;

  const masters = [["Empresas", "Razón social, RUT, representante y estado.", "/administracion/empresas"],["Carga masiva de trabajadores", "Ingreso y modificación masiva mediante plantilla CSV.", "/administracion/carga-masiva-de-trabajadores"],["Caja Los Andes", "Carga mensual de trabajadores con créditos y seguros informados.", "/administracion/caja-los-andes"],["Obras", "Empresa principal, dirección, región, comuna y estado.", "/administracion/obras-y-centros-de-costo"],["Usuarios y permisos", "Perfil para trabajadores existentes y alcance por obra.", "/administracion/usuarios-y-permisos"],["Bases del sistema", "Cargos, bancos, AFP, salud, feriados y otros valores permitidos.", "/administracion/bases-del-sistema"],["Maestros (Documentos)", "Formatos de contratos, anexos y otros documentos automáticos.", "/administracion/maestros-documentos"]];
  if (route.startsWith("/administracion/")) { const selected = decodeURIComponent(route.split("/").pop() ?? "maestro").replaceAll("-", " "); return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Maestro activo</p><h2>{selected}</h2></div><button className="primary-button" onClick={() => window.alert("Se abrió un nuevo registro del maestro. Completa los datos cuando las empresas y permisos estén configurados.")}>＋ Agregar registro</button></div><Toolbar /><EmptyTable columns={["Nombre", "Descripción", "Estado", "Última modificación", "Acciones"]} message="No existen registros en este maestro." /><footer className="form-footer"><button className="secondary-button" onClick={() => go("/administracion", setRoute)}>← Volver a Administración</button></footer></section>; }
  return <div className="admin-grid">{masters.map(([title, text, path], index) => <article className="panel admin-card" key={title}><span>{["▣","⇧","▤","⌂","○","◇","⚙"][index]}</span><div><h2>{title}</h2><p>{text}</p></div><button className="table-action" onClick={() => go(path, setRoute)}>Administrar →</button></article>)}</div>;
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
