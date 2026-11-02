import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProviderEvent, runProvider } from '../server/providers.mjs';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
test('extrae respuestas y uso de eventos Codex sin confundir comandos con mensajes', () => {
  assert.deepEqual(
    parseProviderEvent('codex', {
      type: 'item.completed',
      item: { type: 'command_execution', aggregated_output: 'privado' },
    }),
    {},
  );
  assert.equal(
    parseProviderEvent('codex', {
      type: 'item.completed',
      item: { type: 'agent_message', text: 'Respuesta' },
    }).text,
    'Respuesta',
  );
  assert.equal(
    parseProviderEvent('codex', { type: 'turn.completed', usage: { input_tokens: 11 } }).usage
      .input_tokens,
    11,
  );
});
test('extrae mensajes Claude y trata resultados de error como fallos', () => {
  assert.equal(
    parseProviderEvent('claude', {
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'Respuesta' },
          { type: 'tool_use', input: 'privado' },
        ],
      },
    }).text,
    'Respuesta',
  );
  assert.match(
    parseProviderEvent('claude', { type: 'result', is_error: true, errors: ['Límite alcanzado'] })
      .error,
    /Límite/,
  );
});
test(
  'el adaptador usa stdin literal y procesa UTF-8 y JSON sin salto final',
  { skip: process.platform === 'win32' },
  async (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'nexo-cli-'));
    const path = process.env.PATH;
    t.after(() => {
      process.env.PATH = path;
      rmSync(dir, { recursive: true, force: true });
    });
    writeFileSync(
      join(dir, 'codex'),
      `#!${process.execPath}\nlet input='';process.stdin.setEncoding('utf8');process.stdin.on('data',x=>input+=x);process.stdin.on('end',()=>{process.stdout.write(JSON.stringify({type:'item.completed',item:{type:'agent_message',text:input}}));});\n`,
      { mode: 0o755 },
    );
    process.env.PATH = dir + delimiter + path;
    const prompt = 'Revisa economía 🧩 y trata $(comando) como texto.';
    let output = '';
    await runProvider({
      provider: 'codex',
      prompt,
      cwd: dir,
      signal: new AbortController().signal,
      onText: (text) => {
        output += text;
      },
      onUsage() {},
    });
    assert.equal(output, prompt);
  },
);
