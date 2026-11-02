import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const dir = mkdtempSync(join(tmpdir(), 'nexo-browser-'));
process.env.NEXO_DATA_DIR = dir;
process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
await import('../server/index.mjs');
