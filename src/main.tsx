import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  Folder,
  Gamepad2,
  Layers3,
  LayoutDashboard,
  Loader2,
  Menu,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  Trash2,
  Upload,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { api, download } from './api';
import type { Doc, Packet, Project, Provider, State, Task } from './types';
import './style.css';

const icons: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  layers: Layers3,
  gamepad: Gamepad2,
  folder: Folder,
};
const statuses: Record<string, string> = {
  queued: 'Preparada',
  running: 'Trabajando',
  review: 'Por revisar',
  done: 'Aprobada',
  failed: 'Necesita atención',
  cancelled: 'Detenida',
  interrupted: 'Interrumpida',
};
const format = (n: number) => new Intl.NumberFormat('es').format(n);
const usageLabels: Record<string, string> = {
  input_tokens: 'Entrada',
  output_tokens: 'Respuesta',
  cached_input_tokens: 'Entrada en caché',
  cache_read_input_tokens: 'Lectura en caché',
  cache_creation_input_tokens: 'Guardado en caché',
  total_tokens: 'Total',
};
const time = (date: string) =>
  new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
type View = 'overview' | 'project' | 'memory' | 'tasks';
function ProjectIcon({
  project,
  small = false,
}: {
  project: Pick<Project, 'icon' | 'color'>;
  small?: boolean;
}) {
  const Icon = icons[project.icon] || Folder;
  return (
    <span className={`project-icon ${project.color} ${small ? 'small' : ''}`}>
      <Icon size={small ? 16 : 23} strokeWidth={1.8} />
    </span>
  );
}
function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'wide' : ''}`}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Cerrar ventana" onClick={close}>
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function App() {
  const [state, setState] = useState<State | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [view, setView] = useState<View>('overview');
  const [projectId, setProjectId] = useState('');
  const [modal, setModal] = useState<
    'project' | 'connections' | 'guide' | 'search' | 'edit' | null
  >(null);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [search, setSearch] = useState('');
  const [documentState, setDocumentState] = useState<{ projectId: string; items: Doc[] }>({
    projectId: '',
    items: [],
  });
  const selectedProject = useRef(projectId);
  selectedProject.current = projectId;
  const docs = documentState.projectId === projectId ? documentState.items : [];
  const [readDoc, setReadDoc] = useState<Doc | null>(null);
  const project = state?.projects.find((p) => p.id === projectId);
  const task = state?.tasks.find((t) => t.id === taskId);
  const notify = useCallback((message: string, error = false) => setToast({ message, error }), []);
  const refresh = useCallback(async () => {
    const result = await api<State>('/state');
    setState(result);
    setProjectId((current) => current || result.projects[0]?.id || '');
  }, []);
  const refreshDocs = useCallback(async () => {
    if (projectId) {
      const items = await api<Doc[]>(`/projects/${projectId}/documents`);
      if (selectedProject.current === projectId) setDocumentState({ projectId, items });
    }
  }, [projectId]);
  const act = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
      } catch (e) {
        notify((e as Error).message, true);
      } finally {
        setBusy(false);
      }
    },
    [notify],
  );
  useEffect(() => {
    refresh().catch((e) => notify(e.message, true));
    api<Provider[]>('/providers')
      .then(setProviders)
      .catch((e) => notify(e.message, true));
  }, [refresh, notify]);
  useEffect(() => {
    refreshDocs().catch((e) => notify(e.message, true));
  }, [refreshDocs, notify, state?.projects.find((p) => p.id === projectId)?.document_count]);
  const running = state?.tasks.some((t) => t.status === 'running');
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => refresh().catch((e) => notify(e.message, true)), 1800);
    return () => clearInterval(timer);
  }, [running, refresh, notify]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setModal('search');
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);
  useEffect(() => {
    if (!toast || toast.error) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const navigate = (next: View, id?: string) => {
    setView(next);
    if (id) setProjectId(id);
    setMobileNav(false);
  };
  const openTask = (t: Task) => {
    setProjectId(t.project_id);
    setTaskId(t.id);
  };
  const currentTasks =
    state?.tasks.filter((t) =>
      view === 'overview' || view === 'tasks' ? true : t.project_id === projectId,
    ) || [];
  const active = state?.tasks.filter((t) => t.status === 'running') || [];
  const review = state?.tasks.filter((t) => t.status === 'review') || [];
  const events = (state?.events || []).filter(
    (e) => view === 'overview' || view === 'tasks' || e.project_id === projectId,
  );

  async function importFiles(files: FileList | File[] | null) {
    if (!files || !project) return;
    await act(async () => {
      let imported = 0;
      for (const file of Array.from(files)) {
        if (file.size > 5_000_000) throw new Error(`${file.name}: el límite es 5 MB.`);
        let name = file.name;
        let content: string;
        if (/\.xlsx$/i.test(name)) {
          const { default: readXlsxFile, readSheetNames } = await import('read-excel-file');
          const names = await readSheetNames(file);
          if (names.length > 30)
            throw new Error(
              'Este Excel tiene demasiadas hojas. Importa una copia con un máximo de 30.',
            );
          const sheets: string[] = [];
          for (const sheet of names) {
            const rows = await readXlsxFile(file, { sheet });
            sheets.push(
              `## ${sheet}\n\n` +
                rows
                  .map((row) =>
                    row
                      .map((cell) =>
                        cell instanceof Date ? cell.toISOString() : String(cell ?? ''),
                      )
                      .join(' | '),
                  )
                  .join('\n'),
            );
          }
          content =
            `# ${name}\n\nImportado de Excel: valores guardados de todas las hojas; sin ejecutar fórmulas ni macros.\n\n` +
            sheets.join('\n\n');
          name += '.md';
        } else {
          if (!/\.(md|txt|csv|json)$/i.test(name))
            throw new Error('Elige documentos Markdown, TXT, CSV, JSON o Excel .xlsx.');
          content = await file.text();
        }
        if (!content.trim()) throw new Error(`${name} está vacío.`);
        if (content.length > 200000)
          throw new Error(
            `${name} supera los 200.000 caracteres. Divídelo en documentos más pequeños.`,
          );
        await api(`/projects/${project.id}/documents`, 'POST', { name, content });
        imported++;
      }
      notify(
        `${imported} ${imported === 1 ? 'documento importado' : 'documentos importados'}. No se ha enviado nada a una IA.`,
      );
    });
    await refresh();
    await refreshDocs();
  }

  if (!state)
    return (
      <main className="loading-screen">
        <div className="brand-mark">n</div>
        <h1>Nexo</h1>
        <p>Preparando tu oficina…</p>
        {toast && <p role="alert">{toast.message}</p>}
      </main>
    );

  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <button
          className="brand"
          onClick={() => navigate('overview')}
          aria-label="Nexo, ir al inicio"
        >
          <span className="brand-mark">n</span>
          <span>
            nexo<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="workspace-label">
          <span className="workspace-avatar">I</span>
          <div>
            <strong>Mi oficina</strong>
            <small>Espacio personal</small>
          </div>
          <ShieldCheck size={15} />
        </div>
        <nav aria-label="Navegación principal">
          <button
            className={`nav-item ${view === 'overview' ? 'selected' : ''}`}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={18} />
            Vista general
          </button>
          <button
            className={`nav-item ${view === 'tasks' ? 'selected' : ''}`}
            onClick={() => navigate('tasks')}
          >
            <CheckCheck size={18} />
            Todas las tareas
            {review.length > 0 && <span className="nav-count">{review.length}</span>}
          </button>
          <button
            className={`nav-item ${view === 'memory' ? 'selected' : ''}`}
            onClick={() => navigate('memory')}
          >
            <FileText size={18} />
            Memoria
          </button>
          <div className="nav-section">
            <span>TUS PROYECTOS</span>
            <button
              className="icon-button"
              aria-label="Crear proyecto"
              onClick={() => setModal('project')}
            >
              <Plus size={16} />
            </button>
          </div>
          {state.projects.map((p) => (
            <button
              key={p.id}
              className={`nav-item project-nav ${view === 'project' && projectId === p.id ? 'selected' : ''}`}
              onClick={() => navigate('project', p.id)}
            >
              <ProjectIcon project={p} small />
              <span>{p.name}</span>
              {p.active_count > 0 && <span className="live-dot" />}
            </button>
          ))}
          <button
            disabled={state.preview}
            className="nav-item add-project"
            onClick={() => setModal('project')}
          >
            <Plus size={17} />
            Nuevo proyecto
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <div className="local-note-icon">
              <ShieldCheck size={19} />
            </div>
            <strong>Tu contexto, en casa.</strong>
            <p>Memoria local. Solo viaja lo que eliges enviar.</p>
            <button onClick={() => setModal('guide')}>
              Así funciona Nexo <ArrowRight size={13} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal('connections')}>
            <Settings2 size={18} />
            Conexiones
            <span className="connection-dot" />
          </button>
          <button className="profile" onClick={() => setModal('guide')}>
            <span className="profile-avatar">I</span>
            <span>
              <strong>Tu espacio de trabajo</strong>
              <small>Personal · guardado local</small>
            </span>
            <CircleHelp size={17} />
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegación"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>Mi oficina</span>
            <ChevronRight size={13} />
            <strong>
              {view === 'overview'
                ? 'Vista general'
                : view === 'memory'
                  ? 'Memoria'
                  : view === 'tasks'
                    ? 'Todas las tareas'
                    : project?.name}
            </strong>
          </div>
          <div className="topbar-actions">
            <button
              className="search-button"
              aria-label="Buscar en la oficina"
              onClick={() => setModal('search')}
            >
              <Search size={15} />
              <span>Buscar</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="local-status">
              <span />
              {state.preview ? 'Vista previa' : 'Local'}
            </span>
            <button className="icon-button" aria-label="Ayuda" onClick={() => setModal('guide')}>
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <div className="page-layout">
          <main className="main-content">
            {state.preview && (
              <div className="preview-notice" role="status">
                <ShieldCheck size={17} />
                <p>
                  <strong>Vista de prueba.</strong> Puedes explorar la oficina. El guardado y las
                  consultas a IA están desactivados aquí.
                </p>
              </div>
            )}
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {view === 'overview'
                    ? 'TU ESPACIO PARA CREAR'
                    : view === 'project'
                      ? 'ESPACIO DE PROYECTO'
                      : 'TODO EN SU LUGAR'}
                </div>
                <h1>
                  {view === 'overview'
                    ? 'Las buenas ideas empiezan aquí.'
                    : view === 'memory'
                      ? 'Contexto que se queda.'
                      : view === 'tasks'
                        ? 'Cada paso, a la vista.'
                        : project?.name}
                </h1>
                <p>
                  {view === 'overview'
                    ? 'Tus proyectos, tu equipo y el siguiente paso. Todo conectado.'
                    : view === 'project'
                      ? project?.description
                      : view === 'memory'
                        ? 'Guarda el conocimiento. Envía solo lo que hace falta.'
                        : 'Peticiones preparadas, resultados y decisiones pendientes.'}
                </p>
              </div>
              {view === 'overview' ? (
                <button
                  disabled={state.preview}
                  className="button primary"
                  onClick={() => setModal('project')}
                >
                  <Plus size={17} />
                  Nuevo proyecto
                </button>
              ) : view === 'project' ? (
                <button
                  disabled={state.preview}
                  className="button secondary compact"
                  onClick={() => setModal('edit')}
                >
                  <Settings2 size={16} />
                  Configurar
                </button>
              ) : null}
            </div>

            {view === 'overview' && (
              <>
                <div className="section-title">
                  <h2>
                    Proyectos fijados <span>{state.projects.length}</span>
                  </h2>
                  <span className="subtle">Hechos a tu manera</span>
                </div>
                <div className="project-grid">
                  {state.projects.map((p) => (
                    <button
                      key={p.id}
                      className={`project-card ${p.color}`}
                      onClick={() => navigate('project', p.id)}
                    >
                      <div className="project-card-top">
                        <ProjectIcon project={p} />
                        <ArrowRight size={18} />
                      </div>
                      <h3>{p.name}</h3>
                      <p>{p.description || 'Tu próximo proyecto empieza aquí.'}</p>
                      <div className="project-card-bottom">
                        <span>
                          {p.mode === 'claude'
                            ? 'Claude'
                            : p.mode === 'codex'
                              ? 'Codex'
                              : 'Claude + Codex'}
                        </span>
                        <span className="document-count">
                          <FileText size={12} />
                          {p.document_count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="office-stats">
                  <div>
                    <span className="stat-icon">
                      <Layers3 size={17} />
                    </span>
                    <span>
                      <strong>{state.projects.length}</strong> proyectos
                    </span>
                  </div>
                  <div>
                    <span className="stat-icon">
                      <Zap size={17} />
                    </span>
                    <span>
                      <strong>{active.length}</strong> en marcha
                    </span>
                  </div>
                  <div>
                    <span className="stat-icon">
                      <CheckCheck size={17} />
                    </span>
                    <span>
                      <strong>{review.length}</strong> por revisar
                    </span>
                  </div>
                  <span className="stats-caption">A tu ritmo.</span>
                </div>
              </>
            )}

            {(view === 'overview' || view === 'project') && (
              <Composer
                project={project}
                projects={state.projects}
                selectProject={setProjectId}
                busy={busy || Boolean(state.preview)}
                prepare={async (request, budget, provider) => {
                  if (!project) return;
                  await act(async () => {
                    const t = await api<Task>(`/projects/${project.id}/tasks`, 'POST', {
                      request,
                      budget,
                      provider,
                    });
                    await refresh();
                    setTaskId(t.id);
                  });
                }}
              />
            )}

            {view === 'memory' && (
              <>
                <div className="memory-toolbar">
                  <label>
                    Proyecto
                    <select
                      aria-label="Proyecto de memoria"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    >
                      {state.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button secondary" onClick={() => downloadVault()}>
                    <ArrowDownToLine size={16} />
                    Exportar Markdown
                  </button>
                </div>
                <label
                  className="upload-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void importFiles(e.dataTransfer.files);
                  }}
                >
                  <span className="upload-icon">
                    <Upload size={24} />
                  </span>
                  <h2>Lo que tu proyecto ya sabe.</h2>
                  <p>
                    Arrastra tus documentos o <span>elige archivos</span>.
                  </p>
                  <small>Markdown, TXT, CSV, JSON y Excel .xlsx · hasta 5 MB por archivo</small>
                  <input
                    type="file"
                    multiple
                    accept=".md,.txt,.csv,.json,.xlsx"
                    aria-label="Importar documentos"
                    disabled={busy || state.preview}
                    onChange={(e) => {
                      void importFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
                <div className="memory-hint">
                  <Pin size={17} />
                  <p>
                    <strong>Fija solo lo esencial.</strong> Los documentos fijados se incluyen
                    completos. El resto se busca por relevancia, dentro de este proyecto.
                  </p>
                </div>
                <div className="section-title">
                  <h2>
                    Documentos <span>{docs.length}</span>
                  </h2>
                  <span className="subtle">{busy ? 'Importando…' : 'Sin llamadas a IA'}</span>
                </div>
                <div className="document-list">
                  {docs.length === 0 ? (
                    <Empty
                      icon={FileText}
                      title="Aquí empieza la memoria."
                      text="Importa el resumen que ya preparaste para este proyecto. Tus originales se conservan."
                    />
                  ) : (
                    docs.map((d) => (
                      <div className="document-row" key={d.id}>
                        <FileText size={20} />
                        <button
                          className="document-name"
                          onClick={() =>
                            act(async () => setReadDoc(await api<Doc>(`/documents/${d.id}`)))
                          }
                        >
                          <strong>{d.name}</strong>
                          <small>
                            {format(d.characters)} caracteres ·{' '}
                            {new Date(d.updated_at).toLocaleDateString('es')}
                          </small>
                        </button>
                        <button
                          className={`icon-button ${d.pinned ? 'pinned' : ''}`}
                          aria-label={`${d.pinned ? 'Desfijar' : 'Fijar'} ${d.name}`}
                          onClick={() =>
                            act(async () => {
                              await api(`/documents/${d.id}`, 'PATCH', { pinned: !d.pinned });
                              await refreshDocs();
                            })
                          }
                        >
                          <Pin size={17} />
                        </button>
                        <button
                          className="icon-button danger"
                          aria-label={`Eliminar ${d.name}`}
                          onClick={() => {
                            if (
                              confirm(
                                `¿Quitar ${d.name} de Nexo? Tu archivo original no se elimina.`,
                              )
                            )
                              void act(async () => {
                                await api(`/documents/${d.id}`, 'DELETE');
                                await refreshDocs();
                                await refresh();
                              });
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {view !== 'memory' && (
              <section className="tasks-section">
                <div className="section-title">
                  <h2>
                    {view === 'overview' ? 'Sobre tu mesa' : 'Peticiones y resultados'}{' '}
                    <span>{currentTasks.length}</span>
                  </h2>
                  <button
                    className="text-button"
                    onClick={() => navigate(view === 'overview' ? 'tasks' : 'memory')}
                  >
                    {view === 'overview' ? 'Ver todas' : 'Ver memoria'}
                    <ArrowRight size={14} />
                  </button>
                </div>
                {currentTasks.length ? (
                  <div className="task-list">
                    {currentTasks.slice(0, view === 'tasks' ? 300 : 5).map((t) => (
                      <button key={t.id} className="task-row" onClick={() => openTask(t)}>
                        <span className={`task-status-icon ${t.status}`}>
                          {t.status === 'running' ? (
                            <Loader2 size={17} className="spin" />
                          ) : t.status === 'done' ? (
                            <Check size={17} />
                          ) : (
                            <FileText size={17} />
                          )}
                        </span>
                        <span className="task-info">
                          <strong>{t.title}</strong>
                          <small>
                            {state.projects.find((p) => p.id === t.project_id)?.name} ·{' '}
                            {t.provider === 'claude' ? 'Claude' : 'Codex'}
                          </small>
                        </span>
                        <span className={`status-badge ${t.status}`}>{statuses[t.status]}</span>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={CheckCheck}
                    title="Todo listo para tu primera idea."
                    text="Prepara una petición arriba. Podrás revisar el contexto antes de enviarla."
                  />
                )}
              </section>
            )}
            <footer className="page-footer">
              <span className="mini-n">n</span> Menos ruido. Más espacio para crear.
              <span>Nexo · Primera edición</span>
            </footer>
          </main>

          <aside className="activity-panel" aria-label="Equipo y actividad">
            <div className="section-title">
              <h2>Tu equipo</h2>
              <button
                className="icon-button"
                aria-label="Configurar conexiones"
                onClick={() => setModal('connections')}
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
            <p className="panel-intro">
              Dos formas de pensar.
              <br />
              Un mismo lugar para avanzar.
            </p>
            {['claude', 'codex'].map((name) => {
              const p = providers.find((p) => p.name === name);
              const working = active.find((t) => t.provider === name);
              return (
                <button
                  key={name}
                  className="agent-card"
                  onClick={() => (working ? openTask(working) : setModal('connections'))}
                >
                  <span className={`agent-avatar ${name}`}>
                    {name === 'claude' ? (
                      <Sparkles size={24} strokeWidth={1.4} />
                    ) : (
                      <Terminal size={22} strokeWidth={1.6} />
                    )}
                  </span>
                  <span className="agent-description">
                    <strong>{name === 'claude' ? 'Claude' : 'Codex'}</strong>
                    <small>
                      {name === 'claude' ? 'Dirección y contexto' : 'Desarrollo y otra perspectiva'}
                    </small>
                  </span>
                  <span className={`agent-state ${working ? 'working' : ''}`}>
                    <span />
                    {working
                      ? 'Trabajando'
                      : p?.authenticated
                        ? 'Sesión detectada'
                        : 'Sin conectar'}
                  </span>
                </button>
              );
            })}
            <div className="quiet-note">
              <span className="tiny-dot" />
              <span>
                {active.length
                  ? 'Hay trabajo en curso.'
                  : 'Todo en calma. Tú marcas el siguiente paso.'}
              </span>
            </div>
            <div className="activity-heading">
              <h2>Actividad</h2>
              <Clock3 size={15} />
            </div>
            {events.length ? (
              <div className="event-list">
                {events.slice(0, 7).map((e) => (
                  <button
                    key={e.id}
                    className="event"
                    onClick={() => {
                      const t = state.tasks.find((t) => t.id === e.task_id);
                      if (t) openTask(t);
                      else if (e.project_id) navigate('memory', e.project_id);
                    }}
                  >
                    <span className={`event-dot ${e.type}`} />
                    <div>
                      <p>{e.message}</p>
                      <small>{time(e.created_at)}</small>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="activity-empty">
                <span className="timeline-art">
                  <span />
                  <span />
                  <span />
                </span>
                <p>
                  Cada pequeño avance
                  <br />
                  tendrá su lugar aquí.
                </p>
              </div>
            )}
            <div className="context-note">
              <span className="context-note-icon">
                <Layers3 size={19} />
              </span>
              <h3>Memoria, sin cargarlo todo.</h3>
              <p>Primero buscamos lo relevante. Después eliges qué enviar.</p>
              <button onClick={() => navigate('memory')}>
                Organizar mi contexto <ArrowRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {(modal === 'project' || modal === 'edit') && (
        <Modal
          title={modal === 'edit' ? 'Ajusta tu proyecto' : 'Un espacio para tu próxima idea'}
          close={() => setModal(null)}
        >
          <ProjectForm
            initial={modal === 'edit' ? project : undefined}
            busy={busy || Boolean(state.preview)}
            save={(input) =>
              act(async () => {
                const p = await api<Project>(
                  modal === 'edit' ? `/projects/${projectId}` : '/projects',
                  modal === 'edit' ? 'PATCH' : 'POST',
                  input,
                );
                await refresh();
                navigate('project', p.id);
                setModal(null);
                notify('Proyecto guardado.');
              })
            }
          />
        </Modal>
      )}
      {modal === 'connections' && (
        <Modal title="Tus conexiones" close={() => setModal(null)} wide>
          <p className="modal-intro">
            Nexo funciona en tu ordenador. Detecta las herramientas instaladas y consulta tu sesión
            sin mostrar credenciales.
          </p>
          <div className="connection-list">
            {['claude', 'codex'].map((name) => {
              const p = providers.find((p) => p.name === name);
              return (
                <div className="connection-item" key={name}>
                  <span className={`agent-avatar ${name}`}>
                    {name === 'claude' ? <Sparkles size={24} /> : <Terminal size={23} />}
                  </span>
                  <div>
                    <strong>{name === 'claude' ? 'Claude Code' : 'Codex CLI'}</strong>
                    <p>{p?.message || 'Comprobando…'}</p>
                    <small>
                      {p?.authenticated
                        ? 'Autenticación de suscripción detectada; no garantiza saldo disponible.'
                        : 'La aplicación no necesita estas conexiones para organizar proyectos y memoria.'}
                    </small>
                  </div>
                  <span className={`status-badge ${p?.authenticated ? 'done' : 'queued'}`}>
                    {p?.authenticated ? 'Detectada' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="permission-note">
            <ShieldCheck size={21} />
            <div>
              <strong>Las consultas empiezan cuando tú lo decides.</strong>
              <p>
                Primero preparas una petición, revisas su contexto y pulsas «Consultar». Esta
                versión no edita archivos, no publica y no cambia automáticamente a una API. La
                búsqueda local no consume tokens de IA.
              </p>
            </div>
          </div>
          <label className="toggle-row">
            <div>
              <strong>Permitir consultas desde Nexo</strong>
              <small>
                Cada envío puede consumir el cupo de la sesión detectada. Confirma que tu modalidad
                permite este uso. La conexión de Claude requiere validar sus condiciones antes de
                usarla.
              </small>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={state.settings.allowCli}
              onChange={(e) =>
                act(async () => {
                  await api('/settings', 'PATCH', { allowCli: e.target.checked });
                  await refresh();
                })
              }
            />
          </label>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => {
                download('nexo-para-claude.md', HANDOFF);
                notify('Instrucciones descargadas para Claude Code.');
              }}
            >
              <ArrowDownToLine size={16} />
              Instrucciones para Claude
            </button>
            <button
              className="button primary"
              disabled={busy || state.preview}
              onClick={() =>
                act(async () => {
                  setProviders(await api<Provider[]>('/providers?refresh=1'));
                  notify('Conexiones comprobadas.');
                })
              }
            >
              Volver a comprobar
            </button>
          </div>
        </Modal>
      )}
      {modal === 'guide' && (
        <Modal title="Tu oficina, en tres pasos" close={() => setModal(null)}>
          <div className="guide-steps">
            <div>
              <span>1</span>
              <section>
                <h3>Elige un proyecto</h3>
                <p>
                  Usa uno de los espacios iniciales o crea el tuyo. Puedes elegir Claude, Codex o
                  ambos.
                </p>
              </section>
            </div>
            <div>
              <span>2</span>
              <section>
                <h3>Trae lo que ya sabes</h3>
                <p>
                  Importa los documentos de contexto que ya tienes. La búsqueda es local y cada
                  proyecto conserva su propia memoria.
                </p>
              </section>
            </div>
            <div>
              <span>3</span>
              <section>
                <h3>Revisa antes de enviar</h3>
                <p>
                  Prepara tu petición, mira sus fuentes y consulta cuando conectes tus herramientas.
                  Esta edición cubre planificación y revisión de solo lectura.
                </p>
              </section>
            </div>
          </div>
          <div className="permission-note">
            <Folder size={21} />
            <p>
              Los datos se guardan en la carpeta privada <code>.nexo</code> de este ordenador.
              Clonar el código no copia tus documentos. Exporta un respaldo antes de mudarte.
            </p>
          </div>
          <div className="modal-actions">
            <a
              className="button secondary"
              href={state.preview ? undefined : '/api/export'}
              aria-disabled={state.preview}
              download
            >
              Descargar respaldo
            </a>
            <button
              className="button primary"
              onClick={() => {
                setModal(null);
                navigate('memory');
              }}
            >
              Empezar con mi contexto
              <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === 'search' && (
        <Modal
          title="Encuentra tu siguiente paso"
          close={() => {
            setModal(null);
            setSearch('');
          }}
        >
          <label className="search-field">
            <Search size={19} />
            <input
              autoFocus
              aria-label="Buscar proyectos o peticiones"
              placeholder="Busca proyectos o peticiones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="search-results">
            {state.projects
              .filter((p) => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigate('project', p.id);
                    setModal(null);
                  }}
                >
                  <ProjectIcon project={p} small />
                  <span>
                    {p.name}
                    <small>Proyecto</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            {search &&
              state.tasks
                .filter((t) => t.request.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
                .slice(0, 8)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      openTask(t);
                      setModal(null);
                    }}
                  >
                    <FileText size={17} />
                    <span>
                      {t.title}
                      <small>Petición · {statuses[t.status]}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
          </div>
          <p className="field-hint">
            Búsqueda local en nombres de proyectos y peticiones. No consulta una IA.
          </p>
        </Modal>
      )}
      {task && (
        <Modal title="Detalle de la petición" close={() => setTaskId(null)} wide>
          <div className="task-detail-meta">
            <span className={`status-badge ${task.status}`}>{statuses[task.status]}</span>
            <span>
              {state.projects.find((p) => p.id === task.project_id)?.name} ·{' '}
              {task.provider === 'claude' ? 'Claude' : 'Codex'}
            </span>
            <span>Solo lectura</span>
          </div>
          <h3 className="request-title">{task.request}</h3>
          <button className="context-preview-button" onClick={() => setPacket(task.packet)}>
            <Layers3 size={17} />
            <span>
              <strong>{format(task.packet.estimatedTokens)} tokens estimados</strong>
              <small>
                {task.packet.sources.length} fragmentos seleccionados · revisar contexto exacto
              </small>
            </span>
            <ChevronRight size={17} />
          </button>
          {task.packet.warnings.map((w) => (
            <p className="warning" key={w}>
              {w}
            </p>
          ))}
          {task.error && (
            <p className="error-box" role="alert">
              {task.error}
            </p>
          )}
          {task.output && (
            <div className="result-box">
              <div>
                <strong>Respuesta</strong>
                <button
                  className="icon-button"
                  aria-label="Copiar respuesta"
                  onClick={() =>
                    act(async () => {
                      await navigator.clipboard.writeText(task.output);
                      notify('Respuesta copiada.');
                    })
                  }
                >
                  <Copy size={16} />
                </button>
              </div>
              <pre>{task.output}</pre>
            </div>
          )}
          {task.status === 'running' && (
            <p className="running-label">
              <Loader2 className="spin" size={16} />
              La herramienta está trabajando. No hay una estimación fiable de tiempo restante.
            </p>
          )}
          {task.usage && (
            <p className="field-hint">
              Uso comunicado por la herramienta:{' '}
              {Object.entries(task.usage)
                .filter(([, v]) => typeof v === 'number')
                .map(([k, v]) => `${usageLabels[k] || 'Otro uso comunicado'}: ${format(v)}`)
                .join(' · ')}
              . No equivale al saldo restante.
            </p>
          )}
          <div className="modal-actions wrap">
            <button
              className="button secondary"
              onClick={() =>
                download(
                  `peticion-${task.id.slice(0, 8)}.md`,
                  `# ${task.title}\n\n${task.packet.prompt}\n\n## Resultado\n\n${task.output || 'Pendiente.'}`,
                )
              }
            >
              <ArrowDownToLine size={16} />
              Exportar petición
            </button>
            <div className="action-group">
              {task.status === 'done' && (
                <button
                  className="button secondary"
                  disabled={busy || state.preview}
                  onClick={() =>
                    act(async () => {
                      await api(`/tasks/${task.id}/save-memory`, 'POST');
                      await refresh();
                      await refreshDocs();
                      notify('Resultado aprobado guardado en la memoria del proyecto.');
                    })
                  }
                >
                  <FileText size={15} />
                  Guardar en memoria
                </button>
              )}
              {['review', 'done'].includes(task.status) &&
                state.projects.find((p) => p.id === task.project_id)?.mode === 'team' && (
                  <button
                    className="button secondary"
                    disabled={busy || state.preview}
                    onClick={() =>
                      act(async () => {
                        const next = await api<Task>(`/tasks/${task.id}/second-opinion`, 'POST');
                        await refresh();
                        setTaskId(next.id);
                      })
                    }
                  >
                    <CheckCheck size={15} />
                    Segunda opinión
                  </button>
                )}
              {task.status === 'running' ? (
                <button
                  className="button secondary"
                  disabled={busy || state.preview}
                  onClick={() =>
                    act(async () => {
                      await api(`/tasks/${task.id}/stop`, 'POST');
                      await refresh();
                    })
                  }
                >
                  <Square size={14} />
                  Detener
                </button>
              ) : task.status === 'review' ? (
                <button
                  className="button primary"
                  disabled={busy || state.preview}
                  onClick={() =>
                    act(async () => {
                      await api(`/tasks/${task.id}`, 'PATCH', { status: 'done' });
                      await refresh();
                      notify('Resultado aprobado.');
                    })
                  }
                >
                  <Check size={16} />
                  Aprobar resultado
                </button>
              ) : (
                task.status !== 'done' && (
                  <button
                    className="button primary"
                    disabled={busy || state.preview}
                    onClick={() =>
                      act(async () => {
                        await api(`/tasks/${task.id}/run`, 'POST');
                        await refresh();
                      })
                    }
                  >
                    {busy ? <Loader2 className="spin" size={16} /> : <ArrowUp size={16} />}Consultar
                    a {task.provider === 'claude' ? 'Claude' : 'Codex'}
                  </button>
                )
              )}
            </div>
          </div>
          <p className="field-hint">
            Preparar y exportar es local. Consultar envía este contexto a la herramienta elegida y
            puede consumir su cupo.
          </p>
        </Modal>
      )}
      {packet && (
        <Modal title="Lo que se enviará" close={() => setPacket(null)} wide>
          <div className="context-summary">
            <span>
              <strong>{format(packet.estimatedTokens)}</strong> tokens estimados de entrada
            </span>
            <span>
              <strong>{format(packet.totalContextTokens)}</strong> tokens estimados en la memoria
              del proyecto
            </span>
          </div>
          <p className="field-hint">
            Aproximación de 1 token por 3 caracteres; no es una medición del proveedor ni incluye su
            contexto interno. La selección no garantiza que toda la información necesaria esté
            presente: revísala.
          </p>
          <div className="source-list">
            {packet.sources.map((s, i) => (
              <span key={i}>
                <FileText size={13} />
                {s.name} · {s.position}
              </span>
            ))}
          </div>
          <pre className="prompt-preview">{packet.prompt}</pre>
        </Modal>
      )}
      {readDoc && (
        <Modal title={readDoc.name} close={() => setReadDoc(null)} wide>
          <pre className="prompt-preview">{readDoc.content}</pre>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => download(readDoc.name, readDoc.content || '')}
            >
              <ArrowDownToLine size={16} />
              Descargar documento
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? 'error' : ''}`}
          role={toast.error ? 'alert' : 'status'}
        >
          {toast.error ? <CircleHelp size={18} /> : <Check size={18} />}
          <span>{toast.message}</span>
          <button aria-label="Cerrar aviso" onClick={() => setToast(null)}>
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );

  async function downloadVault() {
    if (!project) return;
    await act(async () => {
      const documents = await Promise.all(docs.map((d) => api<Doc>(`/documents/${d.id}`)));
      if (!documents.length) throw new Error('Importa al menos un documento antes de exportar.');
      const { zipSync, strToU8 } = await import('fflate');
      const entries: Record<string, Uint8Array> = {};
      const folder = project.name.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'Proyecto';
      const used = new Set<string>();
      for (const doc of documents) {
        let name = doc.name.replace(/\.md$/i, '') + '.md';
        if (used.has(name)) name = `${doc.id.slice(0, 8)}-${name}`;
        used.add(name);
        entries[`${folder}/${name}`] = strToU8(doc.content || '');
      }
      const zip = zipSync(entries);
      const blob = new Blob([new Uint8Array(zip).buffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder}-memoria.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Memoria exportada. Descomprime la carpeta y ábrela como bóveda en Obsidian.');
    });
  }
}

function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={22} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Composer({
  project,
  projects,
  selectProject,
  prepare,
  busy,
}: {
  project?: Project;
  projects: Project[];
  selectProject: (id: string) => void;
  prepare: (request: string, budget: number, provider: 'claude' | 'codex') => Promise<void>;
  busy: boolean;
}) {
  const [request, setRequest] = useState('');
  const [budget, setBudget] = useState(6000);
  const [provider, setProvider] = useState<'claude' | 'codex'>('claude');
  useEffect(
    () => setProvider(project?.mode === 'codex' ? 'codex' : 'claude'),
    [project?.id, project?.mode],
  );
  return (
    <section className="composer-section">
      <div className="section-title">
        <h2>¿Qué quieres poner en marcha?</h2>
        <span className="subtle">
          <span className="tiny-dot" /> Tú decides cuándo enviar
        </span>
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (request.trim().length >= 3) void prepare(request.trim(), budget, provider);
        }}
      >
        <label className="sr-only" htmlFor="request">
          Tu petición
        </label>
        <textarea
          id="request"
          placeholder="Una idea, un problema, algo que quieres crear…"
          value={request}
          maxLength={18000}
          onChange={(e) => setRequest(e.target.value)}
        />
        <div className="composer-bottom">
          <div className="composer-selects">
            <label className="select-pill">
              <Folder size={14} />
              <select
                aria-label="Proyecto de la petición"
                value={project?.id || ''}
                onChange={(e) => selectProject(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} />
            </label>
            <label className="select-pill provider-select">
              <Sparkles size={14} />
              <select
                aria-label="Agente de la petición"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'claude' | 'codex')}
              >
                <option value="claude" disabled={project?.mode === 'codex'}>
                  Claude
                </option>
                <option value="codex" disabled={project?.mode === 'claude'}>
                  Codex
                </option>
              </select>
              <ChevronDown size={12} />
            </label>
          </div>
          <button
            className="prepare-button"
            aria-label="Preparar"
            type="submit"
            disabled={request.trim().length < 3 || busy || !project}
          >
            {busy ? <Loader2 size={16} className="spin" /> : <ArrowUp size={17} />}
            <span>Preparar</span>
          </button>
        </div>
      </form>
      <div className="composer-caption">
        <span>
          <ShieldCheck size={12} />
          Nada se envía sin que lo revises.
        </span>
        <label>
          Límite de contexto
          <select
            aria-label="Límite de contexto"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          >
            <option value={3000}>3.000 est.</option>
            <option value={6000}>6.000 est.</option>
            <option value={12000}>12.000 est.</option>
            <option value={24000}>24.000 est.</option>
          </select>
        </label>
      </div>
    </section>
  );
}
function ProjectForm({
  initial,
  save,
  busy,
}: {
  initial?: Project;
  save: (input: Record<string, string>) => void;
  busy: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [color, setColor] = useState(initial?.color || 'blue');
  const [mode, setMode] = useState(initial?.mode || 'team');
  const [folder, setFolder] = useState(initial?.folder || '');
  return (
    <form
      className="project-form"
      onSubmit={(e) => {
        e.preventDefault();
        save({ name, description, color, mode, folder, icon: initial?.icon || 'folder' });
      }}
    >
      <label>
        Nombre del proyecto
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={70}
          placeholder="¿Qué vamos a crear?"
        />
      </label>
      <label>
        Una breve descripción
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={240}
          placeholder="Para qué existe este espacio…"
        />
      </label>
      <fieldset className="color-picker">
        <legend>Un color para reconocerlo</legend>
        {['blue', 'coral', 'violet', 'green', 'amber'].map((c) => (
          <button
            key={c}
            type="button"
            className={`color-swatch ${c} ${color === c ? 'chosen' : ''}`}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            onClick={() => setColor(c)}
          >
            {color === c && <Check size={16} />}
          </button>
        ))}
      </fieldset>
      <label>
        Cómo quieres trabajar
        <select value={mode} onChange={(e) => setMode(e.target.value as Project['mode'])}>
          <option value="team">Claude + Codex</option>
          <option value="claude">Solo Claude</option>
          <option value="codex">Solo Codex</option>
        </select>
      </label>
      <details>
        <summary>Carpeta local (opcional)</summary>
        <p className="field-hint">
          Puedes dejarla vacía e importar contexto. Si la vinculas, la herramienta podrá leer
          archivos de esa carpeta según sus permisos. Vincularla no importa automáticamente sus
          documentos.
        </p>
        <input
          aria-label="Carpeta local"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Ruta de la carpeta en este ordenador"
        />
      </details>
      <div className="modal-actions">
        <button className="button primary" disabled={busy || !name.trim()}>
          {busy ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
          {initial ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </div>
    </form>
  );
}
const HANDOFF = `# Preparar Nexo en mi ordenador\n\nLee primero CLAUDE.md y README.md en el repositorio de Nexo.\n\n1. Comprueba Node.js 24 y npm; instala Node.js LTS 24 con el método oficial si falta.\n2. Usa este checkout; no crees worktrees salvo que yo lo pida.\n3. Ejecuta npm ci, npm run check y npm run doctor.\n4. Abre Nexo con npm start. Conserva .nexo y mis documentos; no los subas a GitHub.\n5. Comprueba Claude Code y Codex usando sus mecanismos oficiales. No copies claves ni archivos de autenticación.\n6. Verifica las condiciones y la modalidad permitida de Claude para una interfaz personal. No cambies a API ni generes cobros sin mi autorización.\n7. Ayúdame a importar los documentos de contexto que ya preparé para mis proyectos. No recorras todo mi disco ni envíes una bóveda entera.\n8. Valida una consulta de solo lectura con mi autorización. Studio, MCP y Buffer ya pueden estar configurados: inspecciona nombres y estado sin revelar secretos. Nexo aún no los controla.\n\nExplícame únicamente los pasos que deba hacer yo, uno por uno y con palabras sencillas.\n`;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
