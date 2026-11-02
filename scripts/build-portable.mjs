import { build } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { DEFAULT_PROJECTS } from '../server/store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const projects = DEFAULT_PROJECTS.map((p, index) => ({
  ...p,
  id: `preview-project-${index + 1}`,
  folder: '',
  document_count: 0,
  active_count: 0,
  review_count: 0,
}));
const payload = {
  state: { preview: true, projects, tasks: [], events: [], settings: { allowCli: false } },
  providers: ['claude', 'codex'].map((name) => ({
    name,
    installed: false,
    authenticated: false,
    authType: 'unknown',
    message: 'Vista autónoma · conexiones a IA desactivadas',
  })),
};
const result = await build({
  configFile: resolve(root, 'vite.config.mjs'),
  logLevel: 'warn',
  build: {
    write: false,
    cssCodeSplit: false,
    assetsInlineLimit: Infinity,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
const output = (Array.isArray(result) ? result : [result]).flatMap((result) => result.output);
const htmlAsset = output.find((asset) => asset.fileName === 'index.html');
const script = output.find((asset) => asset.type === 'chunk' && asset.isEntry);
if (!htmlAsset || !script) throw new Error('No se pudo generar la vista autónoma.');
const css = output
  .filter((asset) => asset.type === 'asset' && asset.fileName.endsWith('.css'))
  .map((asset) => String(asset.source))
  .join('\n');
const safe = (text) => text.replace(/</g, '\\u003c');
const escapeHtml = (text) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
// Even a viewer that blocks JavaScript will display an explanatory, styled page.
const fallback = `<main style="max-width:1000px;margin:8vh auto;padding:30px"><p style="font-size:18px;font-weight:700;margin-bottom:35px">nexo.</p><h1>Las buenas ideas empiezan aquí.</h1><p style="margin:18px 0 30px;color:#69758a">Vista autónoma de tu oficina. Sin conexiones a IA ni datos privados.</p><div class="project-grid">${projects.map((p) => `<article class="project-card ${p.color}" style="padding:24px"><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.description)}</p><p>${p.mode === 'claude' ? 'Solo Claude' : 'Claude + Codex'}</p></article>`).join('')}</div><p style="margin-top:30px;color:#69758a;font-size:12px">Si esta vista no permite interactuar, descarga este HTML y ábrelo con tu navegador. No requiere instalación.</p></main>`;
let html = String(htmlAsset.source)
  .replace(/<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g, '')
  .replace(/<link\b[^>]*(?:rel="stylesheet"|rel="modulepreload")[^>]*>/g, '')
  .replace(/^[\t ]+$/gm, '')
  .replace(
    'href="/nexo.svg"',
    `href="data:image/svg+xml;base64,${Buffer.from(readFileSync(resolve(root, 'public/nexo.svg'))).toString('base64')}"`,
  )
  .replace('</head>', () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>\n</head>`)
  .replace('<div id="root"></div>', () => `<div id="root">${fallback}</div>`)
  .replace(
    '</body>',
    () =>
      `<script>window.__NEXO_PORTABLE_PREVIEW__=${safe(JSON.stringify(payload))};</script>\n<script type="module">${script.code.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`,
  );
html =
  '<!-- Generado por npm run build:portable. Editar web/index.html y src/, no este archivo. -->\n' +
  html;
writeFileSync(resolve(root, 'index.html'), html);
writeFileSync(resolve(root, 'Nexo.html'), html);
console.log(
  `Vista autónoma lista: index.html (${Math.ceil(Buffer.byteLength(html) / 1024)} KB). Sin archivos externos ni servidor.`,
);
