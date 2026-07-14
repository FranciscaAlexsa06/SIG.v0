"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  ["/personas", "○", "Personas"],
  ["/asistencia", "◷", "Asistencia"],
  ["/vacaciones", "☼", "Vacaciones"],
  ["/documentos", "▤", "Gestión Documental"],
  ["/procesos", "↻", "Procesos"],
  ["/reportes", "▥", "Reportes"],
  ["/auditoria", "◎", "Auditoría"],
  ["/administracion", "⚙", "Administración"],
] as const;

const routeTitles: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  "/dashboard": { eyebrow: "Control mensual", title: "Dashboard", subtitle: "Indicadores y alertas del período seleccionado." },
  "/bandeja": { eyebrow: "Mi trabajo", title: "Bandeja de trabajo", subtitle: "Tareas asignadas, supervisadas y próximas a vencer." },
  "/personas": { eyebrow: "Gestión de personas", title: "Personas", subtitle: "Expediente único e historial de cada relación laboral." },
  "/asistencia": { eyebrow: "Registro diario", title: "Asistencia", subtitle: "Control por centro de costo, trabajador y período." },
  "/vacaciones": { eyebrow: "Saldos y solicitudes", title: "Vacaciones", subtitle: "Períodos, folios, documentos y aprobaciones." },
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
      <section className="login-hero" aria-label="Presentación del sistema">
        <div className="brand-mark brand-mark--light"><span>SIG</span></div>
        <div className="hero-copy">
          <p className="kicker">Gestión conectada · decisiones claras</p>
          <h1>Sistema Integral<br />de Gestión</h1>
          <p>Personas, documentos, asistencia y procesos en una sola plataforma segura.</p>
        </div>
        <div className="people-scene" aria-hidden="true">
          <div className="scene-glow" />
          <div className="scene-card scene-card--one"><b>✓</b><span>Documentos</span><i /></div>
          <div className="scene-card scene-card--two"><b>▥</b><span>Reportes</span><i /></div>
          <div className="person person--one"><i /><b /><span /></div>
          <div className="person person--two"><i /><b /><span /></div>
          <div className="person person--three"><i /><b /><span /></div>
        </div>
        <p className="hero-footer">Transportes ICT · Plataforma corporativa</p>
      </section>
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
    : routeTitles[route] ?? routeTitles["/dashboard"];
  return (
    <header className="app-header">
      <div><p className="page-eyebrow">{meta.eyebrow}</p><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Notificaciones">♢<span className="notification-dot" /></button>
        <div className="user-menu"><span>{name.slice(0, 1)}</span><div><strong>{name}</strong><small>Product Owner</small></div><button onClick={onLogout}>Salir</button></div>
      </div>
    </header>
  );
}

function Sidebar({ route, setRoute, open, close }: { route: string; setRoute: (v: string) => void; open: boolean; close: () => void }) {
  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar-brand"><div className="brand-mark brand-mark--small"><span>SIG</span></div><div><strong>Sistema Integral</strong><small>de Gestión</small></div><button className="mobile-close" onClick={close}>×</button></div>
      <nav>{navItems.map(([path, icon, label]) => <button key={path} className={route === path || (path === "/procesos" && route.startsWith("/procesos/")) ? "active" : ""} onClick={() => { go(path, setRoute); close(); }}><span>{icon}</span>{label}</button>)}</nav>
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
  const tasks = processes.filter((p) => p.status !== "Finalizado").length;
  const cards = [
    { id: "personas", icon: "○", value: "0", label: "Trabajadores activos", note: "Dotación vigente", tone: "blue" },
    { id: "asistencia", icon: "◷", value: "0%", label: "Asistencia informada", note: "Sin registros del período", tone: "green" },
    { id: "contratos", icon: "▤", value: "0", label: "Contratos por vencer", note: "Próximos 30 días", tone: "amber" },
    { id: "licencias", icon: "+", value: "0", label: "Licencias médicas", note: "Activas en el período", tone: "violet" },
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
      {detail && <DashboardDetail kind={detail} close={() => setDetail(null)} setRoute={setRoute} processes={processes} />}
    </>
  );
}

function DashboardDetail({ kind, close, setRoute, processes }: { kind: string; close: () => void; setRoute: (v: string) => void; processes: ProcessRecord[] }) {
  const config: Record<string, { title: string; description: string; columns: string[]; action: string; path: string }> = {
    personas: { title: "Dotación vigente", description: "Trabajadores activos agrupados por centro de costo.", columns: ["Centro de costo", "Trabajadores", "Empresa", "Estado"], action: "Ir a Personas", path: "/personas" },
    asistencia: { title: "Asistencia informada", description: "Cobertura diaria por centro de costo y responsable.", columns: ["Centro de costo", "Responsable", "Total", "Informados", "Pendientes", "Estado"], action: "Ir al módulo Asistencia", path: "/asistencia?estado=pendiente" },
    contratos: { title: "Contratos por vencer", description: "Contratos y anexos que vencen en los próximos 30 días.", columns: ["Trabajador", "Centro de costo", "Documento", "Vencimiento", "Días", "Estado"], action: "Ir a Gestión Documental", path: "/documentos?filtro=por-vencer" },
    licencias: { title: "Licencias médicas activas", description: "Licencias que se cruzan con el período consultado.", columns: ["Trabajador", "Centro de costo", "Desde", "Hasta", "Días", "Estado"], action: "Ir a Licencias Médicas", path: "/personas?seccion=licencias" },
    finiquitos: { title: "Personas finiquitadas", description: "Procesos de finiquito correspondientes al período.", columns: ["Trabajador", "Centro de costo", "Fecha", "Causal", "Fecha límite", "Estado", "Legalizado", "Pagado"], action: "Ir a Finiquitos", path: "/procesos?tipo=finiquito" },
    tareas: { title: "Tareas pendientes", description: "Acciones que debes realizar o supervisar.", columns: ["Tarea", "Trabajador", "Responsable", "Creación", "Fecha límite", "Estado", "Prioridad", "Acción"], action: "Ir a Bandeja", path: "/bandeja" },
  };
  const item = config[kind];
  return <div className="modal-backdrop" onMouseDown={close}><section className="detail-drawer" onMouseDown={(e) => e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><p className="page-eyebrow">Resumen del período</p><h2>{item.title}</h2><p className="muted">{item.description}</p>{kind === "tareas" && processes.length ? <div className="table-wrap"><table><thead><tr>{item.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{processes.map((p) => <tr key={p.id}><td>Nueva contratación</td><td>{p.personName}</td><td>RRHH</td><td>{new Date(p.createdAt).toLocaleDateString("es-CL")}</td><td>Por definir</td><td><span className="status-chip">{p.status}</span></td><td>Media</td><td><button className="table-action" onClick={() => { close(); go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute); }}>Continuar</button></td></tr>)}</tbody></table></div> : <EmptyTable columns={item.columns} message={emptyMessages[kind] ?? "No hay tareas pendientes."} />}<div className="drawer-footer"><button className="secondary-button" onClick={close}>Cerrar</button><button className="primary-button" onClick={() => { close(); go(item.path, setRoute); }}>{item.action} →</button></div></section></div>;
}

function Toolbar({ children }: { children?: React.ReactNode }) {
  return <div className="toolbar"><div className="search-field"><span>⌕</span><input placeholder="Buscar por nombre, RUT, código o centro de costo" /></div>{children}</div>;
}

function Personas({ setRoute }: { setRoute: (v: string) => void }) {
  return <><div className="section-actions"><Toolbar><select aria-label="Estado"><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select></Toolbar><button className="primary-button" onClick={() => go("/procesos/nueva-contratacion", setRoute)}>＋ Nueva contratación</button></div><section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Expedientes</p><h2>Personas y relaciones laborales</h2></div><span className="count-badge">0 registros</span></div><EmptyTable columns={["Código", "RUT", "Nombre", "Empresa", "Centro de costo", "Cargo", "Ingreso", "Estado", "Acciones"]} message={emptyMessages.personas} /><div className="info-banner"><span>i</span><p><strong>Persona y relación laboral son registros distintos.</strong> Un reingreso recupera los antecedentes personales y crea una nueva relación laboral con código propio.</p></div></section></>;
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

function GenericModule({ route, setRoute, processes }: { route: string; setRoute: (v: string) => void; processes: ProcessRecord[] }) {
  if (route === "/bandeja") return <section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Prioridad y vencimiento</p><h2>Mis tareas</h2></div><span className="count-badge">{processes.length} tareas</span></div>{processes.length ? <div className="record-list">{processes.map((p) => <article key={p.id}><span className="record-icon">✓</span><div><small>Nueva contratación</small><strong>{p.personName}</strong><p>{p.stage} · {p.costCenter}</p></div><span className="status-chip">{p.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute)}>Continuar</button></article>)}</div> : <EmptyTable columns={["Tarea", "Trabajador", "Responsable", "Fecha límite", "Prioridad", "Estado", "Acción"]} message="No tienes tareas pendientes." />}</section>;
  if (route === "/asistencia") return <><div className="tabs"><button className="active">Por obra y día</button><button>Por trabajador y mes</button><button>Resumen mensual</button></div><section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Registro diario</p><h2>Asistencia por centro de costo</h2></div><button className="primary-button">＋ Nuevo registro</button></div><div className="form-grid form-grid--filters"><label>Centro de costo<select><option>Seleccionar centro de costo</option></select></label><label>Fecha<input type="date" defaultValue="2026-07-14" /></label><label>Estado<select><option>Todos los estados</option><option>Informado</option><option>Pendiente</option><option>Observado</option></select></label></div><EmptyTable columns={["Trabajador", "Estado", "Entrada", "Salida", "Horas", "Respaldo", "Acciones"]} message={emptyMessages.asistencia} /></section></>;
  if (route === "/vacaciones") return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Saldo individual</p><h2>Vacaciones</h2></div><button className="primary-button">＋ Crear nueva solicitud</button></div><Toolbar /><div className="summary-strip"><div><small>Saldo total</small><strong>—</strong></div><div><small>Saldo legal</small><strong>—</strong></div><div><small>Saldo progresivo</small><strong>—</strong></div><div><small>Solicitudes pendientes</small><strong>0</strong></div></div><EmptyTable columns={["Folio", "Trabajador", "Desde", "Hasta", "Días", "Período imputado", "Estado", "Documento", "Acciones"]} message="Selecciona un trabajador o crea una solicitud para comenzar." /></section>;
  if (route === "/documentos") return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Repositorio corporativo</p><h2>Documentos</h2></div><button className="primary-button">＋ Agregar documento</button></div><Toolbar><select><option>Todas las categorías</option><option>Laboral</option><option>Personal</option><option>Contrato</option><option>Anexo</option></select><select><option>Todos los estados</option><option>Por vencer</option><option>Pendiente de firma</option></select></Toolbar><EmptyTable columns={["Tipo", "Persona / Proceso", "Emisión", "Vencimiento", "Versión", "Estado", "Archivo", "Acciones"]} message="No existen documentos con los filtros seleccionados." /><div className="info-banner"><span>i</span><p>Los contratos y anexos se generan desde Procesos. En Personas se consultan y descargan los documentos existentes.</p></div></section>;
  if (route === "/procesos") return <section className="panel"><div className="section-actions"><div><p className="page-eyebrow">Todos los flujos</p><h2>Procesos</h2></div><button className="primary-button" onClick={() => go("/procesos/nueva-contratacion", setRoute)}>＋ Nueva contratación</button></div><Toolbar><select><option>Todos los tipos</option><option>Nueva contratación</option><option>Anexo</option><option>Finiquito</option></select></Toolbar>{processes.length ? <div className="record-list">{processes.map((p) => <article key={p.id}><span className="record-icon">↻</span><div><small>{p.id}</small><strong>{p.type} · {p.personName}</strong><p>{p.company} · {p.costCenter} · {p.stage}</p></div><span className="status-chip">{p.status}</span><button className="table-action" onClick={() => go(`/procesos/nueva-contratacion?id=${p.id}`, setRoute)}>Abrir</button></article>)}</div> : <EmptyTable columns={["Proceso", "Trabajador", "Solicitante", "Responsable", "Etapa", "Fecha límite", "Estado", "Acciones"]} message="No hay procesos registrados." />}</section>;
  if (route === "/reportes") return <div className="report-grid">{[["Dotación", "Personas activas, relaciones laborales y centros de costo."],["Asistencia", "Días, horas, inasistencias y porcentaje informado."],["Vacaciones", "Saldos legales, progresivos y períodos utilizados."],["Documental", "Cumplimiento, faltantes, vencidos y firmas."],["Procesos", "Etapas, responsables, demoras y resultados."],["Auditoría", "Usuarios, acciones, valores anteriores y nuevos."]].map(([title, text]) => <article className="panel report-card" key={title}><span>▥</span><h2>{title}</h2><p>{text}</p><div><button className="secondary-button">Vista previa</button><button className="table-action">Exportar</button></div></article>)}</div>;
  if (route === "/auditoria") return <section className="panel"><div className="panel-heading"><div><p className="page-eyebrow">Registro inalterable</p><h2>Eventos de auditoría</h2></div><span className="status-chip status-chip--secure">Solo lectura</span></div><Toolbar /><EmptyTable columns={["Fecha y hora", "Usuario", "Módulo", "Acción", "Registro", "Resultado", "Sesión"]} message="No hay eventos para mostrar en esta instalación inicial." /></section>;
  return <div className="admin-grid">{[["Empresas", "Razón social, RUT, representante y estado."],["Obras y centros de costo", "Empresa, cliente, dirección y responsables."],["Usuarios y permisos", "Perfil, alcance por empresa y centro de costo."],["Cargos y jornadas", "Cargos activos y esquemas de jornada."],["Feriados", "Calendario utilizado en cálculos y reportes."],["Maestros o Bases del Sistema", "Documentos, anexos, contratos, equipos y estados configurables."]].map(([title, text], index) => <article className="panel admin-card" key={title}><span>{["▣","⌂","○","◇","☼","⚙"][index]}</span><div><h2>{title}</h2><p>{text}</p></div><button className="table-action">Administrar →</button></article>)}</div>;
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
  return <div className="app-shell"><Sidebar route={current} setRoute={setRoute} open={mobileNav} close={() => setMobileNav(false)} /><div className="app-main"><button className="mobile-menu" onClick={() => setMobileNav(true)}>☰ <span>Menú</span></button><Header route={current} setRoute={setRoute} name={name} onLogout={() => setName("")} /><main className="content">{current === "/dashboard" ? <Dashboard setRoute={setRoute} processes={processes} /> : current === "/personas" ? <Personas setRoute={setRoute} /> : current.startsWith("/procesos/nueva-contratacion") ? <HiringProcess onSaved={(record) => setProcesses((prev) => [record, ...prev])} /> : <GenericModule route={current} setRoute={setRoute} processes={processes} />}</main></div>{mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Cerrar menú" />}</div>;
}
