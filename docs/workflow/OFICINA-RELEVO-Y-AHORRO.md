# Oficina Claude + Codex: qué construimos, relevo por cupo, ahorro y autoauditoría

**Fecha de consulta:** 2 de noviembre de 2026 · **Plan de Claude:** Pro (confirmado por Iván) · **Codex:** ChatGPT Plus · **Estado:** diseño, nada instalado.

Complementa `EVALUACION-CLAUDE.md`. Artifacts: «Plan Claude + Codex» (actualizado) y «Oficina en píxeles» (workflow nuevo).

---

## 1. Qué estamos construyendo

**No es una aplicación.** Es un **kit portátil de oficina**: unos pocos archivos que se copian en cualquier proyecto (Roblox, Pragmat u otro) y hacen que Claude y Codex trabajen con las mismas reglas.

| Pieza | Qué es | Coste de contexto |
|---|---|---|
| `AGENTS.md` universal | Reglas cortas: quién hace qué, cuándo delegar, contrato de tarea, límites, dónde está la bóveda | Se carga en cada sesión → **debe ser breve** |
| `CLAUDE.md` mínimo | Una línea que importa `AGENTS.md` y añade solo lo exclusivo de Claude | Casi nulo |
| Skill «oficina» | Procedimientos largos: enrutar, contrato, relevo, cierre de memoria | Solo carga su descripción hasta que se usa |
| 2 scripts pequeños | Barra de estado que **guarda el % de cupo** de Claude + hook que **avisa solo al cruzar el umbral** | Cero tokens mientras no hay aviso |
| Bóveda de Obsidian | Tu contexto ordenado por proyecto | Solo se lee lo que se busca |
| Prompt de adaptación | Lo que pegarás en cada proyecto para adaptar el kit (fase siguiente) | Una vez por proyecto |

**Lo que verás tú:** `claude agents` (quién trabaja, quién espera respuesta), la barra con el cupo de Claude, `/codex:status` para Codex y la bóveda en Obsidian. Las «tarjetitas» reales son eso. La tarjeta del Artifact es una maqueta.

## 2. Capacidad y relevo

**Objetivo:** que Claude, el orquestador, conserve siempre una reserva para coordinar (**~5 % de la ventana de 5 h** y **~3 % de la semanal**), y que el trabajo pesado pase a Codex cuando Claude se acerca al límite.

**Por qué la reserva es necesaria:** delegar con el plugin pasa por un subagente de Claude, así que hasta delegar o revisar gasta un poco de Claude. Con un 0 % de cupo, Claude no puede ni delegar ni revisar.

### Umbrales propuestos (ajustables)

| % usado de Claude | Estado | Qué hace |
|---|---|---|
| < 85 % (5 h) y < 92 % (semanal) | **Normal** | Ruta habitual |
| 85–95 % (5 h) o 92–97 % (semanal) | **Preparar traspaso** | Claude escribe el contrato de lo pendiente mientras todavía puede. Termina lo pequeño |
| ≥ 95 % (5 h) o ≥ 97 % (semanal) | **Reserva** | Claude deja de ejecutar. Te ofrece **relevo** o **esperar** |
| Límite alcanzado / Claude no disponible | **Codex directo contigo** | Hablas con Codex. Lee el mismo `AGENTS.md` y la misma bóveda |

**Relevo:** Codex continúa solo lo que ya está especificado. Por defecto con `gpt-6.1-sol`; con `gpt-6-astra` en esfuerzo `medium` si el trabajo es complejo y Codex tiene cupo. Las decisiones nuevas de dirección esperan a Claude o a ti.
**Esperar:** se pausa hasta que se recargue la ventana. Lo lógico en trabajo creativo (Hecho de Nada) o cuando falta una decisión.
**Propuesta por defecto (pendiente de tu confirmación):** **relevo automático** si la tarea tiene contrato y Codex tiene cupo; **preguntar** si falta una decisión o es creativo.

### Cómo funciona técnicamente (confirmado en docs; no implementado)

- La barra de estado recibe `rate_limits.five_hour.used_percentage`, `rate_limits.seven_day.used_percentage` y `resets_at`. **Disponible en Pro**, aparece tras la primera respuesta de la sesión. [docs statusline]
- El script de la barra guarda esas cifras en un archivo pequeño. Un hook `UserPromptSubmit` lo lee y **solo escribe una línea** cuando se cruza un umbral. Lo que imprime ese hook entra como contexto para Claude. [docs hooks]
- El hook `StopFailure` distingue `rate_limit`, útil para registrar cuándo se cortó.
- **Hueco abierto:** Claude Code no ve el cupo de Codex. Opciones: mirar `/status` en Codex (manual) o un lector de `account/rateLimits/read` como el que usa Agent Usage Monitor (por evaluar).
- **Matices:** el % se actualiza por respuesta, y un turno grande puede saltar de 90 a 100. Por eso el traspaso se prepara antes. Las peticiones de subagentes no cuentan en las estadísticas de caché de la barra.

## 3. Herramientas nuevas investigadas

| Herramienta | Qué es de verdad | Evidencia | Decisión |
|---|---|---|---|
| **JEV (TypeSafe)** | Un **modelo de juicio rápido** de pago aparte. Clasifica, filtra, puntúa o verifica muchos elementos en ~250 ms con una probabilidad. **No es un cerebro de estrategia** | Terceros: guías y un gist. API con `TYPESAFE_API_KEY`, ~$0.042/M tokens de entrada según LiteLLM, acceso temprano | **Descartado por ahora.** Exige otra cuenta y cobro por API, que tu regla prohíbe sin decisión expresa. Tu problema de «decidir bien» se resuelve con un protocolo (§5) |
| **Graphify** | Skill de Claude Code que crea un grafo de una carpeta (código, docs, imágenes) e incluso exporta a Obsidian | README: 71,5x en un corpus de 52 archivos; **~1x con 6 archivos**. Un revisor midió un 7–8 % en una sesión real. Usa Claude para extraer docs e imágenes, y eso gasta cupo | **Evaluar más adelante** solo si una carpeta crece mucho. Instalarlo añade una sección a `CLAUDE.md` y un hook |
| **codebase-memory-mcp** | Índice local del **código** (162 lenguajes, **incluye Luau**), sin LLM, MIT; Windows, macOS y Linux | Su benchmark promete ~99 %; un tester real midió **8–10x** en consultas estructurales | **Evaluar en Roblox o Pragmat si el repo es grande.** Su instalación toca la configuración global de Claude **y** de Codex y arranca un daemon: no es «solo un MCP» |
| **RTK** | Proxy que comprime la salida de comandos de terminal | README: 60–90 %. **JetBrains: sin ahorro**, coste mediano +7,6 % con esfuerzo bajo. No cubre Read/Grep/Glob. Licencia Apache-2.0 + BUSL-1.1 | **No recomendado.** Si ya lo tienes, comparar `/usage` con y sin él |
| **Ponytail** | Reglas para que Claude escriba solo el código necesario | Autor: −22 % de tokens. Prueba independiente (MindStudio): **~10 %**. Bug en Windows que puede retrasar cada mensaje. Se inyecta en subagentes | **Evaluar en el piloto** si ya está instalado. Limitar con `PONYTAIL_SUBAGENT_MATCHER`. Repo exacto por confirmar |
| **Caveman** | Respuestas en estilo telegráfico | JetBrains: ~8,5 % de salida frente al 65 % anunciado | **Marginal.** No para trabajo creativo |

Conclusión: **ninguna herramienta de ahorro sustituye a las palancas básicas** del §4. Los porcentajes de los README no se cumplen en trabajo real. Las que añaden reglas o hooks a cada mensaje pueden costar más de lo que ahorran.

## 4. Cómo se ahorra de verdad (por impacto estimado)

1. **Dos depósitos, dos papeles.** Codex tiene su propio cupo. El trabajo de muchos tokens (leer mucho código, ciclos de prueba y corrección, implementación larga) va a Codex. Claude piensa, decide y revisa. Esta es la forma real de aprovechar las dos cuentas.
2. **Modelo según la fase en Claude Pro.** En Pro, el modelo por defecto de Claude Code es Opus 5.5, el más caro de la ventana. Con **`opusplan`** (nativo), Claude usa Opus en modo plan y Sonnet al ejecutar. Haiku para tareas mecánicas.
3. **Sesiones cortas y limpias.** `/clear` entre tareas distintas; `/compact` con instrucciones; no retomar conversaciones viejas enormes. Claude Code ya avisa en Pro cuando retomar una gastaría mucho.
4. **Impuesto fijo pequeño.** Todo lo que se carga en cada mensaje cuesta siempre: `AGENTS.md`/`CLAUDE.md` (menos de 200 líneas), MCP activos, skills, plugins. Revisar con `/context`, `/usage` (atribución por skill/plugin/MCP) y `claude plugin details`.
5. **Recuperación selectiva.** Índice → búsqueda → notas concretas. Nunca la bóveda entera.
6. **Revisión según riesgo.** La revisión adversarial es para lo crítico, no para todo.
7. **Sin bucles.** Máximo 2 correcciones, *review gate* apagado y sin `ultra` ni `max` por costumbre.
8. **Caché.** Mantener modelo y esfuerzo estables dentro de una tarea; cambiarlos fuerza a releer.

## 5. Toma de decisiones sin otra IA

Un **protocolo** en lugar de JEV:

- **Decide Codex:** detalles de implementación dentro del contrato.
- **Decide Claude:** ruta, plan, aceptación, conflictos entre fuentes con evidencia.
- **Decides tú:** dinero, publicación, identidad de marca, economía del juego, cualquier cosa irreversible, o cuando lo pidas.
- **Formato:** pregunta cerrada, 2–3 opciones, impacto de cada una y recomendación.
- **Registro:** `Decisiones.md` del proyecto (fecha, decisión, motivo, quién). Así nadie vuelve a decidir lo mismo.
- **Segunda opinión:** `/codex:adversarial-review` solo cuando el riesgo es alto. Si discrepan, deciden las pruebas o tú.

## 6. Autoauditoría del plan anterior

| Fallo o laguna | Corrección |
|---|---|
| No tuve en cuenta que en **Pro el modelo por defecto es Opus 5.5**: usarlo para todo vacía la ventana | Orquestador con `opusplan`; Opus solo para planificar y decidir |
| No dije que **delegar también gasta Claude** (subagente del plugin) | Reserva del 5 %/3 % y traspaso preparado antes del límite |
| El simulador enviaba bastante trabajo a «Claude coordina» | Se refuerza «Codex directo» cuando hay contrato. Coordinar solo con ambigüedad, riesgo o dependencias |
| Revisión adversarial de Codex en muchos casos de riesgo medio | Solo riesgo alto/crítico; medio → revisión dirigida corta |
| Propuse `medium` para Sol sin evidencia | Es una **hipótesis**: el piloto compara `low` (por defecto) con `medium` |
| Faltaba el caso «Claude no está y hablo con Codex» | Añadido: `AGENTS.md` común + bóveda común + `codex resume` / `/codex:transfer` |
| No había medición del «impuesto fijo» de contexto | Añadido: `/context`, `/usage` por atribución, `claude plugin details` |
| Los artifacts no ahorran tokens | Son para entender y decidir; no se incluyen en el contexto de trabajo |
| Sigue sin resolverse ver el cupo de Codex desde Claude | Hueco declarado; opción manual o lector por evaluar |

**Ángulo nuevo:** lo que más ahorra no es comprimir texto, sino **no hacer trabajo dos veces**. Eso se logra con contratos claros, decisiones registradas, memoria con estado y fecha, y pruebas que digan «terminado» sin otra revisión.

## 7. Preguntas pendientes

1. ¿Tienes ya instalados Ponytail, RTK u otro «ahorrador»? Si es así, ¿en Claude, en Codex o en ambos?
2. Relevo al llegar a la reserva: ¿te vale «automático si hay contrato, preguntar si falta una decisión o es creativo»?
3. ¿Ya tienes Obsidian instalado y una carpeta elegida para la bóveda?

## Fuentes

- Claude Code docs: [statusline](https://code.claude.com/docs/en/statusline), [hooks](https://code.claude.com/docs/en/hooks), [costs](https://code.claude.com/docs/en/costs), [model-config / opusplan](https://code.claude.com/docs/en/model-config)
- JEV: [Flavio Copes](https://flaviocopes.com/jev/), [MindStudio](https://www.mindstudio.ai/blog/how-to-build-jev-browser-agent), [gist pedramamini](https://gist.github.com/pedramamini/014676fa8684d91bf7000f4623701ada), [LiteLLM](https://docs.litellm.ai/blog/typesafe_jev), [rnascimento](https://rnascimento.com/building-a-more-reliable-ai-development-workflow-with-claude-code-superpowers-and-jev/), [gripo](https://gripo.io/blog/use-jev-ai-with-claude-code-and-codex)
- Graphify: [README](https://github.com/safishamsi/graphify), [revisión mejba.me](https://www.mejba.me/blog/graphify-knowledge-graph-codebase-claude-code)
- codebase-memory-mcp: [README](https://github.com/DeusData/codebase-memory-mcp), [revisión dev.to](https://dev.to/andrew-ooo/codebase-memory-mcp-review-99-fewer-tokens-for-ai-agents-4789)
- RTK: [README](https://github.com/rtk-ai/rtk), [JetBrains](https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/), [resumen Magica](https://magica.com/news/jetbrains-tests-caveman-and-rtk-token-claims)
- Caveman: [JetBrains](https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/), [InfoWorld](https://www.infoworld.com/article/4193775/talk-like-a-caveman-prompts-save-tokens-but-far-less-than-promised.html)
- Ponytail: [MindStudio](https://www.mindstudio.ai/blog/claude-token-saving-plugins-tested/), [MindStudio 2](https://www.mindstudio.ai/blog/ponytail-ai-coding-minimalism-plugin), [comparativa](https://pasqualepillitteri.it/en/news/7881/caveman-rtk-pxpipe-headroom-claude-code-tokens)
