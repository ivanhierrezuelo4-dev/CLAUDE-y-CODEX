# GREMIO · Documento maestro

> **Para el agente que lea esto (Claude Code o Codex):** este documento describe un sistema de trabajo completo. Tu tarea es **entenderlo, instalarlo en el entorno de Iván, adaptarlo al proyecto en el que estás y dejarlo listo para trabajar.** Lee todo antes de actuar. La lista de comprobación está en la sección 14. Iván no programa: explícale solo los pasos que necesitan su intervención, uno por uno, en español.

Carpeta del kit (súbela entera al proyecto):

```
gremio/
├── GREMIO.md          ← este documento (empieza aquí)
├── REGLAS.md          ← reglas resumidas (papeles, tipos, revisión, relevo, memoria)
├── PROMPTS.md         ← plantillas de prompt por nivel
├── AUDITORIA.md       ← autoauditoría de ahorro y cambios aplicados
├── tablero.html       ← el tablero visual (tarjeta de misión)
└── mision-demo-*.json ← ejemplos de misión (formato de datos)
```

---

## 1. Qué es el Gremio (en una frase)

Una forma de trabajar en la que **Claude orquesta, Codex ejecuta e Iván decide**, con cada encargo convertido en una **misión** que tiene tipo, equipo de modelos, estimación de coste, plan y una **tarjeta visual** que Iván ajusta y confirma.

**No es una aplicación.** Es un kit de reglas, plantillas, un tablero visual y unos pocos scripts. Se instala una vez en el PC y cada proyecto añade un adaptador corto, el *brief*.

## 2. Por qué existe (lo que resuelve)

| Problema | Cómo lo resuelve |
|---|---|
| Gastar el cupo caro en tareas simples | Rutas por tipo: Sonnet por defecto y Opus solo en lo complejo |
| Un modelo no ve sus propios errores | Revisión cruzada por la «otra casa» (Claude revisa a Codex y al revés), solo si Iván la pide |
| Prompts vagos que obligan a rehacer | Plantillas por nivel: contrato para definidas, plan vivo para complejas |
| Quedarse sin cupo de Claude a mitad | Reserva y relevo: el plan escrito permite que Codex continúe |
| Cargar demasiado contexto | Memoria por misión: solo las notas necesarias de la bóveda de Obsidian |
| No saber qué está pasando | Tarjeta en vivo: paso actual, tiempo, tokens y avance |

## 3. Papeles

| Papel | Quién | Hace |
|---|---|---|
| Maestro del gremio | **Iván** | Ajusta y confirma la misión, decide lo irreversible (dinero, economía del juego, marca) y aprueba los aprendizajes |
| Orquestador | **Claude** (Claude Code) | Entiende, propone la misión, planifica, escribe contratos, coordina, revisa con evidencia y actualiza la tarjeta |
| Ejecutor | **Codex** (plugin oficial de Codex en Claude Code, o la app/CLI de Codex) | Implementa, investiga código, prueba y corrige dentro del contrato |
| Mano derecha | **Astra 6** (Codex) | Solo en misiones complejas, solo si Iván la activa, y para una sola pieza. Es cara |
| Archivo | **Bóveda de Obsidian** | Memoria compartida (Markdown), que leen tanto Claude como Codex |

## 4. Tipos de misión y modelos

El sistema **sugiere** el tipo (✦) e Iván puede cambiarlo en la tarjeta. Sin pulsar «Confirmar» no empieza nada.

| Tipo | ¿Tarjeta? | Ruta | Modelos por defecto | Revisión |
|---|---|---|---|---|
| Pregunta rápida | No | Claude responde, sin delegar | Sonnet 5.5 · `low`/`medium` | No |
| Datos / informe | No | Plantilla o script primero | Script → Sonnet 5.5 `medium` | No |
| **Sencilla** | Solo si dura más de ~10 min o Iván la pide | Codex directo o Claude | Sol 6.1 `low` o Sonnet 5.5 `medium` | Opcional |
| **Definida** | Sí | Sonnet escribe el contrato → Codex ejecuta | Sonnet 5.5 `high` → Sol 6.1 `medium` (Terra si hay mucho que leer) | Se pregunta |
| **Compleja** | Sí | Opus coordina → Codex ejecuta las piezas | Opus 5.5 `high` → Sol 6.1 `medium` (+ ★ Astra si Iván la activa) | Se pregunta |

Reglas fijas:
- **Haiku 5.5 y Luna 6:** se pueden elegir, pero solo sirven para tareas mecánicas (ordenar, renombrar). La tarjeta lo avisa.
- **Fable 5.1:** nunca por defecto; en el plan Pro pide créditos extra.
- **`xhigh` / `max` / `ultra`:** nunca por costumbre.
- **Equivalencias aproximadas:** Astra ↔ Fable (lo más alto de cada casa) · Opus ≈ Sol (los fuertes del día a día) · Sonnet ≈ Sol para trabajo normal · Haiku ↔ Luna. Terra no es más fuerte que Sol: tiene más contexto (500k).
- Los nombres de modelo cambian: **compruébalos con `/model` en cada herramienta** al instalar y actualiza la tabla.

**Revisión cruzada:** lo que hizo Codex lo revisa Sonnet `medium`; lo que hizo Claude lo revisa Sol `medium`; lo de Opus lo revisa Sol `high`; lo de Astra lo revisa Opus `high`. Una revisión por misión, como máximo 2 correcciones. Astra nunca revisa.

## 5. Ciclo de una misión

```
Iván pide algo en el chat
   │
   ├─ pregunta / datos ──► Claude responde (sin tarjeta)
   │
   └─ trabajo ─► Claude crea la MISIÓN (compacta) ─► aparece la TARJETA
                    │
        Iván ajusta en la tarjeta: tipo, modelos, esfuerzo, Astra, notas, especificación
                    │
        Iván pulsa ✔ CONFIRMAR ─► la tarjeta avisa a Claude con un resumen (incluye las notas)
                    │
        Claude ejecuta el plan: contratos → Codex → pruebas → (revisión si se pidió)
        y actualiza la tarjeta SOLO al cambiar de paso
                    │
        COMPLETADA ─► resultado + % y tokens reales + 0–3 aprendizajes (Iván aprueba)
                    │
        Al empezar la siguiente misión, la anterior pasa al SALÓN (no es contexto)
```

## 6. La tarjeta y el tablero (cómo se ve y qué hace)

`tablero.html` es una página (artefacto de claude.ai) con:

- **Nombres:** el **tablero principal** es la vista de inicio, que está vacía y espera. Los **sandboxes** son los proyectos conectados más la **Bóveda**. Las **tarjetas** son las misiones; cada sandbox puede tener varias.
- **Pestaña Misión ▾:** despliega la lista de sandboxes, con cuántas tarjetas tiene cada uno, cuántas trabajan y el cupo de Claude. Al elegir uno se ven sus tarjetas como píldoras (estado, paso, tiempo y tokens); al tocar una se abre la tarjeta completa.
- **Sandbox Bóveda:** resumen de la memoria (notas, proyectos con o sin brief, aprendizajes recientes y decisiones vigentes), botón para abrirla en Obsidian y sus propias tarjetas (tareas de la bóveda). Lo lleva el chat madre.
- **Pestaña Salón:** las completadas de todos los sandboxes, con filtro. Es solo para verlas.
- **Tarjeta flotante:** se arrastra por la barra y se minimiza en una píldora que vuelve al mismo sitio. En el teléfono se acopla al ancho y la píldora va abajo.
  - Nombre editable (✎) y **META** plegable con trofeo.
  - Tipo (✦ sugerido · ↺ volver a lo sugerido).
  - Equipo: tocar el modelo abre la lista; tocar el esfuerzo lo rota (`low → medium → high → xhigh`).
  - ★ Astra, con interruptor (solo en complejas).
  - Estimación: tiempo, % de 5 h de Claude, % de 5 h de Codex y cupo antes.
  - Botón **✔ Confirmar** y botón **Mapa**.
- **Trabajando:** halo del color del tipo, animación de forja (minimizable) con paso N de M, barra de XP, tiempo y tokens. La píldora muestra un reloj, el tiempo y los tokens.
- **Mapa (plan):** pasos con su responsable. Cada paso permite **cambiar su modelo y esfuerzo** y tiene una **caja de nota**. Incluye el **cofre de la bóveda** (las únicas notas que se usarán, con botón «Abrir en Obsidian») y la **especificación completa** editable.
- **8 skins** de decorado (Clásico, Castillo, Dulcelandia, Hawái, Glaciar, Volcán, Bosque, Cosmos), guardadas en el navegador de Iván.

**El diseño está congelado.** No se republica la página para cada misión: solo cambian sus datos. Republicarla cuesta unos 30k tokens; escribir una misión, unos 1–2k.

### 6.1 Datos de la tarjeta (contrato entre Claude y la página)

La página lee su base de datos:
- `proyectos/<slug>`: un documento por sandbox, `{ "proyecto": "Nombre" }`. El `slug` es el nombre en minúsculas, sin tildes y con guiones.
- `proyectos/<slug>/misiones/<M-XXX>`: las tarjetas de ese sandbox (formato de abajo). Puede haber varias.
- `gremio/boveda`: resumen de la bóveda para el sandbox Bóveda (ver la skill, sección 6).
- `completadas/<slug>-<id>`: las cerradas, con `proyecto` y `proyectoId`.
- `gremio/estado`: `{ cinco_h, semanal, actualizado }`, el cupo que muestra el resumen. Lo actualiza Claude desde `~/.gremio/estado.json`.

```jsonc
{
  "id": "M-003", "simulada": false, "titulo": "…", "meta": "Qué existirá al terminar (1 frase)",
  "porque": "Por qué este tipo", "tipoSugerido": "compleja", "tipo": "compleja",
  "estado": "propuesta",            // propuesta | lista | trabajando | revision | completada | pausa | bloqueada
  "paso": -1,                       // índice del paso activo entre los VISIBLES
  "inicio": null, "actualizado": "ISO",
  "equipos": {},                    // lo rellena la página con los cambios de Iván
  "pasosCfg": {},                   // modelo/esfuerzo por paso (página)
  "notas": {},                      // notas por paso (página)
  "astra": { "activa": false, "esfuerzo": "medium", "pieza": "…" },
  "cupoAntes": 28,                  // % real de 5 h de Claude al crear la misión
  "tokens": { "claude": 0, "codex": 0 },   // reales si hay fuente; si no, omitir
  "boveda": [ { "titulo": "…", "ruta": "Proyectos/X/nota.md", "contenido": "resumen corto" } ],
  "vault": "NombreDeLaBóveda",
  "planes": { "compleja": [ { "titulo": "…", "rol": "orquesta|ejecuta|astra|revisa|ivan",
                              "entrega": "…", "comprueba": "…" } ] },   // SOLO el tipo sugerido
  "spec": [ { "id": "proposito", "titulo": "Propósito", "texto": "…" } ],
  "resultado": null
}
```

La página calcula sola el equipo por defecto, las estimaciones y las plantillas genéricas de los otros tipos.

### 6.2 Protocolo de Claude con la tarjeta (ahorro incluido)

1. **Crear (misión compacta):** escribir con `set` en `proyectos/<slug>/misiones/<M-XXX>` (nunca en otro sandbox) solo el plan del **tipo sugerido** y una especificación de 3–5 apartados cortos. No escribir los planes de los otros tipos.
2. **Si Iván confirma otro tipo**, en ese momento escribir el plan de ese tipo (una sola vez).
3. **Al confirmar**, la tarjeta guarda en `confirmacion` un resumen con el tipo, el equipo, Astra, los pasos con modelo propio, la estimación, **las notas de Iván** y si editó la especificación. Después Iván escribe **«empezar» en el chat de ese proyecto**, que lee la tarjeta una sola vez. No hay aviso automático: llegaría a una sesión cualquiera y despertar a todos los chats gastaría cupo.
3b. **Modelos de la tarjeta:** cada pieza de Codex se lanza con `/codex:rescue --model <id> --effort <e>` (tabla de ids en la skill). Las revisiones de Codex con un modelo distinto al de `config.toml` también van por `/codex:rescue`, con la instrucción «revisa sin modificar archivos». Los pasos de Claude con otro modelo van como subagente. El modelo de la orquesta lo pone Iván con `/model`: el chat lo comprueba al empezar y se lo pide si no coincide.
4. **Durante el trabajo:** un `update` solo al cambiar de paso o de estado (4–6 escrituras por misión), siempre con `if_version`.
5. **Al cerrar:** `estado: completada`, `resultado`, tokens y % reales. La tarjeta se queda en su sandbox con un trofeo. Al crear la siguiente tarjeta de ese sandbox, en un `batch`: copiar un resumen a `completadas/<slug>-<id>` y borrar la completada de `misiones/`.
7. **El aviso de Confirmar dice el proyecto:** cada chat actúa solo sobre el suyo. Si el aviso no llega a ese chat, Iván escribe «empezar» allí.
6. **Tareas de menos de ~10 min:** sin tarjeta, salvo que Iván la pida.

### 6.2b Cerrar desde el tablero

En el paso de revisión de Iván (y en la tarjeta, cuando no está en propuesta) hay un botón **«✔ Listo · cerrar misión»**. Se pulsa dos veces para confirmar. La misión pasa al Salón con su tiempo, sus tokens y su equipo, y la tarjeta se cierra.

### 6.2c Modo «Codex directo»

Si Iván escribe «que lo haga Codex» (o «Codex directo», «Codex: …»), Claude solo hace de **intermediario**. Pasa sus palabras tal cual a Codex con `/codex:rescue` (o `/codex:review` si es solo revisar), crea una **tarjeta ligera** marcada «CODEX DIRECTO» sin esperar Confirmar y devuelve el resultado resumido. Codex planifica, ejecuta, prueba y revisa lo suyo. Gasta muy poco cupo de Claude: el intermediario y su subagente. El trabajo cuenta para el cupo de Codex. Plantilla en `PROMPTS.md` y protocolo en la skill.

### 6.3 Avisos y bloqueos

Si algo impide seguir, por ejemplo **Codex no responde** o falta una decisión de Iván, el chat **no sigue por su cuenta**. Pone la tarjeta en `bloqueada` con un campo `alerta` (título, texto, pregunta y opciones). El tablero lo muestra en rojo en la tarjeta, en su píldora, en el menú de sandboxes y en la pestaña. Iván responde escribiendo la opción en el chat de ese proyecto, por ejemplo «sigue sin Codex» o «espera». Protocolo completo en la skill, sección 3b.

## 7. Un solo documento por misión (especificación = contrato = plan)

Para no escribir lo mismo tres veces, cada misión definida o compleja tiene **un único archivo de plan** en el proyecto (por ejemplo `gremio/misiones/M-003.md`, o en la bóveda), con el formato de «plan vivo» de `PROMPTS.md`: propósito, contexto, hitos, aceptación, progreso, sorpresas, decisiones y retrospectiva.

- La tarjeta muestra un **resumen** de ese archivo (meta, pasos y spec corta).
- Cada pieza para Codex es un contrato que **apunta a un hito** del archivo, no un texto nuevo.
- **Para qué sirve el relevo:** si Claude se queda sin cupo, Iván abre Codex y le dice «continúa la misión M-003». Codex lee ese archivo y sigue, sin necesitar el chat de Claude.

## 8. Cupo, tokens y que todo esté conectado entre proyectos

El cupo de Claude (5 h y semanal) es **de la cuenta**, no del proyecto: cualquier sesión, en cualquier proyecto, ve el mismo porcentaje.

**Instalar un script de barra de estado** (statusline de Claude Code) que, en cada sesión de cualquier proyecto:
1. Lea el JSON que Claude Code le pasa: `rate_limits.five_hour.used_percentage`, `rate_limits.seven_day.used_percentage`, `resets_at` y, si la versión lo expone, el uso o coste de la sesión.
2. Lo muestre corto en la barra: `5h 42% · sem 18% · Gremio M-003`.
3. Lo guarde en un **archivo común**: `~/.gremio/estado.json` (en Windows `%USERPROFILE%\.gremio\estado.json`).

Así todas las sesiones y proyectos leen el mismo estado. Claude toma de ahí `cupoAntes`, los tokens y los umbrales de relevo.

| Uso de Claude | Acción |
|---|---|
| < 85 % (5 h) y < 92 % (semanal) | Normal |
| 85–95 % / 92–97 % | Claude deja el plan listo para traspaso |
| ≥ 95 % / ≥ 97 % | **Reserva:** Claude solo coordina; relevo a Codex si hay plan; si falta una decisión, pregunta |

**Codex:** comprobar al instalar cómo leer su uso. Opciones: `/status` dentro de Codex (manual), el lector de límites de cuenta del servidor de Codex (`account/rateLimits/read`, por evaluar) o los registros de sesión de `~/.codex/`. Si no hay forma fiable, la tarjeta muestra «—» y no inventa números.

## 9. Que Codex también pueda mover la tarjeta

Hoy la tarjeta vive en claude.ai y solo Claude puede escribir en ella con su conector. Para que Codex también marque avances:

1. **Archivo espejo:** Claude y Codex escriben el estado de la misión en `~/.gremio/mision.json` (o en la bóveda) con el mismo formato de la sección 6.1. Las reglas de `AGENTS.md` le dicen a Codex que lo actualice al cambiar de paso.
2. **La tarjeta lee ese archivo:** el tablero puede leer archivos del PC mediante un servidor MCP local de sistema de archivos conectado en la app de Claude (`host:filesystem`). **Comprobar en la instalación** si está disponible en la app de Iván.
3. **Alternativa garantizada: tablero en Obsidian.** Una nota `Gremio/Tablero.md` con la misión en formato tabla y una vista de Bases. Codex la actualiza como cualquier Markdown e Iván la ve en Obsidian. Es menos bonita, pero funciona siempre.

## 10. Memoria (bóveda de Obsidian) y aprendizaje

- **Estructura:** `Gremio/` (reglas, plantillas y tablero espejo) y `Proyectos/<Nombre>/` con `_brief.md` (índice obligatorio), `decisiones.md`, `aprendizajes.md` y notas temáticas.
- **Recuperar:** índice del proyecto → búsqueda → solo las notas concretas. Lo que aparece en el cofre es lo único que se carga.
- **Cerrar misión:** proponer 0–3 aprendizajes; Iván aprueba; se actualiza la nota existente y lo antiguo se marca `sustituido`.
- **Guardar en el Salón:** tipo, modelos, tiempo real, % y tokens reales, y resultado. **No es contexto.**
- **Calibrar:** tras ~5 misiones reales del mismo tipo, comparar lo estimado con lo real y ajustar la fórmula de la tarjeta (tabla `UN`/`MM` en `tablero.html`).
- **Repaso semanal** (corto): Claude propone 1–3 cambios a las reglas según el historial; Iván aprueba.

## 11. Ahorro de tokens: reglas que aplican siempre

1. Rutas por tipo; Opus solo en complejas.
2. Misión compacta (solo el plan del tipo sugerido).
3. El aviso de Confirmar trae las notas, así que no hay que releer la misión.
4. Un solo documento por misión.
5. Actualizar la tarjeta solo al cambiar de paso.
6. **Una sesión por misión:** al terminar una misión, empezar sesión nueva (`/clear`) para no arrastrar contexto; usar `/compact` en los hitos largos.
7. Subagentes solo para trabajo paralelo e independiente.
8. Memoria mínima (cofre); el Salón nunca es contexto.
9. **Caveman** solo en las respuestas a Iván, **nunca** en prompts entre agentes. **Ponytail** sí. **RTK:** medir dos días con y sin él (`/usage`) y decidir.
10. Diseño del tablero congelado: no republicar la página salvo cambios pedidos.
11. Un buen prompt vale sus tokens; uno vago se paga con retrabajo.

## 12. Instalación (Windows, paso a paso)

> Agente: haz tú todo lo que puedas. Pide a Iván solo los inicios de sesión y las aprobaciones. No leas archivos de autenticación ni actives APIs de pago. Los archivos listos para copiar están en `kit/`.

**A. Conectar Codex a Claude Code** (lo escribe Iván en el chat de Claude Code o lo ejecuta el agente; comandos del README oficial de `openai/codex-plugin-cc`):

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

- Si `/codex:setup` dice que falta iniciar sesión: `!codex login`. Abre el navegador e Iván entra con su cuenta de ChatGPT.
- Requisitos: Node.js 18.18 o superior y la suscripción de ChatGPT de Iván (Plus). El uso cuenta para los límites de Codex.
- Prueba: `/codex:rescue --wait di en una línea qué hay en esta carpeta` y después `/codex:status`. En `/agents` debe aparecer `codex:codex-rescue`.
- **Modelo y esfuerzo:** `/codex:rescue` acepta `--model` y `--effort`. `/codex:review` no los acepta: usa los de `~/.codex/config.toml` (copiar `kit/codex/config.toml.ejemplo`). `/codex:transfer` pasa la sesión actual de Claude a Codex.

**B. Instalar el Gremio:**

1. **Herramientas:** comprobar Claude Code, Node.js, Git y Codex (`codex --version`). Comprobar los modelos con `/model` en ambos y ajustar la sección 4.
2. **Kit en una carpeta fija:** copiar `gremio/` a `%USERPROFILE%\.gremio\kit\` (o donde Iván prefiera) y crear `%USERPROFILE%\.gremio\`.
3. **Claude, reglas globales:** añadir `kit/claude/CLAUDE-gremio.md` a `%USERPROFILE%\.claude\CLAUDE.md`, rellenando `<…>`.
4. **Claude, skill:** copiar `kit/claude/skills/gremio/` a `%USERPROFILE%\.claude\skills\gremio\`.
5. **Claude, barra de estado:** copiar `kit/claude/statusline-gremio.cjs` a `%USERPROFILE%\.gremio\` y añadir a `%USERPROFILE%\.claude\settings.json`:
   `"statusLine": { "type": "command", "command": "node \"%USERPROFILE%\\.gremio\\statusline-gremio.cjs\"" }`
   (con la ruta real escrita entera). Comprobar que la barra muestra `5h …% · sem …%` y que se crea `estado.json`.
6. **Codex, reglas:** añadir `kit/codex/AGENTS-gremio.md` a `%USERPROFILE%\.codex\AGENTS.md` y `kit/codex/config.toml.ejemplo` a `config.toml`, sin borrar lo que ya haya.
7. **Bóveda de Obsidian:** encontrar su carpeta (en Obsidian, el selector de bóvedas muestra la ruta; o buscar la carpeta `.obsidian`). Copiar `kit/obsidian/Gremio/` y crear `Proyectos/<Nombre>/` a partir de `kit/obsidian/Proyectos/_plantilla/`.
8. **Tablero:** usar el de Iván (URL en `CLAUDE-gremio.md`) o publicar `tablero.html` como artefacto con las capacidades `db` y `comments`. Guardar la URL. Registrar cada proyecto que tenga brief en la bóveda con `set proyectos/<slug>` `{ "proyecto": "Nombre" }` (solo si no existe), para que salga en la lista.
9. **Por proyecto:** crear `<proyecto>/gremio/misiones/` (plantilla en `kit/misiones/`), escribir el *brief* (sección 13) y añadir 3–5 líneas al `AGENTS.md` del proyecto que apunten al brief.
10. **Ahorradores:** revisar Ponytail, RTK y Caveman según la sección 11.
11. **Piloto:** una misión sencilla, una definida y una compleja reales y cortas. Comparar lo estimado con lo real.

## 13. Adaptar el Gremio a cada proyecto: el *brief*

Al instalarlo en un proyecto (Roblox, Pragmat, micro-SaaS…), el agente lee lo que el proyecto ya sabe (archivos, notas, `AGENTS.md` existente) y entrega un **brief** para que Iván lo corrija:

1. Qué es el proyecto y cuáles son sus fuentes de verdad (rutas).
2. **Misiones típicas** con tipo y equipo sugeridos. Por ejemplo: «Nuevo personaje → compleja → Opus + Sol · revisa Sonnet»; «Ajuste de UI → sencilla → Sol low».
3. Herramientas propias (Studio/MCP, Buffer…) y si están verificadas, sin leer secretos.
4. Riesgos propios: economía del juego, pagos, datos de clientes. Esto siempre lo decide Iván.
5. Qué se guarda en la bóveda y dónde.
6. Ideas: 3–5 mejoras que el Gremio podría aportar a ese proyecto.

El brief aprobado se guarda como `Proyectos/<Nombre>/_brief.md` y en el `AGENTS.md` del proyecto (corto).

## 14. Lista de comprobación para el agente instalador

- [ ] Leí GREMIO.md, REGLAS.md, PROMPTS.md y AUDITORIA.md.
- [ ] Comprobé herramientas, versiones y modelos disponibles (`/model`).
- [ ] Plugin de Codex instalado y probado (`/codex:setup`, `/codex:rescue --wait …`, `/codex:status`); `config.toml` con el modelo por defecto.
- [ ] Bóveda localizada; `Gremio/` y `Proyectos/<X>/_brief.md` creados.
- [ ] `CLAUDE.md` global y `AGENTS.md` de Codex escritos.
- [ ] Skill `gremio` creada.
- [ ] Statusline escribiendo `~/.gremio/estado.json`; números reales visibles.
- [ ] Lectura del uso de Codex verificada (o marcada como manual).
- [ ] Tablero publicado o reutilizado; URL guardada.
- [ ] Ruta para que Codex actualice el estado (archivo espejo y/o tablero de Obsidian) probada.
- [ ] Brief del proyecto entregado a Iván y aprobado.
- [ ] Misión piloto de cada tipo completada; estimaciones comparadas con lo real.
- [ ] Iván sabe qué hacer: escribir la tarea, ajustar la tarjeta, pulsar Confirmar y mirar.

## 15. Cómo lo usa Iván (guía corta)

1. Escribe lo que quiere en el chat de Claude.
2. Si es trabajo, aparece la tarjeta. Mira la **META**, ajusta tipo, modelos, Astra y notas si quiere, y pulsa **✔ Confirmar**.
3. Mira el avance: la tarjeta o la píldora muestran el paso, el tiempo y los tokens. El **Mapa** enseña por dónde va.
4. Al final: lee el resultado, aprueba o no los aprendizajes y, si te lo pregunta, elige revisión.
5. Si Claude se queda sin cupo: abre Codex y dile «continúa la misión M-XXX».

## 15b. Usarlo desde el teléfono

Todo el flujo funciona desde el móvil. Lo único que cambia es **dónde corre Claude**.

| Pieza | En el teléfono |
|---|---|
| **Tablero / tarjeta** | Se abre el enlace del tablero en la app de Claude o en el navegador. La tarjeta se acopla al ancho, la píldora queda abajo y los botones están pensados para el dedo. Confirmar, el mapa, las notas, el cofre, la especificación y las skins funcionan igual |
| **Claude** | Sesión de **Claude Code en la nube** desde la app de Claude (claude.ai/code), con el repositorio del proyecto conectado. Es la misma forma en que se construyó este kit. La sesión escucha la tarjeta: al pulsar Confirmar le llega el aviso |
| **Codex** | Codex en la nube desde la app de ChatGPT, con el repositorio conectado. Lee `AGENTS.md` y el archivo de plan de la misión (sección 7) para retomar o ejecutar piezas |
| **Bóveda** | Obsidian para móvil con la bóveda sincronizada (Obsidian Sync u otra sincronización que Iván ya use). Si la bóveda vive en el repositorio, Claude y Codex en la nube la leen directamente |
| **Cupo** | La barra de estado (sección 8) solo existe en el PC. En la nube, Claude no ve el % de 5 h. Iván lo mira en la app (Ajustes → Uso) y lo dice si quiere, o se usa el último valor guardado en `~/.gremio/estado.json` si se sincroniza. La tarjeta muestra «—» cuando no hay dato real |

**Rutina en el teléfono:**
1. Abrir la sesión de Claude del proyecto en la app y escribir la tarea.
2. Abrir el tablero (enlace fijo, guardado en favoritos o anclado) y ajustar la tarjeta.
3. Pulsar ✔ Confirmar y mirar el avance en la tarjeta o en la píldora.
4. Si Claude se queda sin cupo: abrir Codex en la app de ChatGPT y decir «continúa la misión M-XXX».

**Límites en el móvil:**
- La sesión en la nube no tiene acceso a programas del PC (Roblox Studio, Obsidian de escritorio). Las misiones que necesitan probar en Studio quedan como «pendiente de probar en el PC».
- Las animaciones se pausan cuando la pestaña no está a la vista, para no gastar batería.

## 16. Problemas frecuentes

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| La tarjeta dice «SIN CONEXIÓN · EJEMPLO» | La base de datos del artefacto no respondió | Recargar; comprobar que el artefacto tiene la capacidad `db` |
| Confirmé y no pasa nada | Es lo esperado: confirmar no despierta a ningún chat | Escribir «empezar» en el chat de ese proyecto (la tarjeta lo recuerda) |
| Los % salen «—» | La statusline no está configurada o la fuente de Codex no está verificada | Sección 8 |
| Va lento | Muchas animaciones en un PC o teléfono modesto | Elegir la skin «Clásico»; minimizar la animación de trabajo |
| En el teléfono no veo el % de cupo | La barra de estado solo existe en el PC | Sección 15b: mirarlo en la app o usar el último valor guardado |
| Codex no retoma | La misión no tiene archivo de plan | Sección 7: un solo documento por misión |

## 17. Estado actual y límites honestos

- El tablero y el flujo están **probados en demo** (misiones simuladas). El sistema real **no está instalado**.
- Los nombres y precios de modelos se tomaron del catálogo de Codex y de la documentación de Claude Code en noviembre de 2026: **verificar en la instalación**.
- Pendiente de verificar: la lectura del uso de Codex y que el tablero lea archivos locales (`host:filesystem`). Ya verificado en el README del plugin: `/codex:review` no acepta modelo y usa `config.toml`.
- La tarjeta flota dentro del tablero, no sobre todo el escritorio. Que flote sobre el escritorio requeriría otra herramienta (por ejemplo PowerToys «Siempre visible» con la ventana del tablero).
