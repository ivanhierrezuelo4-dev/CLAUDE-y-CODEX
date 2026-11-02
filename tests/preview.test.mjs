import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';

test('la vista incrustada usa solo memoria temporal y nunca consulta sesiones', async (t) => {
  const db = openStore(':memory:');
  let credentialChecks = 0;
  const { app } = createApp(db, {
    preview: true,
    status: async () => {
      credentialChecks++;
      return [];
    },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  const request = (path, method = 'GET', body) =>
    new Promise((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port: server.address().port,
          path,
          method,
          headers: {
            Host: 'vista-del-entorno.example',
            Origin: 'https://vista-del-entorno.example',
            'Content-Type': 'application/json',
          },
        },
        (res) => {
          let text = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (text += chunk));
          res.on('end', () =>
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(text) }),
          );
        },
      );
      req.on('error', reject);
      req.end(body ? JSON.stringify(body) : undefined);
    });
  const state = await request('/api/state');
  assert.equal(state.status, 200);
  assert.equal(state.body.preview, true);
  assert.equal(state.body.projects.length, 3);
  assert.doesNotMatch(state.headers['content-security-policy'], /frame-ancestors/);
  assert.equal((await request('/api/settings', 'PATCH', { allowCli: true })).status, 403);
  assert.equal(
    (await request('/api/projects', 'POST', { name: 'No se debe guardar' })).status,
    403,
  );
  const providers = await request('/api/providers');
  assert.equal(credentialChecks, 0);
  assert.ok(providers.body.every((p) => !p.authenticated));
  assert.equal((await request('/api/export')).body.documents.length, 0);
});

test('la vista previa rechaza una base de datos persistente', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'nexo-preview-test-'));
  const db = openStore(join(dir, 'private.sqlite'));
  t.after(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  assert.throws(() => createApp(db, { preview: true }), /temporal en memoria/);
});
