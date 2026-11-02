import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { openStore } from './store.mjs';
import { createApp } from './app.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const distDir = resolve(root, 'dist');
if (!existsSync(resolve(distDir, 'index.html'))) {
  console.error('Primero ejecuta npm run build para preparar la vista de Nexo.');
  process.exit(1);
}
// Deliberately separate from .nexo: this server never opens personal data or CLI sessions.
const db = openStore(':memory:');
const { app } = createApp(db, { distDir, preview: true });
const server = app.listen(3000, '0.0.0.0', () =>
  console.log(
    'Nexo · vista de prueba lista en el puerto 3000. Sin sesiones de IA ni datos privados.',
  ),
);
server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'El puerto 3000 ya está ocupado.'
      : 'No se pudo iniciar la vista de prueba.',
  );
  db.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
