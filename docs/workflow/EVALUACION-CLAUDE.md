# Evaluación independiente: Claude + Codex + Obsidian

**Para:** Iván · **Fecha de consulta de fuentes:** 2 de noviembre de 2026 · **Estado:** investigación y plan. No se instaló nada, no se conectó ninguna cuenta y no se hizo ninguna consulta real a modelos.

Documento interactivo complementario: `docs/workflow/plan-interactivo.html`, que se abre con doble clic y no necesita servidor. También está publicado como Artifact privado.

---

## 1. Veredicto

**Merece la pena probarlo, con un alcance pequeño. No merece la pena construir una aplicación ni un mod ahora.**

| | Decisión |
|---|---|
| **Recomendado** | Claude Code + plugin oficial `codex@openai-codex` + seguimiento nativo: `claude agents`, `/codex:status`, `/usage` y `/status` de Codex. Memoria: una bóveda de Obsidian usada como **carpeta Markdown**, con un `AGENTS.md` breve que leen las dos herramientas. |
| **Opcional, si falta algo** | Una barra de estado de Claude para ver la cuota de 5 h/7 días y el esfuerzo: la nativa o `ccstatusline`. Un informe semanal con `ccusage`. Para una ventana que siga visible al cambiar de aplicación: una terminal con `claude agents` fijada con PowerToys *Always On Top*. |
| **Evaluar más adelante** | `barracodev/agent-usage-monitor`, si quieres ver las dos cuotas en un widget y la prueba lo justifica. CLI de Obsidian y `kepano/obsidian-skills` cuando la búsqueda por archivos se quede corta. |
| **Descartado por ahora** | Mod propio, Nexo ampliado, Vibe Kanban (en cierre), Claude Squad (tmux + API key de Codex), CC Switch (resuelve otro problema), trackers que leen credenciales o cookies, base vectorial/MCP de memoria. |

Hay tres hallazgos que cambian el plan respecto a la investigación previa:

1. **Claude Code puede leer `AGENTS.md`**, y Codex lo usa por defecto. Las reglas comunes pueden vivir en un solo archivo, sin duplicarlas. [F7]
2. **Los ejemplos de modelos del README del plugin están desfasados.** `gpt-5.4-mini` y `spark` no aparecen en el catálogo actual. Hay que usar IDs del catálogo o dejar que Codex elija. [F1, F4]
3. **Faltaba Claude Fable 5.1** (`claude-fable-5-1`) en el análisis previo. Según el changelog, en algunos planes requiere *usage credits* y tiene un límite semanal propio. Por eso **nunca debe elegirse automáticamente**. [F2]

---

## 2. Qué se comprobó y cómo

| Fuente | Acceso desde este entorno |
|---|---|
| Repositorios de GitHub, en bruto (OpenAI, Anthropic, Obsidian, proyectos comunitarios) | Leídos |
| `code.claude.com/docs` (agent view, statusline, memory, costs, plugins) | Leídos |
| `developers.openai.com`, `help.openai.com`, `openai.com`, `obsidian.md` | **Bloqueados por la política de red.** No se eludió el bloqueo. |
| API de GitHub (fechas de commits, releases) | No disponible para repos ajenos en esta sesión |
| Búsqueda web | Inglés, español y japonés (artículos independientes, no traducciones del README) |

Etiquetas usadas: **Confirmado** (lo dice la fuente oficial o el código), **Declarado** (lo afirma un mantenedor o un tercero, sin auditoría), **Corregido**, **No demostrado**, **Depende del entorno** (requiere prueba en tu PC).

Supuesto: **tu PC es Windows**, no confirmado. El plan sirve igual; cambian los pasos de instalación y la compatibilidad de algunos monitores.

---

## 3. Auditoría de afirmaciones previas

| Afirmación previa | Resultado | Evidencia | Efecto sobre el plan |
|---|---|---|---|
| Existe el plugin oficial `openai/codex-plugin-cc` | **Confirmado** | README, `package.json` v1.0.6, licencia Apache-2.0, Node ≥ 18.18 [F1] | Base recomendada |
| Ofrece review, adversarial-review, rescue, transfer, status, result, cancel | **Confirmado** | README [F1] | No construir otro puente |
| Envuelve Codex app-server y usa la CLI y la autenticación locales | **Confirmado** | README, «Codex Integration» y FAQ [F1] | El uso cuenta contra tu cupo de ChatGPT |
| Ejemplos `--model gpt-5.4-mini` y `spark` | **Corregido** | No figuran en `models.json` actual (12 entradas) [F4] | Usar IDs del catálogo o los valores por defecto de Codex |
| Sol, Terra, Astra y Luna existen | **Confirmado** en el catálogo; `available_in_plans` incluye `plus` | `models.json` [F4] | Acceso real de tu cuenta: **pendiente** (`/model` en Codex) |
| Versión mínima de Codex para esos modelos | **Nuevo**: 0.153.0 (Sol, Terra, Astra) y 0.155.0 (Luna) | `minimal_client_version` [F4] | Comprobar con `codex --version` |
| Esfuerzos low…max; `ultra` = delegación automática; Luna sin `ultra` | **Confirmado** | `supported_reasoning_levels` [F4] | No usar `ultra` como ajuste habitual |
| Valores por defecto distintos | **Confirmado**: Sol, Terra y Astra `low`; Luna `medium`; Terra con contexto de 500 k frente a 272 k | [F4] | Sin `--effort`, Sol arranca en bajo. Medir antes de fijar otro nivel |
| Opus, Sonnet y Haiku 5.5 existen | **Confirmado** (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`) | Changelog [F2] | Acceso en tu plan: **pendiente** (`/model`) |
| (omitido) Fable 5.1 | **Corregido**: existe `claude-fable-5-1`; puede pedir *usage credits* y tiene límite semanal | Changelog [F2] | Solo manual, nunca por defecto |
| Agent view desde 2.1.139 | **Confirmado**, en *research preview*. Cada sesión gasta cupo por separado; las sesiones son locales | Changelog y doc oficial [F2, F5] | Primera herramienta de seguimiento |
| Los trabajos de Codex aparecen en agent view | **No demostrado** | La doc solo describe sesiones de Claude Code [F5] | Usar `/codex:status` para Codex |
| La barra de estado puede mostrar cuota y esfuerzo | **Confirmado**: `rate_limits.five_hour/seven_day` (Pro/Max) y `effort.level` | Doc statusline [F6] | Barra de Claude sin programas de terceros |
| Desde Claude Code no se ve la cuota de Codex | **Declarado** en un issue del plugin | Búsqueda [W3] | Mirar `/status` en Codex o un monitor que use `account/rateLimits/read` |
| Mods: acceso temprano, la API puede cambiar | **Confirmado** | `mods/README.md` [F3] | No construir un mod ahora |
| Delegar siempre ahorra tokens | **No demostrado** | Ninguna fuente lo mide | El piloto lo decide |
| Saldos de Claude y Codex sumables | **Incorrecto** | Cupos y condiciones separados [F1, F5] | No mostrar un «saldo total» |
| Obsidian CLI: instalador 1.12, recomendado 1.12.7+, la app debe estar abierta | **Confirmado** | Ayuda oficial [F8] | Nivel 2, no imprescindible |
| La bóveda es una carpeta Markdown y refleja cambios externos | **Confirmado** | Ayuda oficial [F8] | Nivel 1 basta para empezar |
| `obsidian-skills` sirve para Claude Code y Codex | **Declarado** por el mantenedor | README [F9] | Opcional, no es memoria automática |
| Vibe Kanban está cerrando | **Confirmado**: «Vibe Kanban is sunsetting» | README [F12] | Descartado |
| Codex + Claude Usage Tracker lee credenciales | **Confirmado**: token OAuth de `.credentials.json` y, como opción, cookies web | README [F13] | Descartado |
| HarnessMonitor en Windows requiere WSL2 | **Confirmado**: su agente corre dentro de WSL | README [F14] | Solo sirve si trabajas en WSL. **Depende del entorno** |
| Agent Usage Monitor: widget Windows, sin credenciales | **Declarado**; v0.1.0, MIT, Electron 44, Windows 10/11 y Node 22+; se compila con `npm run dist` | README y `package.json` [F15] | No confirmé un instalador publicado. Candidato a auditar, no a instalar a ciegas |
| Codex en Windows es experimental | **Depende del entorno**: hay instalador oficial de PowerShell; un plugin comunitario aún recomienda WSL | README de Codex [F4b], búsqueda [W3] | Probar `/codex:setup` en tu PC |
| Límites de Codex en ChatGPT Plus | **Pendiente**: la página oficial está bloqueada. Terceros describen una ventana de 5 h, un límite semanal y créditos | [W1] | Verlo en tu cuenta (`/status` de Codex) |
| Claude Code admite `AGENTS.md` | **Confirmado** (lo carga si no hay `CLAUDE.md`, o junto a él con la opción correspondiente) | Doc memory [F7], mod `agents-md` [F3] | Una sola fuente de reglas compartidas |
| `claude plugin details` muestra el coste en tokens por sesión de un plugin | **Confirmado** (2.1.139) | Changelog [F2] | Medir cuánto contexto añade el plugin |

---

## 4. Comparativa en el orden pedido

1. **Funciones nativas.** `claude agents` (sesiones en curso, bloqueadas y terminadas), `/usage`, la barra de estado con cuota y esfuerzo, `/effort`, `/model`, subagentes y `AGENTS.md`. En Codex: `/status`, `/model` y `config.toml`. **Cubren la mayor parte.**
2. **Plugin oficial.** Delegar, revisar, trabajos en segundo plano, retomar en Codex. **Cubre el puente.** No da memoria compartida ni un panel unificado.
3. **Configuración pequeña.** `AGENTS.md` breve por proyecto, `.codex/config.toml` solo si el piloto lo justifica, plantilla de traspaso y una bóveda con índice por proyecto.
4. **Herramienta existente compatible.** `ccstatusline` (barra de Claude, documentación para Windows, MIT); `ccusage` (informes locales de Claude y Codex, opción `--no-cost`); Agent Usage Monitor (widget de las dos cuotas, por auditar); PowerToys *Always On Top* para fijar una ventana.
5. **Mod propio.** Solo si tras el piloto falta un dato concreto que ninguna de las anteriores dé. Especificación mínima en el §9.

---

## 5. Flujo de trabajo

### Entradas

| Ruta | Cuándo | Cuándo NO |
|---|---|---|
| **Claude solo** | Trabajo creativo con flujo aprobado (Hecho de Nada), tareas breves donde delegar cuesta más que hacerlo | Bloques de implementación largos y bien definidos que Codex puede comprobar solo |
| **Codex directo** | Objetivo, contexto, herramientas y comprobación claros, aunque el trabajo sea grande | Dirección creativa, requisitos ambiguos o decisiones de negocio |
| **Claude coordina** | Ambigüedad, varias piezas dependientes, riesgo alto, decisiones | Tareas simples: la coordinación añade lecturas, traspasos y revisiones sin aportar calidad |
| **Proyecto nuevo** | Ficha mínima (objetivo, fuentes, herramientas, modo preferido) y luego la primera tarea | Montar taxonomía e infraestructura antes de la primera tarea |

El selector manual siempre gana sobre la sugerencia.

### Ciclo

petición → recuperación de contexto (índice → búsqueda → notas) → aclaración solo si cambia el resultado → plan o ruta directa → trabajo → comprobaciones del proyecto → revisión proporcional al riesgo → decisión basada en evidencias → entrega (hecho / probado / pendiente) → propuesta de memoria → tú apruebas qué se conserva.

### Contrato de una tarea delegada

```
Objetivo:            qué debe existir al terminar
Fuentes:             notas y archivos concretos (rutas), con fecha/estado
Alcance permitido:   carpetas/archivos que puede tocar; qué NO tocar
Dependencias:        qué debe estar hecho antes
Aceptación:          comprobaciones que deben pasar (comando, prueba, revisión visual)
Entregable:          cambios + resumen
Detente si:          falta un dato, hay contradicción, haría falta una decisión de Iván
Respuesta:           Hecho · Probado (con salida) · Fallido · Pendiente
```

Límites: **una revisión adicional y hasta dos intentos de corrección**. Si siguen fallando las pruebas, se replantea la causa y no se repite el mismo intento. Si dos modelos discrepan, deciden las pruebas o tu decisión, nunca una votación. El *review gate* del plugin queda desactivado salvo sesiones vigiladas, porque su README advierte que puede agotar límites. [F1]

### Ramas de fallo

| Situación | Qué pasa |
|---|---|
| Contexto insuficiente | Se amplía la búsqueda una vez; si sigue faltando, pregunta concreta a Iván |
| Documentos contradictorios | Se muestran ambas versiones y su fecha/estado; no se elige en silencio |
| Herramienta no disponible (Studio MCP, Buffer, Codex) | Se informa del bloqueo concreto; no se simula. Se continúa la parte independiente |
| Cupo de Claude agotado | Codex puede seguir **tareas ya especificadas con contrato**; las decisiones nuevas quedan en espera |
| Cupo de Codex agotado | Claude hace la tarea o se pospone; **nunca se cambia a una API de pago automáticamente** |
| Prueba fallida | Hasta dos correcciones; después, diagnóstico de causa o decisión humana |
| Requiere decisión de Iván | Pausa con pregunta cerrada y opciones; el trabajo independiente continúa |

### Ejemplos resueltos

- **Roblox: tienda de 3 objetos.** Ruta: Claude coordina, porque hay economía persistente y compras. Contexto: `Roblox/Economia.md` y `Decisiones.md`. Plan con criterios de aceptación → Codex implementa Luau y las pruebas de lógica → Claude prueba en Studio **si la conexión MCP existente responde** (se verifica, no se da por hecha) → revisión adversarial centrada en persistencia y duplicación de compras → tu aprobación antes de publicar. Una prueba de lógica no sustituye probar el juego.
- **Pragmat: nueva landing de un cliente.** Ruta: Codex directo si el brief y la oferta están aprobados; Claude coordina si cambian precios o hay pagos. Contexto: el Excel de precios vigente (fuente canónica) y la carpeta **de ese cliente**. Pruebas funcionales, revisión normal y entrega.
- **Hecho de Nada: nuevo Short.** Ruta: Claude solo, con su skill y su identidad. Buffer queda sujeto a tu aprobación. Codex no participa salvo un problema técnico concreto que tú autorices, por ejemplo un fallo de render.
- **Codex directo: test que falla.** Con reproducción y aceptación claras: `/codex:rescue --background`, `/codex:status` y `/codex:result`. Claude no interviene por sistema. Si aparece un aprendizaje reutilizable, se propone como nota.
- **Proyecto nuevo.** Ficha de 10 líneas (`Indice.md`): objetivo, fuentes existentes, herramientas, modo preferido y qué significa «terminado». Después, la primera tarea. Las carpetas extra se crean cuando aparece contenido.

---

## 6. Modelos y esfuerzo

IDs del catálogo o del changelog oficiales. El **acceso de tu cuenta está pendiente** en todos: se comprueba con `/model` en Claude Code y en Codex. Niveles de Claude: `low`, `medium`, `high`, `xhigh` y `max`, según el modelo (verificar con `/effort`). Niveles de Codex: `low`…`max`, más `ultra` excepto en Luna. No se trasladan los niveles de una plataforma a la otra.

| Tarea | Principal | Esfuerzo inicial | Motivo | Revisión | Escalar si… | Si no está disponible |
|---|---|---|---|---|---|---|
| Extraer datos de tabla/Excel | **Script o plantilla, sin LLM** | — | Determinista y verificable | Comparar totales | Hay interpretación de negocio | Haiku 5.5 o Luna, bajo |
| Informe rutinario | Plantilla + Haiku 5.5 / Luna | low–medium | Formato fijo | Autocomprobación de cifras | Contradicciones | Sonnet 5.5, medio |
| Documentación | Sonnet 5.5 o Sol | medium | Claridad sin decisiones costosas | Normal | Decisiones de arquitectura | El otro proveedor |
| Brief creativo (Hecho de Nada) | **El modelo Claude de tu flujo actual** | El que ya usas | Conservar la dirección aprobada | Tú | — | Pausar, no sustituir |
| Investigación | Sonnet 5.5 u Opus 5.5 con búsqueda | medium–high | Síntesis y criterio | Fuentes enlazadas | Fuentes contradictorias | Pendiente |
| Planificación | Opus 5.5 o Sonnet 5.5 | high | Ambigüedad y dependencias | Tú apruebas el plan | El alcance no se cierra | Sonnet 5.5 |
| Arquitectura | Opus 5.5 | high | Decisiones difíciles de revertir | Adversarial de Codex | Riesgo alto | Astra, high |
| Implementación definida | Sol 6.1 | **medium** (por defecto es low) | Modelo general de programación según el catálogo | Pruebas + review normal | Falla 2 veces → high | Terra 6.1 o Claude Sonnet 5.5 |
| Bug difícil | Astra o Opus 5.5 | high (→ xhigh puntual) | Diagnóstico profundo | Reproducción antes/después | Sin causa tras 2 intentos → replantear | El otro |
| Revisión corriente | `/codex:review` (modelo por defecto) | default | Lectura sin cambios | — | Hallazgos críticos | Claude `/code-review` |
| Pagos / permisos / economía | Opus 5.5 o Astra + **pruebas específicas** | high | Impacto alto | Adversarial + **tu decisión** | Siempre humano al final | No se hace sin revisión |

Terra 6.1 no se declara mejor que Sol, ni Astra mejor auditor: el catálogo solo da descripciones. Terra se compara con Sol en el piloto. `ultra`, `max` y Fable quedan fuera del uso habitual. Conviene no cambiar de modelo a mitad de un trabajo coherente: el changelog avisa de que cambiar modelo o esfuerzo invalida la caché.

**Medidas que no se mezclan:** tokens de entrada, salida, razonamiento y caché · contexto ocupado · cuota de suscripción (% de la ventana de 5 h / 7 días) · coste equivalente en API (estimación de `ccusage` o `/cost`) · cobro efectivo (tu factura). No hay equivalencias entre los saldos de Claude y OpenAI.

---

## 7. Memoria con Obsidian

**Nivel 1: carpeta Markdown (empezar aquí).** Claude y Codex leen y buscan archivos de la bóveda. Obsidian refleja los cambios externos. [F8]
**Nivel 2: CLI oficial** (instalador 1.12+, con la app abierta): `search` y `search:context`, útil cuando la búsqueda de archivos no basta. [F8]
**Nivel 3: `obsidian-skills`**, para que los agentes escriban Bases y Canvas correctamente. Embeddings, base vectorial o MCP solo si una medición demuestra que la búsqueda textual falla.

### Estructura propuesta (no creada)

```
Oficina/
  AGENTS.md                      ← reglas comunes breves (Claude y Codex)
  General/Preferencias.md
  Proyectos/
    Hecho-de-Nada/ Indice · Estado · Identidad · Procedimiento · Decisiones
    Pragmat/       Indice · Estado · Oferta(→ Excel de precios) · Procedimiento · Decisiones
      Clientes/<cliente>/        ← nunca mezclar; sensibles → bóveda aparte
    Roblox/        Indice · Estado · Diseno · Economia · Decisiones
    <Nuevo>/       Indice         ← se amplía cuando hay contenido
  Aprendizajes/                  ← solo lo reutilizable y comprobado
  Archivo/                       ← sustituido; fuera de la búsqueda habitual
```

**Fuentes canónicas:** precios de Pragmat → **tu Excel**; la nota solo enlaza y resume con fecha. Identidad de Hecho de Nada → `Identidad.md`, la versión que usa tu skill. Economía y decisiones de Roblox → `Economia.md` y `Decisiones.md`, o tu Excel si ya existe. Cada dato tiene una sola fuente de verdad.

**Frontmatter mínimo de una nota importante:** `proyecto`, `estado` (borrador/aprobado/sustituido), `fuente`, `actualizado`, `sustituye`/`sustituido_por`.

**Recuperación:** proyecto → `Indice.md` → búsqueda de términos → leer las notas o secciones completas que importan → comprobar estado y fecha → ampliar si falta algo. Los enlaces y el grafo no cargan nada por sí solos. Las reglas esenciales no se recortan.

**Cierre de tarea:** el agente propone de 0 a 3 aprendizajes con su evidencia → tú apruebas → se actualiza la nota existente o se crea una → la versión anterior pasa a «sustituido» con un enlace. No se guarda cada mensaje.

**Instrucciones de entrada:** un `AGENTS.md` de menos de 200 líneas (la doc de Claude recomienda ese tamaño) que dice dónde está la bóveda, cómo recuperar y qué no hacer. No se copia la bóveda. Ningún modelo «recuerda» sin recuperar.

| Etapa | Valor | Riesgo |
|---|---|---|
| Primeras sesiones | Identidad, estado y reglas a mano | Crear carpetas vacías |
| Semanas | No re-explicar decisiones ni repetir fallos | Duplicados y notas largas |
| Meses | Continuidad entre sesiones, modelos y herramientas | Hipótesis antiguas tratadas como hechos |

---

## 8. Eficiencia y piloto

Estrategias que se aplican: recuperación selectiva ampliable, ruta directa para trabajo definido, plantillas para informes, traspasos con referencias en lugar del chat completo, revisión según riesgo, paralelismo solo con trabajo independiente (agent view avisa de que diez sesiones gastan unas diez veces más cupo [F5]) y modelo estable dentro de un trabajo. Coste de estas estrategias: mantener notas, escribir contratos y revisar. Se miden en el piloto.

**Piloto (2 semanas, 8–10 tareas):**

1. Inventario de solo lectura en tu PC: sistema operativo, `claude --version`, `codex --version`, modelos visibles en `/model` y estado de `/codex:setup`. No se leen secretos.
2. Referencia: dos o tres tareas hechas como hasta ahora.
3. Tareas: 2 Pragmat (una directa a Codex), 2 Roblox (una con economía), 2 Hecho de Nada (Claude solo), 1 bug y 1 proyecto nuevo.
4. Por tarea se mide: tiempo total, intervenciones tuyas, correcciones, pruebas ejecutadas y % de cuota consumido (`/usage`, `/status` de Codex) antes y después.
5. Prueba de memoria: una pregunta con respuesta conocida, una nota sustituida que **no** debe usarse y una nota de otro proyecto que **no** debe aparecer.
6. Criterio: requisitos cumplidos, pruebas pertinentes aprobadas y ningún fallo crítico. Si baja el consumo pero hay más retrabajo, no se adopta.

Metas del piloto, no resultados: no hay porcentaje de ahorro demostrado.

---

## 9. Seguimiento visual

| Dónde | Qué es | Visible al cambiar de app |
|---|---|---|
| Panel dentro de Claude (agent view, barra de estado, `/diff`) | Nativo | No |
| Tarjeta arrastrable del Artifact | **Simulación educativa** | No |
| Ventana real del sistema | Terminal con `claude agents` + PowerToys *Always On Top* (Win+Ctrl+T), o un widget como Agent Usage Monitor | **Sí** |

**Campos de la tarjeta y su fuente:**

| Campo | Fuente posible | Límite |
|---|---|---|
| Proyecto/tarea | Nombre de sesión y directorio | Sin dato si no se nombró |
| Agente | Claude: agent view; Codex: `/codex:status` | Dos fuentes separadas |
| Modelo / esfuerzo | statusline `model`, `effort.level`; `subagentStatusLine` | El esfuerzo de Codex sale de su configuración o del flag |
| Estado / bloqueo | agent view (working, needs input, done); job de Codex | Sin porcentaje de avance |
| Tiempo transcurrido | Marcas de tiempo | Observable |
| Tiempo restante | — | **Desconocido**, no se estima |
| Cuota | Claude: `rate_limits` (Pro/Max); Codex: `account/rateLimits/read` | Cuota de cuenta ≠ estado de tarea |
| Comprobaciones | Lista de aceptación del contrato | «2 de 4» solo si la lista existe |

**Especificación mínima de un mod futuro** (no se implementa): un panel lateral que lea los eventos de sesión de Claude y el estado de los jobs del plugin, sin llamadas a IA. Dependencias: hooks module (acceso temprano), funcionamiento de las function hooks en tu versión, API inestable. Mantenimiento: revisar en cada actualización de Claude Code. **Alternativa más sencilla:** terminal fijada con `claude agents` + `/codex:status`.

---

## 10. Pendientes que requieren tu PC

- Sistema operativo y versiones de Claude Code (≥ 2.1.139 para agent view; idealmente la última) y de Codex (≥ 0.153 para los modelos 6.x).
- Plan exacto de Claude y modelos visibles. Fable requiere comprobar si necesita usage credits.
- Límites reales de Codex en tu ChatGPT Plus.
- Si Codex funciona bien en Windows nativo o conviene WSL.
- Estado de la conexión Roblox Studio/MCP y de Buffer: inspeccionar sin reconstruir.
- Ubicación de tus MD y Excel existentes para la bóveda.

**Primer paso útil:** en tu PC, que Claude Code ejecute el inventario de solo lectura e instale el plugin con `/codex:setup`. El único paso tuyo es iniciar sesión en Codex con tu cuenta de ChatGPT cuando aparezca la ventana oficial.

---

## Fuentes

| Ref | Fuente | Consultada |
|---|---|---|
| F1 | [openai/codex-plugin-cc README](https://github.com/openai/codex-plugin-cc/blob/main/README.md) y [package.json](https://github.com/openai/codex-plugin-cc/blob/main/package.json) | 2026-11-02 |
| F2 | [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) (2.1.316 actual; 2.1.139 agent view; altas de Opus/Sonnet/Haiku 5.5 y Fable 5.1) | 2026-11-02 |
| F3 | [Claude Code mods README](https://github.com/anthropics/claude-code/blob/main/mods/README.md) | 2026-11-02 |
| F4 | [Codex models.json](https://github.com/openai/codex/blob/main/codex-rs/models-manager/models.json) | 2026-11-02 |
| F4b | [Codex README, instalación](https://github.com/openai/codex/blob/main/README.md) | 2026-11-02 |
| F5 | [Agent view, docs oficiales](https://code.claude.com/docs/en/agent-view) | 2026-11-02 |
| F6 | [Status line, docs oficiales](https://code.claude.com/docs/en/statusline) | 2026-11-02 |
| F7 | [Memory / CLAUDE.md / AGENTS.md, docs oficiales](https://code.claude.com/docs/en/memory) | 2026-11-02 |
| F8 | Ayuda de Obsidian: [CLI](https://github.com/obsidianmd/obsidian-help/blob/master/en/Extending%20Obsidian/Obsidian%20CLI.md), [almacenamiento](https://github.com/obsidianmd/obsidian-help/blob/master/en/Files%20and%20folders/How%20Obsidian%20stores%20data.md), [Bases](https://github.com/obsidianmd/obsidian-help/blob/master/en/Bases/Introduction%20to%20Bases.md) | 2026-11-02 |
| F9 | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 2026-11-02 |
| F10 | [ccstatusline](https://github.com/sirmalloc/ccstatusline) | 2026-11-02 |
| F11 | [ccusage](https://github.com/ryoppippi/ccusage) | 2026-11-02 |
| F12 | [Vibe Kanban README](https://github.com/BloopAI/vibe-kanban) | 2026-11-02 |
| F13 | [Codex + Claude Usage Tracker](https://github.com/markaljhon/codex-claude-usage-tracker) | 2026-11-02 |
| F14 | [HarnessMonitor](https://github.com/localhost94/harness-monitor) | 2026-11-02 |
| F15 | [Agent Usage Monitor](https://github.com/barracodev/agent-usage-monitor) | 2026-11-02 |
| F16 | [Claude Squad](https://github.com/smtg-ai/claude-squad) | 2026-11-02 |
| F17 | [PowerToys Always On Top](https://learn.microsoft.com/windows/powertoys/always-on-top) (vía la investigación previa; no releído aquí) | — |
| W1 | Terceros sobre límites de Codex: [uibakery](https://uibakery.io/blog/openai-codex-pricing), [developersdigest](https://www.developersdigest.tech/blog/codex-usage-limits-pricing-2026), [foro OpenAI](https://community.openai.com/t/codex-usage-limit-is-reached-too-quickly-even-with-chatgpt-plus/1379502) | 2026-11-02 |
| W2 | Experiencias en japonés: [azukiazusa.dev](https://azukiazusa.dev/blog/claude-code-codex-plugin.md), [devtools.shingoirie.com](https://devtools.shingoirie.com/blog/claude-code-codex-review-setup/) | 2026-11-02 |
| W3 | En español y comunidad: [webreactiva](https://www.webreactiva.com/blog/codex-plugin-claude-code), [issue #102 del plugin](https://github.com/openai/codex-plugin-cc/issues/102), [cc-plugin-codex](https://github.com/kelven1217/cc-plugin-codex) | 2026-11-02 |
