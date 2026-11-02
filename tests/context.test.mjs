import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../server/store.mjs';
import {
  buildPacket,
  estimateTokens,
  putDocument,
  removeDocument,
  splitDocument,
} from '../server/context.mjs';

function fixture(t) {
  const db = openStore(':memory:');
  t.after(() => db.close());
  return { db, projects: db.prepare('SELECT * FROM projects ORDER BY rowid').all() };
}
test('selecciona contexto relevante y no mezcla proyectos', (t) => {
  const {
    db,
    projects: [a, b],
  } = fixture(t);
  putDocument(
    db,
    a.id,
    'identidad.md',
    'Nuestra identidad visual utiliza estrellas y una paleta naranja.',
  );
  putDocument(db, a.id, 'precios.md', 'La tarifa de mantenimiento mensual es de cien unidades.');
  putDocument(db, b.id, 'secreto-cliente.md', 'Identidad de otro cliente: INFORMACION_AJENA_123');
  const packet = buildPacket(db, a, 'Revisa nuestra identidad visual');
  assert.match(packet.prompt, /paleta naranja/);
  assert.doesNotMatch(packet.prompt, /INFORMACION_AJENA|cien unidades/);
  assert.equal(packet.sources.length, 1);
});
test('preserva tildes en el texto y las encuentra en consultas normalizadas', (t) => {
  const {
    db,
    projects: [p],
  } = fixture(t);
  putDocument(db, p.id, 'economia.md', 'La economía de animación se evalúa después del guion.');
  const packet = buildPacket(db, p, 'Revisa economia y animacion');
  assert.match(packet.prompt, /economía/);
  assert.equal(packet.sources.length, 1);
});
test('no envía la bóveda completa y respeta el límite estimado', (t) => {
  const {
    db,
    projects: [p],
  } = fixture(t);
  putDocument(db, p.id, 'larga.md', 'Animación estilo. '.repeat(3000));
  const packet = buildPacket(db, p, 'Analiza animación', 1000);
  assert.ok(packet.estimatedTokens <= 1000);
  assert.ok(packet.selectedContextTokens < packet.totalContextTokens);
  assert.ok(packet.warnings.some((w) => w.includes('fuera del presupuesto')));
});
test('los documentos fijados se incluyen sin necesitar coincidencia', (t) => {
  const {
    db,
    projects: [p],
  } = fixture(t);
  const d = putDocument(db, p.id, 'reglas.md', 'No cambiar los precios aprobados.');
  db.prepare('UPDATE documents SET pinned=1 WHERE id=?').run(d.id);
  assert.match(buildPacket(db, p, 'Crea un diseño').prompt, /No cambiar los precios/);
});
test('bloquea contexto fijado excesivo en lugar de truncarlo', (t) => {
  const {
    db,
    projects: [p],
  } = fixture(t);
  const d = putDocument(db, p.id, 'reglas.md', 'Importante. '.repeat(2000));
  db.prepare('UPDATE documents SET pinned=1 WHERE id=?').run(d.id);
  assert.throws(() => buildPacket(db, p, 'Analiza esto', 1000), /no los recortará/);
});
test('reimportar es idempotente y actualizar limpia el índice anterior', (t) => {
  const {
    db,
    projects: [p],
  } = fixture(t);
  const first = putDocument(db, p.id, 'marca.md', 'El nombre anterior era Abracadabra.');
  assert.equal(
    putDocument(db, p.id, 'marca.md', 'El nombre anterior era Abracadabra.').unchanged,
    true,
  );
  const second = putDocument(db, p.id, 'marca.md', 'El nombre nuevo es Galaxia.');
  assert.equal(first.id, second.id);
  assert.equal(buildPacket(db, p, 'Busca Abracadabra').sources.length, 0);
  assert.equal(buildPacket(db, p, 'Busca Galaxia').sources.length, 1);
  removeDocument(db, first.id);
  assert.equal(db.prepare('SELECT count(*) n FROM chunk_search').get().n, 0);
});
test('fragmenta sin perder contenido aunque haya párrafos largos', () => {
  const text = '0123456789'.repeat(1000);
  const chunks = splitDocument(text);
  assert.ok(chunks.length > 1);
  assert.equal(chunks[0].length, 1600);
  assert.equal(chunks[1].slice(0, 160), chunks[0].slice(-160));
  assert.ok(estimateTokens(chunks[0]) > 0);
});
