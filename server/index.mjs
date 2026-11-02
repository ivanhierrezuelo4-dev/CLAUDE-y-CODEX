import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openStore, now } from './store.mjs';
import { createApp } from './app.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = resolve(process.env.NEXO_DATA_DIR || resolve(root, '.nexo'));
const db = openStore(resolve(dataDir, 'nexo.sqlite'));
// Live processes do not survive a restart; never pretend that interrupted work completed.
db.prepare(
  "UPDATE tasks SET status='interrupted',error='Nexo se cerró durante esta consulta. Revisa el resultado parcial antes de reintentar.',ended_at=? WHERE status='running'",
).run(now());
const { app, stopAll } = createApp(db, { dataDir, distDir: resolve(root, 'dist') });
const server = app.listen(4317, '127.0.0.1', () =>
  console.log('Nexo está abierto en http://127.0.0.1:4317 · solo en este ordenador'),
);
server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'El puerto 4317 ya está en uso. Comprueba si Nexo ya está abierto.'
      : 'No se pudo iniciar Nexo.',
  );
  db.close();
  process.exitCode = 1;
});
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    stopAll();
    server.close();
    // Allow provider processes to acknowledge cancellation before closing SQLite.
    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 3000).unref();
  });
