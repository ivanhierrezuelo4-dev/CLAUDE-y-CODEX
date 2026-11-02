import { providerStatus } from '../server/providers.mjs';
import { DatabaseSync } from 'node:sqlite';
console.log('\nNexo · diagnóstico local (sin llamadas a modelos)\n');
if (Number(process.versions.node.split('.')[0]) !== 24) {
  console.error('Necesitas Node.js 24 LTS. Versión actual:', process.versions.node);
  process.exitCode = 1;
} else console.log('✓ Node.js 24');
try {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE VIRTUAL TABLE test USING fts5(content)');
  db.close();
  console.log('✓ SQLite y búsqueda local disponibles');
} catch {
  console.error('✗ SQLite o FTS5 no disponibles');
  process.exitCode = 1;
}
for (const p of await providerStatus(true))
  console.log(`${p.authenticated ? '✓' : '○'} ${p.name}: ${p.message}`);
console.log('\nLas conexiones pendientes no impiden abrir Nexo ni importar contexto.');
console.log(
  'Una sesión detectada no confirma saldo ni condiciones de uso. No se han leído ni mostrado claves.\n',
);
