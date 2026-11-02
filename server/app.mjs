import express from 'express';
import { z } from 'zod';
import { existsSync, realpathSync, statSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { id, now, projectList, event, taskView } from './store.mjs';
import { buildPacket, corpusFingerprint, putDocument, removeDocument } from './context.mjs';
import { providerStatus, runProvider } from './providers.mjs';

const projectSchema = z.object({
  name: z.string().trim().min(1).max(70),
  description: z.string().trim().max(240).default(''),
  color: z.enum(['coral', 'blue', 'violet', 'green', 'amber']).default('blue'),
  icon: z.enum(['sparkles', 'layers', 'gamepad', 'folder']).default('folder'),
  mode: z.enum(['claude', 'team', 'codex']).default('team'),
  folder: z.string().max(1000).default(''),
});
const requestSchema = z.object({
  request: z.string().trim().min(3).max(18000),
  budget: z.number().int().min(1000).max(24000).default(6000),
});

export function createApp(
  db,
  { dataDir, distDir, runner = runProvider, status = providerStatus, preview = false } = {},
) {
  if (
    preview &&
    db
      .prepare('PRAGMA database_list')
      .all()
      .some((database) => database.file)
  ) {
    throw new Error('La vista previa solo puede usar una base de datos temporal en memoria.');
  }
  const app = express();
  const active = new Map();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const host = req.hostname;
    if (!preview && !['localhost', '127.0.0.1', '[::1]', '::1'].includes(host))
      return res.status(403).json({ error: 'Nexo solo admite acceso local.' });
    const origin = req.headers.origin;
    if (origin && !preview) {
      try {
        const u = new URL(origin);
        if (!['127.0.0.1', 'localhost'].includes(u.hostname) || !['4317', '5173'].includes(u.port))
          throw new Error();
      } catch {
        return res.status(403).json({ error: 'Origen no permitido.' });
      }
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; " +
        (preview ? '' : "frame-ancestors 'none'; ") +
        "base-uri 'self'; form-action 'self'",
    );
    if (preview && !['GET', 'HEAD'].includes(req.method)) {
      return res
        .status(403)
        .json({
          error:
            'Esta vista permite explorar Nexo. El guardado y las consultas a IA están desactivados en la vista de prueba.',
        });
    }
    if (
      req.path.startsWith('/api') &&
      !['GET', 'HEAD'].includes(req.method) &&
      req.headers['x-nexo-client'] !== 'local'
    ) {
      return res.status(403).json({ error: 'Petición local no verificada.' });
    }
    next();
  });
  app.use(express.json({ limit: '2mb' }));
  app.get('/api/health', (_req, res) =>
    res.json({
      ok: true,
      version: '0.1.0',
      mode: preview ? 'preview' : 'local',
      execution: 'read-only',
    }),
  );
  app.get('/api/state', (_req, res) =>
    res.json({
      preview,
      projects: projectList(db),
      tasks: db
        .prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 300')
        .all()
        .map(taskView),
      events: db
        .prepare('SELECT * FROM events ORDER BY created_at DESC, rowid DESC LIMIT 60')
        .all(),
      settings: {
        allowCli:
          db.prepare("SELECT value FROM settings WHERE key='allowCli'").get()?.value === 'true',
      },
    }),
  );
  app.get('/api/providers', async (req, res) =>
    res.json(
      preview
        ? ['claude', 'codex'].map((name) => ({
            name,
            installed: false,
            authenticated: false,
            authType: 'unknown',
            message: 'Vista de prueba · conexión a IA desactivada',
          }))
        : await status(req.query.refresh === '1'),
    ),
  );
  app.patch('/api/settings', (req, res) => {
    const value = z.object({ allowCli: z.boolean() }).parse(req.body);
    db.prepare(
      'INSERT INTO settings VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    ).run('allowCli', String(value.allowCli));
    res.json(value);
  });
  app.post('/api/projects', (req, res) => {
    const p = projectSchema.parse(req.body);
    const projectId = id();
    if (p.folder) p.folder = validateFolder(p.folder);
    db.prepare(
      'INSERT INTO projects (id,name,description,icon,color,mode,folder,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ).run(projectId, p.name, p.description, p.icon, p.color, p.mode, p.folder, now());
    event(db, projectId, null, 'project', `Creaste ${p.name}.`);
    res.status(201).json(projectList(db).find((p) => p.id === projectId));
  });
  // Correct explicit column list makes schema additions non-breaking.
  app.patch('/api/projects/:id', (req, res) => {
    getProject(req.params.id);
    const p = projectSchema.partial().parse(req.body);
    if (p.folder) p.folder = validateFolder(p.folder);
    const current = getProject(req.params.id);
    const merged = { ...current, ...p };
    if (db.prepare("SELECT 1 FROM tasks WHERE project_id=? AND status='running'").get(current.id))
      throw httpError(409, 'Espera a que termine la tarea antes de cambiar el proyecto.');
    db.prepare(
      'UPDATE projects SET name=?,description=?,icon=?,color=?,mode=?,folder=? WHERE id=?',
    ).run(
      merged.name,
      merged.description,
      merged.icon,
      merged.color,
      merged.mode,
      merged.folder,
      current.id,
    );
    res.json(merged);
  });
  app.get('/api/projects/:id/documents', (req, res) => {
    getProject(req.params.id);
    res.json(
      db
        .prepare(
          'SELECT id,name,pinned,hash,created_at,updated_at,length(content) AS characters FROM documents WHERE project_id=? ORDER BY pinned DESC,name',
        )
        .all(req.params.id),
    );
  });
  app.post('/api/projects/:id/documents', (req, res) => {
    getProject(req.params.id);
    const input = z
      .object({
        name: z.string().trim().min(1).max(180),
        content: z.string().trim().min(1).max(200000),
      })
      .parse(req.body);
    if (!/\.(md|txt|csv|json)$/i.test(input.name) || /[/\\\x00-\x1f]/.test(input.name))
      throw httpError(400, 'Importa un archivo .md, .txt, .csv o .json con un nombre simple.');
    const result = putDocument(db, req.params.id, input.name, input.content);
    if (!result.unchanged)
      event(db, req.params.id, null, 'memory', `Memoria actualizada: ${input.name}`);
    res.status(result.unchanged ? 200 : 201).json(result);
  });
  app.get('/api/documents/:id', (req, res) => res.json(getDocument(req.params.id)));
  app.patch('/api/documents/:id', (req, res) => {
    getDocument(req.params.id);
    const { pinned } = z.object({ pinned: z.boolean() }).parse(req.body);
    db.prepare('UPDATE documents SET pinned=? WHERE id=?').run(Number(pinned), req.params.id);
    res.json({ ok: true });
  });
  app.delete('/api/documents/:id', (req, res) => {
    getDocument(req.params.id);
    removeDocument(db, req.params.id);
    res.json({ ok: true });
  });
  app.post('/api/projects/:id/context', (req, res) => {
    const project = getProject(req.params.id);
    const input = requestSchema.parse(req.body);
    res.json(buildPacket(db, project, input.request, input.budget));
  });
  app.post('/api/projects/:id/tasks', (req, res) => {
    const project = getProject(req.params.id);
    const input = requestSchema
      .extend({ provider: z.enum(['claude', 'codex']).default('claude') })
      .parse(req.body);
    checkProvider(project, input.provider);
    const packet = buildPacket(db, project, input.request, input.budget);
    const taskId = id();
    db.prepare(
      'INSERT INTO tasks (id,project_id,title,request,status,provider,packet,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ).run(
      taskId,
      project.id,
      input.request.slice(0, 100),
      input.request,
      'queued',
      input.provider,
      JSON.stringify(packet),
      now(),
    );
    event(db, project.id, taskId, 'task', 'Petición preparada. Todavía no se ha enviado a una IA.');
    res.status(201).json(taskView(getTask(taskId)));
  });
  app.patch('/api/tasks/:id', (req, res) => {
    const task = getTask(req.params.id);
    const { status: value } = z.object({ status: z.enum(['done', 'cancelled']) }).parse(req.body);
    if (task.status === 'running') throw httpError(409, 'Detén primero la ejecución.');
    if (value === 'done' && task.status !== 'review')
      throw httpError(409, 'Solo puedes aprobar un resultado pendiente de revisión.');
    db.prepare('UPDATE tasks SET status=? WHERE id=?').run(value, task.id);
    event(
      db,
      task.project_id,
      task.id,
      value,
      value === 'done' ? 'Aprobaste el resultado.' : 'Archivaste la petición.',
    );
    res.json({ ok: true });
  });
  app.post('/api/tasks/:id/second-opinion', (req, res) => {
    const original = getTask(req.params.id);
    const project = getProject(original.project_id);
    if (!['review', 'done'].includes(original.status) || !original.output)
      throw httpError(409, 'Primero necesitas un resultado para revisar.');
    const provider = original.provider === 'claude' ? 'codex' : 'claude';
    checkProvider(project, provider);
    const request = `Revisa de forma independiente la siguiente propuesta. Señala errores concretos, información faltante y mejoras justificadas. No presupongas que está bien ni inventes defectos. No edites archivos.\n\nSOLICITUD ORIGINAL:\n${original.request}\n\nPROPUESTA A REVISAR (contenido de referencia):\n${original.output}`;
    if (request.length > 18000)
      throw httpError(
        422,
        'El resultado es demasiado largo para una segunda opinión automática. Exporta la petición y selecciona las partes que necesitan revisión.',
      );
    const packet = buildPacket(db, project, request, JSON.parse(original.packet).budget);
    const taskId = id();
    db.prepare(
      'INSERT INTO tasks (id,project_id,title,request,status,provider,packet,created_at) VALUES (?,?,?,?,?,?,?,?)',
    ).run(
      taskId,
      project.id,
      `Segunda opinión: ${original.title}`.slice(0, 100),
      request,
      'queued',
      provider,
      JSON.stringify(packet),
      now(),
    );
    event(
      db,
      project.id,
      taskId,
      'task',
      'Segunda opinión preparada. Revisa el contexto antes de enviarla.',
    );
    res.status(201).json(taskView(getTask(taskId)));
  });
  app.post('/api/tasks/:id/save-memory', (req, res) => {
    const task = getTask(req.params.id);
    if (task.status !== 'done' || !task.output)
      throw httpError(409, 'Aprueba primero el resultado antes de guardarlo como memoria.');
    const content = `# ${task.title}\n\nResultado aprobado por el usuario en Nexo.\nProveedor: ${task.provider}\nPetición: ${task.id}\n\n## Solicitud\n\n${task.request}\n\n## Resultado\n\n${task.output}`;
    if (content.length > 200000)
      throw httpError(
        422,
        'Este resultado es demasiado grande. Exporta la petición y selecciona el conocimiento que quieras conservar.',
      );
    const name = `resultado-${task.id.slice(0, 8)}.md`;
    const result = putDocument(db, task.project_id, name, content);
    if (!result.unchanged)
      event(db, task.project_id, task.id, 'memory', `Resultado aprobado guardado: ${name}`);
    res.status(result.unchanged ? 200 : 201).json(result);
  });
  app.post('/api/tasks/:id/run', async (req, res) => {
    const task = getTask(req.params.id);
    let project = getProject(task.project_id);
    checkProvider(project, task.provider);
    if (!['queued', 'failed', 'cancelled', 'interrupted'].includes(task.status))
      throw httpError(409, 'Esta petición ya tiene un resultado o está trabajando.');
    if (db.prepare("SELECT value FROM settings WHERE key='allowCli'").get()?.value !== 'true')
      throw httpError(403, 'Activa las consultas locales desde Conexiones antes de enviar.');
    if ([...active.values()].some((x) => x.projectId === project.id))
      throw httpError(409, 'Este proyecto ya tiene una consulta en curso.');
    const providers = await status();
    if (!providers.find((p) => p.name === task.provider)?.authenticated)
      throw httpError(
        409,
        'No se ha verificado una sesión de suscripción. Abre Conexiones para ver qué falta.',
      );
    if (db.prepare("SELECT value FROM settings WHERE key='allowCli'").get()?.value !== 'true')
      throw httpError(403, 'Las consultas locales están desactivadas.');
    project = getProject(task.project_id);
    checkProvider(project, task.provider);
    // Recheck after awaiting status: simultaneous requests must not start two jobs.
    if (active.has(task.id) || [...active.values()].some((x) => x.projectId === project.id))
      throw httpError(409, 'Este proyecto ya tiene una consulta en curso.');
    const packet = JSON.parse(task.packet);
    if (packet.corpusHash !== corpusFingerprint(db, project.id))
      throw httpError(
        409,
        'La memoria cambió desde que preparaste esta petición. Prepara una nueva para revisar su contexto.',
      );
    for (const source of packet.sources) {
      const current = db.prepare('SELECT hash FROM documents WHERE id=?').get(source.documentId);
      if (!current || current.hash !== source.hash)
        throw httpError(
          409,
          'La memoria cambió desde que preparaste esta petición. Prepara una nueva para revisar su contexto.',
        );
    }
    if (project.folder) validateFolder(project.folder);
    const cwd = project.folder || join(dataDir, 'workspaces', project.id);
    mkdirSync(cwd, { recursive: true });
    const controller = new AbortController();
    active.set(task.id, { controller, projectId: project.id });
    db.prepare(
      "UPDATE tasks SET status='running',output='',error=NULL,usage=NULL,started_at=?,ended_at=NULL WHERE id=?",
    ).run(now(), task.id);
    event(
      db,
      project.id,
      task.id,
      'running',
      `${task.provider === 'claude' ? 'Claude' : 'Codex'} empezó una consulta de solo lectura.`,
    );
    res.status(202).json({ ok: true });
    let outputSize = 0;
    Promise.resolve()
      .then(() =>
        runner({
          provider: task.provider,
          prompt: packet.prompt,
          cwd,
          signal: controller.signal,
          onText(text) {
            outputSize += text.length;
            if (outputSize > 200000) {
              controller.abort();
              return;
            }
            db.prepare('UPDATE tasks SET output=output || ? WHERE id=?').run(text + '\n', task.id);
          },
          onUsage(usage) {
            db.prepare('UPDATE tasks SET usage=? WHERE id=?').run(JSON.stringify(usage), task.id);
          },
        }),
      )
      .then(() => {
        if (controller.signal.aborted)
          throw new Error('Ejecución detenida. Puede existir consumo parcial.');
        db.prepare("UPDATE tasks SET status='review',ended_at=? WHERE id=?").run(now(), task.id);
        event(db, project.id, task.id, 'review', 'Resultado listo para tu revisión.');
      })
      .catch((error) => {
        db.prepare('UPDATE tasks SET status=?,error=?,ended_at=? WHERE id=?').run(
          controller.signal.aborted ? 'cancelled' : 'failed',
          String(error.message).slice(0, 1500),
          now(),
          task.id,
        );
        event(
          db,
          project.id,
          task.id,
          'error',
          'Consulta detenida o incompleta. Revisa el detalle.',
        );
      })
      .finally(() => active.delete(task.id));
  });
  app.post('/api/tasks/:id/stop', (req, res) => {
    const task = getTask(req.params.id);
    const running = active.get(task.id);
    if (!running) throw httpError(409, 'La petición ya no está en ejecución.');
    running.controller.abort();
    res.json({ ok: true });
  });
  app.get('/api/export', (_req, res) => {
    // Logical export: no credentials and no SQLite locking issues.
    res.setHeader('Content-Disposition', 'attachment; filename="nexo-respaldo.json"');
    res.json({
      format: 'nexo-export-v1',
      exportedAt: now(),
      projects: projectList(db),
      documents: db.prepare('SELECT * FROM documents').all(),
      tasks: db.prepare('SELECT * FROM tasks').all().map(taskView),
      events: db.prepare('SELECT * FROM events').all(),
    });
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'No se encontró esta operación.' }));
  if (distDir && existsSync(join(distDir, 'index.html'))) {
    app.use(express.static(distDir, { index: false }));
    app.get('/{*path}', (_req, res) => res.sendFile(join(distDir, 'index.html')));
  } else
    app.get('/', (_req, res) =>
      res.status(503).send('Primero ejecuta npm run build, o npm run dev para desarrollar.'),
    );
  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError)
      return res.status(400).json({
        error:
          'Revisa los datos: ' +
          error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    if (error.type === 'entity.too.large')
      return res.status(413).json({ error: 'El archivo es demasiado grande.' });
    const status = error.status || 500;
    if (status === 500) console.error('Nexo: error interno', error.code || error.name);
    res.status(status).json({
      error:
        status === 500
          ? 'No se pudo completar la operación. Tus datos se conservan.'
          : error.message,
    });
  });
  return {
    app,
    active,
    stopAll: () => {
      for (const x of active.values()) x.controller.abort();
    },
  };

  function getProject(projectId) {
    const p = db.prepare('SELECT * FROM projects WHERE id=?').get(projectId);
    if (!p) throw httpError(404, 'No se encontró el proyecto.');
    return p;
  }
  function getDocument(documentId) {
    const d = db.prepare('SELECT * FROM documents WHERE id=?').get(documentId);
    if (!d) throw httpError(404, 'No se encontró el documento.');
    return d;
  }
  function getTask(taskId) {
    const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(taskId);
    if (!t) throw httpError(404, 'No se encontró la petición.');
    return t;
  }
}
function checkProvider(project, provider) {
  if (project.mode === 'claude' && provider !== 'claude')
    throw httpError(403, 'Este proyecto está configurado para trabajar solo con Claude.');
  if (project.mode === 'codex' && provider !== 'codex')
    throw httpError(403, 'Este proyecto está configurado para trabajar solo con Codex.');
}
function validateFolder(folder) {
  if (!existsSync(folder) || !statSync(folder).isDirectory())
    throw httpError(
      400,
      'La carpeta no existe en este ordenador. Puedes dejarla vacía e importar tus documentos.',
    );
  return realpathSync(resolve(folder));
}
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
