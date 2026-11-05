#!/usr/bin/env node
// Gremio · barra de estado de Claude Code.
// Lee el JSON que Claude Code envía por stdin, muestra una línea corta y guarda el cupo en ~/.gremio/estado.json,
// que leen todos los proyectos y sesiones. No lee credenciales ni hace llamadas de red.
// Configuración en ~/.claude/settings.json:
//   "statusLine": { "type": "command", "command": "node \"<RUTA>/statusline-gremio.cjs\"" }
const fs = require('fs'), path = require('path'), os = require('os');
let raw = '';
process.stdin.on('data', d => raw += d);
process.stdin.on('end', () => {
  let j = {};
  try { j = JSON.parse(raw || '{}'); } catch (_) {}
  const rl = j.rate_limits || {};
  const pct = o => (o && typeof o.used_percentage === 'number') ? Math.round(o.used_percentage) : null;
  const five = pct(rl.five_hour), week = pct(rl.seven_day);
  // Tokens de la sesión si esta versión de Claude Code los expone (los nombres pueden variar: se buscan con cuidado)
  const cw = j.context_window || {};
  const tokIn = cw.total_input_tokens ?? null, tokOut = cw.total_output_tokens ?? null;
  const dir = path.join(os.homedir(), '.gremio');
  let mision = null;
  try { mision = JSON.parse(fs.readFileSync(path.join(dir, 'mision.json'), 'utf8')); } catch (_) {}
  const estado = {
    actualizado: new Date().toISOString(),
    claude: {
      cinco_h: five, semanal: week,
      reinicio_cinco_h: rl.five_hour && rl.five_hour.resets_at || null,
      reinicio_semanal: rl.seven_day && rl.seven_day.resets_at || null,
      modelo: j.model && (j.model.display_name || j.model.id) || null,
      esfuerzo: j.effort && j.effort.level || null,
      sesion: { tokens_entrada: tokIn, tokens_salida: tokOut, coste_usd: j.cost && j.cost.total_cost_usd || null },
      proyecto: j.workspace && j.workspace.current_dir || null
    }
  };
  try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'estado.json'), JSON.stringify(estado, null, 1)); } catch (_) {}
  const warn = (five != null && five >= 95) || (week != null && week >= 97) ? ' · RESERVA' : (five != null && five >= 85) || (week != null && week >= 92) ? ' · preparar relevo' : '';
  const m = mision && mision.id ? ` · ${mision.id} ${mision.estado || ''}` : '';
  process.stdout.write(`5h ${five ?? '—'}% · sem ${week ?? '—'}%${warn}${m}`);
});
