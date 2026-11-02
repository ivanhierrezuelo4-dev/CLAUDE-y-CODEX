import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export const DEFAULT_PROJECTS = [
  {
    name: 'Hecho de Nada',
    description: 'Historias que nacen del código.',
    icon: 'sparkles',
    color: 'coral',
    mode: 'claude',
  },
  {
    name: 'Pragmat',
    description: 'Ideas que se convierten en productos.',
    icon: 'layers',
    color: 'blue',
    mode: 'team',
  },
  {
    name: 'Estudio Roblox',
    description: 'Un lugar para crear nuevos mundos.',
    icon: 'gamepad',
    color: 'violet',
    mode: 'team',
  },
];

export function openStore(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
      icon TEXT NOT NULL, color TEXT NOT NULL, mode TEXT NOT NULL,
      folder TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL, content TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0,
      hash TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(project_id, name)
    );
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL, position INTEGER NOT NULL, content TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS chunk_search USING fts5(
      chunk_id UNINDEXED, project_id UNINDEXED, content, tokenize='unicode61 remove_diacritics 2'
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL, request TEXT NOT NULL, status TEXT NOT NULL,
      provider TEXT NOT NULL, packet TEXT, output TEXT NOT NULL DEFAULT '',
      error TEXT, usage TEXT, started_at TEXT, ended_at TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      task_id TEXT, type TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  if (!db.prepare("SELECT 1 FROM settings WHERE key='initialized'").get()) {
    const insert = db.prepare(
      'INSERT INTO projects (id,name,description,icon,color,mode,created_at) VALUES (?,?,?,?,?,?,?)',
    );
    for (const p of DEFAULT_PROJECTS)
      insert.run(id(), p.name, p.description, p.icon, p.color, p.mode, now());
    db.prepare('INSERT INTO settings VALUES (?,?)').run('initialized', 'true');
  }
  return db;
}

export function event(db, projectId, taskId, type, message) {
  db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?)').run(
    id(),
    projectId,
    taskId,
    type,
    message,
    now(),
  );
}

export function projectList(db) {
  return db
    .prepare(
      `SELECT p.*,
    (SELECT count(*) FROM documents d WHERE d.project_id=p.id) AS document_count,
    (SELECT count(*) FROM tasks t WHERE t.project_id=p.id AND t.status IN ('running','queued')) AS active_count,
    (SELECT count(*) FROM tasks t WHERE t.project_id=p.id AND t.status='review') AS review_count
    FROM projects p ORDER BY p.created_at, p.rowid`,
    )
    .all();
}

export function taskView(t) {
  return {
    ...t,
    packet: t.packet ? JSON.parse(t.packet) : null,
    usage: t.usage ? JSON.parse(t.usage) : null,
  };
}
