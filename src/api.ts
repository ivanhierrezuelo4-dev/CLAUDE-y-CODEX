import type { State, Provider } from './types';

declare global {
  interface Window {
    __NEXO_PORTABLE_PREVIEW__?: { state: State; providers: Provider[] };
  }
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const portable = window.__NEXO_PORTABLE_PREVIEW__;
  if (portable) {
    if (method !== 'GET')
      throw new Error(
        'Esta vista permite explorar Nexo. El guardado y las consultas a IA están desactivados.',
      );
    if (path === '/state') return structuredClone(portable.state) as T;
    if (path.startsWith('/providers')) return structuredClone(portable.providers) as T;
    if (/^\/projects\/[^/]+\/documents$/.test(path)) return [] as T;
    throw new Error(
      'Esta operación necesita la oficina local. La vista autónoma no se conecta a servidores.',
    );
  }
  const response = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Nexo-Client': 'local' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    let message = 'No se pudo conectar con Nexo. Comprueba que siga abierto.';
    try {
      message = (await response.json()).error || message;
    } catch {
      /* server may be restarting */
    }
    throw new Error(message);
  }
  return response.json();
}
export function download(name: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
