import { spawn } from 'node:child_process';
import { accessSync, constants, existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';

// No shell: prompts, paths and document text are never interpolated into commands.
export function findCli(name) {
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    const executable = join(dir, process.platform === 'win32' ? `${name}.exe` : name);
    try {
      accessSync(executable, constants.X_OK);
      return { command: executable, prefix: [] };
    } catch {
      /* next directory */
    }
    if (process.platform === 'win32' && name === 'codex') {
      const script = join(dir, 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
      if (existsSync(script)) return { command: process.execPath, prefix: [script] };
    }
  }
  return null;
}

function capture(cli, args, timeout = 7000) {
  return new Promise((resolve) => {
    let text = '';
    let settled = false;
    const finish = (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ code, text });
      }
    };
    const child = spawn(cli.command, [...cli.prefix, ...args], {
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => {
      text = (text + chunk).slice(-16000);
    });
    child.stderr.on('data', (chunk) => {
      text = (text + chunk).slice(-16000);
    });
    const timer = setTimeout(() => {
      child.kill();
      finish(-1);
    }, timeout);
    child.on('error', () => finish(-1));
    child.on('close', finish);
  });
}

let cached;
let cachedAt = 0;
export async function providerStatus(refresh = false) {
  if (!refresh && cached && Date.now() - cachedAt < 20000) return cached;
  const result = await Promise.all(
    ['claude', 'codex'].map(async (name) => {
      const cli = findCli(name);
      if (!cli)
        return {
          name,
          installed: false,
          authenticated: false,
          authType: 'unknown',
          message: 'Pendiente de instalar en tu ordenador',
        };
      const auth = await capture(
        cli,
        name === 'codex' ? ['login', 'status'] : ['auth', 'status', '--json'],
      );
      let subscription = false;
      if (name === 'codex')
        subscription = auth.code === 0 && /logged in using chatgpt/i.test(auth.text);
      else {
        try {
          const data = JSON.parse(auth.text);
          subscription =
            auth.code === 0 &&
            data.loggedIn === true &&
            /claude\.ai|oauth/i.test(data.authMethod || '');
        } catch {
          /* Older CLI: unknown is not authenticated. */
        }
      }
      const apiConfigured =
        name === 'codex'
          ? Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL)
          : Boolean(
              process.env.ANTHROPIC_API_KEY ||
              process.env.ANTHROPIC_AUTH_TOKEN ||
              process.env.ANTHROPIC_BASE_URL ||
              process.env.CLAUDE_CODE_USE_BEDROCK ||
              process.env.CLAUDE_CODE_USE_VERTEX ||
              process.env.CLAUDE_CODE_USE_FOUNDRY,
            );
      if (apiConfigured)
        return {
          name,
          installed: true,
          authenticated: false,
          authType: 'api-configured',
          message:
            'Hay una configuración de API o proveedor externo. Nexo no la utilizará automáticamente.',
        };
      return {
        name,
        installed: true,
        authenticated: subscription,
        authType: subscription ? 'subscription' : 'unknown',
        message: subscription
          ? 'Sesión de suscripción detectada · ejecución bajo tu control'
          : 'Instalado · sesión de suscripción sin verificar',
      };
    }),
  );
  cached = result;
  cachedAt = Date.now();
  return result;
}

export function parseProviderEvent(provider, data) {
  if (provider === 'codex') {
    if (data.type === 'item.completed' && data.item?.type === 'agent_message')
      return { text: data.item.text || '' };
    if (data.type === 'turn.completed') return { usage: data.usage || null };
    if (data.type === 'turn.failed' || data.type === 'error')
      return { error: data.error?.message || data.message || 'La ejecución de Codex falló.' };
  } else {
    if (data.type === 'assistant')
      return {
        text: (data.message?.content || [])
          .filter((x) => x.type === 'text')
          .map((x) => x.text)
          .join('\n'),
      };
    if (data.type === 'result')
      return {
        final: typeof data.result === 'string' ? data.result : '',
        usage: data.usage || null,
        error: data.is_error
          ? (data.errors || ['Claude no completó la petición.']).join('\n')
          : undefined,
      };
  }
  return {};
}

export function runProvider({ provider, prompt, cwd, signal, onText, onUsage }) {
  return new Promise((resolve, reject) => {
    const cli = findCli(provider);
    if (!cli)
      return reject(
        new Error(`${provider === 'claude' ? 'Claude Code' : 'Codex'} no está instalado.`),
      );
    const args =
      provider === 'codex'
        ? [
            'exec',
            '--json',
            '--sandbox',
            'read-only',
            '--skip-git-repo-check',
            '--ephemeral',
            '--ignore-user-config',
            '-c',
            'model_provider="openai"',
            '-c',
            'approval_policy="never"',
            '-',
          ]
        : [
            '--print',
            '--output-format',
            'stream-json',
            '--verbose',
            '--permission-mode',
            'plan',
            '--tools',
            '',
            '--strict-mcp-config',
            '--mcp-config',
            '{"mcpServers":{}}',
            '--max-turns',
            '1',
          ];
    const child = spawn(cli.command, [...cli.prefix, ...args], {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let buffer = '';
    let failure;
    let sawText = false;
    let settled = false;
    let hardStop;
    const cancel = () => {
      child.kill('SIGTERM');
      hardStop = setTimeout(() => child.kill('SIGKILL'), 2000);
      hardStop.unref();
    };
    const timeout = setTimeout(cancel, 180000);
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearTimeout(hardStop);
      signal?.removeEventListener('abort', cancel);
      if (error) reject(error);
      else resolve();
    };
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    function consume(line) {
      let event;
      try {
        event = parseProviderEvent(provider, JSON.parse(line));
      } catch {
        return;
      }
      if (event.text) {
        sawText = true;
        onText(event.text);
      }
      if (event.final && !sawText) {
        sawText = true;
        onText(event.final);
      }
      if (event.usage) onUsage(event.usage);
      if (event.error) failure = event.error;
    }
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      buffer += data;
      if (buffer.length > 2_000_000) {
        failure = 'La respuesta excedió el límite local.';
        cancel();
        return;
      }
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) consume(line);
    });
    // Do not expose raw stderr: CLI diagnostics can contain local authentication information.
    child.stderr.resume();
    child.stdin.on('error', () => {});
    child.on('error', () =>
      finish(new Error('No se pudo iniciar la herramienta local. Ejecuta npm run doctor.')),
    );
    child.on('close', (code) => {
      if (buffer.trim()) consume(buffer);
      finish(
        signal?.aborted
          ? new Error('Ejecución detenida por ti.')
          : failure
            ? new Error(failure)
            : code !== 0
              ? new Error(
                  `La herramienta terminó con código ${code ?? 'desconocido'}. Revisa su sesión desde la terminal; Nexo no ha cambiado a una API.`,
                )
              : !sawText
                ? new Error(
                    'La herramienta no devolvió una respuesta. Revisa su sesión y sus límites.',
                  )
                : undefined,
      );
    });
    child.stdin.end(prompt);
  });
}
