import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { openStore } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';

async function fixture(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'nexo-test-'));
  const db = openStore(join(dir, 'test.sqlite'));
  const system = createApp(db, {
    dataDir: dir,
    status: async () => [{ name: 'codex', installed: true, authenticated: true }],
    ...options,
  });
  const server = system.app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    system.stopAll();
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = 'GET', body, headers = {}) {
    const response = await fetch(base + '/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Nexo-Client': 'local', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }
  const state = (await request('/state')).body;
  return { request, db, base, system, project: state.projects.find((p) => p.mode === 'team') };
}
test('crea proyectos persistentes con modos independientes', async (t) => {
  const { request } = await fixture(t);
  const result = await request('/projects', 'POST', {
    name: 'Nuevo negocio',
    mode: 'codex',
    color: 'green',
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.mode, 'codex');
  assert.equal((await request('/state')).body.projects.length, 4);
});
test('rechaza peticiones entre sitios y sin cabecera local', async (t) => {
  const { request, base } = await fixture(t);
  assert.equal(
    (
      await request(
        '/projects',
        'POST',
        { name: 'Ataque' },
        { Origin: 'https://otro-sitio.example' },
      )
    ).status,
    403,
  );
  assert.equal(
    (await request('/projects', 'POST', { name: 'Ataque' }, { 'X-Nexo-Client': '' })).status,
    403,
  );
  const badHostStatus = await new Promise((resolve, reject) => {
    const req = httpRequest(
      base + '/api/state',
      { headers: { Host: 'host-malicioso.example' } },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on('error', reject);
    req.end();
  });
  assert.equal(badHostStatus, 403);
});
test('valida datos y evita rutas maliciosas en documentos', async (t) => {
  const { request, project } = await fixture(t);
  assert.equal((await request('/projects', 'POST', { name: '' })).status, 400);
  assert.equal(
    (
      await request(`/projects/${project.id}/documents`, 'POST', {
        name: '../privado.md',
        content: 'texto',
      })
    ).status,
    400,
  );
  assert.equal(
    (await request(`/projects/${project.id}/context`, 'POST', { request: 'Prueba', budget: -1 }))
      .status,
    400,
  );
});
test('preparar una petición no ejecuta un modelo y respeta el modo Claude', async (t) => {
  let calls = 0;
  const { request, project } = await fixture(t, {
    runner: async () => {
      calls++;
    },
  });
  const task = await request(`/projects/${project.id}/tasks`, 'POST', {
    request: 'Analiza esta idea',
    provider: 'codex',
  });
  assert.equal(task.status, 201);
  assert.equal(task.body.status, 'queued');
  assert.equal(calls, 0);
  assert.equal((await request(`/tasks/${task.body.id}/run`, 'POST')).status, 403);
  const claude = (await request('/state')).body.projects.find((p) => p.mode === 'claude');
  assert.equal(
    (
      await request(`/projects/${claude.id}/tasks`, 'POST', {
        request: 'Analiza esta idea',
        provider: 'codex',
      })
    ).status,
    403,
  );
});
test('ejecuta el adaptador inyectado, registra uso y exige revisión', async (t) => {
  const { request, project } = await fixture(t, {
    runner: async ({ onText, onUsage }) => {
      onText('Resultado de prueba, sin modelo real.');
      onUsage({ input_tokens: 12, output_tokens: 5 });
    },
  });
  await request('/settings', 'PATCH', { allowCli: true });
  const task = (
    await request(`/projects/${project.id}/tasks`, 'POST', {
      request: 'Analiza esta idea',
      provider: 'codex',
    })
  ).body;
  assert.equal((await request(`/tasks/${task.id}/run`, 'POST')).status, 202);
  const result = (await request('/state')).body.tasks.find((x) => x.id === task.id);
  assert.equal(result.status, 'review');
  assert.match(result.output, /sin modelo real/);
  assert.equal(result.usage.input_tokens, 12);
  const review = await request(`/tasks/${task.id}/second-opinion`, 'POST');
  assert.equal(review.status, 201);
  assert.equal(review.body.provider, 'claude');
  assert.equal(review.body.status, 'queued');
  assert.match(review.body.packet.prompt, /Resultado de prueba/);
  assert.equal((await request(`/tasks/${task.id}`, 'PATCH', { status: 'done' })).status, 200);
  assert.equal((await request(`/tasks/${task.id}/save-memory`, 'POST')).status, 201);
  assert.equal((await request(`/tasks/${task.id}/save-memory`, 'POST')).status, 200);
  const memory = (await request(`/projects/${project.id}/documents`)).body;
  assert.equal(memory.length, 1);
  assert.equal((await request(`/tasks/${task.id}/run`, 'POST')).status, 409);
});
test('detecta fuentes cambiadas antes del envío', async (t) => {
  const { request, project } = await fixture(t);
  await request(`/projects/${project.id}/documents`, 'POST', {
    name: 'precios.md',
    content: 'Precio mensual: cien.',
  });
  const task = (
    await request(`/projects/${project.id}/tasks`, 'POST', {
      request: 'Revisa precio mensual',
      provider: 'codex',
    })
  ).body;
  await request(`/projects/${project.id}/documents`, 'POST', {
    name: 'precios.md',
    content: 'Precio mensual: doscientos.',
  });
  await request('/settings', 'PATCH', { allowCli: true });
  const result = await request(`/tasks/${task.id}/run`, 'POST');
  assert.equal(result.status, 409);
  assert.match(result.body.error, /memoria cambió/);
});
test('detecta documentos añadidos después de preparar incluso sin fuentes originales', async (t) => {
  const { request, project } = await fixture(t);
  const task = (
    await request(`/projects/${project.id}/tasks`, 'POST', {
      request: 'Revisa la identidad',
      provider: 'codex',
    })
  ).body;
  await request(`/projects/${project.id}/documents`, 'POST', {
    name: 'identidad.md',
    content: 'La identidad ya tiene una dirección aprobada.',
  });
  await request('/settings', 'PATCH', { allowCli: true });
  assert.equal((await request(`/tasks/${task.id}/run`, 'POST')).status, 409);
});
test('no permite dos ejecuciones simultáneas del mismo proyecto y permite cancelar', async (t) => {
  const { request, project } = await fixture(t, {
    runner: ({ signal }) =>
      new Promise((resolve, reject) => {
        if (signal.aborted) return reject(new Error('Detenido'));
        signal.addEventListener('abort', () => reject(new Error('Detenido')), { once: true });
      }),
  });
  await request('/settings', 'PATCH', { allowCli: true });
  const a = (
    await request(`/projects/${project.id}/tasks`, 'POST', {
      request: 'Primera prueba',
      provider: 'codex',
    })
  ).body;
  const b = (
    await request(`/projects/${project.id}/tasks`, 'POST', {
      request: 'Segunda prueba',
      provider: 'codex',
    })
  ).body;
  const results = await Promise.all([
    request(`/tasks/${a.id}/run`, 'POST'),
    request(`/tasks/${b.id}/run`, 'POST'),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [202, 409]);
  const running = results[0].status === 202 ? a : b;
  assert.equal((await request(`/tasks/${running.id}/stop`, 'POST')).status, 200);
  const state = (await request('/state')).body;
  assert.equal(state.tasks.find((x) => x.id === running.id).status, 'cancelled');
});
test('exporta documentos y resultados sin credenciales ni ajustes de autenticación', async (t) => {
  const { request, project } = await fixture(t);
  await request(`/projects/${project.id}/documents`, 'POST', {
    name: 'marca.md',
    content: 'Identidad aprobada.',
  });
  const result = await request('/export');
  assert.equal(result.status, 200);
  assert.equal(result.body.format, 'nexo-export-v1');
  assert.equal(result.body.documents.length, 1);
  assert.equal(result.body.settings, undefined);
});
