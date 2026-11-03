# Gremio · Reglas v1

**Gremio** es el sistema de trabajo de Iván: Claude orquesta, Codex ejecuta y cada encargo es una **misión** con su tarjeta. Es universal: se instala una vez en el PC y cada proyecto añade un adaptador corto. No es una aplicación.

> Estado: diseño aprobado en conversación (2 nov 2026). No instalado. Los nombres de modelo vienen del catálogo oficial de Codex y del changelog de Claude Code; el acceso de la cuenta se comprueba con `/model`.

---

## 1. Papeles

| Papel | Quién | Qué hace |
|---|---|---|
| **Maestro del gremio** | Iván | Decide el tipo de misión, aprueba planes, elige revisiones, decide lo irreversible |
| **Orquestador** | Claude | Entiende, propone la tarjeta, planifica, escribe contratos y prompts, revisa con evidencia |
| **Ejecutor** | Codex | Implementa, investiga código, prueba y corrige dentro del contrato |
| **Mano derecha** | Astra 6 (Codex) | Solo en misiones complejas y **solo si Iván lo pide**. Cara |
| **Archivo** | Bóveda de Obsidian | Memoria compartida por Claude y Codex |

Claude «conoce» a Iván porque lee sus reglas y su bóveda, no por el modelo. Codex lee lo mismo (`AGENTS.md` y bóveda), así que también puede conocerlo.

## 2. Tipos de misión

El sistema **marca por defecto** el tipo que cree correcto; Iván lo cambia en la tarjeta si quiere. **Sin pulsar «Confirmar» no se empieza.**

| Tipo | Tarjeta | Ruta | Modelos por defecto | Revisión cruzada |
|---|---|---|---|---|
| **Pregunta rápida** | No | Claude responde, sin delegar | Sonnet 5.5 · `low` si es trivial, `medium` si no | No |
| **Datos / informe** | No | Plantilla o script primero | Script → Sonnet 5.5 `medium` si hay que redactar | No |
| **Sencilla** | **Sí** | Codex directo o Claude | Sol 6.1 `low/medium` o Sonnet 5.5 `medium` | Opcional |
| **Definida** | **Sí** | Sonnet escribe el contrato → Codex ejecuta | Sonnet 5.5 `high` (contrato) → Sol 6.1 o Terra 6.1 `medium` | **Se pregunta** |
| **Compleja** | **Sí** | Opus coordina → Codex ejecuta las piezas | Opus 5.5 `medium/high` → Sol 6.1 `medium` (+ ★ Astra 6 si Iván la pide) | **Se pregunta** |

**Haiku 5.5 y Luna 6:** prohibidos salvo para ordenar, renombrar o tareas mecánicas sin criterio. **Fable:** nunca por defecto (en Pro pide créditos). **`ultra` / `max`:** nunca por costumbre.

## 3. La tarjeta de misión (panel de mando)

La tarjeta flota aparte del chat y **es donde Iván edita la misión**. Una confirmación por misión.

En la tarjeta:
- **Meta · resultado:** una frase con lo que existirá al terminar.
- **Tipo:** viene marcado el sugerido (✦); un toque lo cambia y el equipo y los pasos se ajustan. **↺ Sugerido** lo deja todo como lo propuso el sistema.
- **Equipo:** tocar el modelo abre la lista de modelos para ese papel. Haiku y Luna aparecen con aviso («solo tareas mecánicas») y Fable avisa de que en Pro pide créditos. Tocar el esfuerzo lo rota `low → medium → high → xhigh`.
- **★ Astra** (solo compleja): se activa solo con su interruptor; activa, la estrella titila y aparece su paso en el plan. Avisa de que es cara.
- **Estimación** (orientativa): tiempo, % de la ventana de 5 h de Claude y % de la ventana de 5 h de Codex, calculados paso a paso según modelo y esfuerzo. Se recalcula con cada cambio.
- **Cupo antes:** % real de la barra de estado (en la demo, simulado).
- **Confirmar misión:** guarda y **avisa a Claude** por un comentario del artefacto, sin escribir en el chat. Si el aviso no puede salir, la tarjeta pide escribir «empezar».
- **Mapa:** abre el plan. Cada paso permite cambiar **su propio modelo y esfuerzo** (marcado «PROPIO») y tiene una **caja de nota**; todo se guarda solo y Claude lo lee al empezar. El **cofre de la bóveda** muestra las únicas notas de memoria que usará la misión (no la bóveda entera); cada nota se puede abrir y llevar a Obsidian. Al final, la **especificación completa** desplegable (propósito, contexto, alcance, hitos, aceptación, detente si, riesgos) es editable.
- **Trabajando:** halo del color del tipo alrededor de la tarjeta y una animación de forja encima (se puede minimizar) con el paso actual y la barra de XP (pasos hechos / total). Minimizada, la píldora muestra un reloj pixel y «TRABAJANDO · título». En el mapa, el paso activo lleva «▶ AQUÍ VA» y la línea entre pasos se llena en celeste.
- **Salón del Gremio** (pestaña propia): las misiones completadas se guardan aparte para verlas (equipo, duración, gasto real, resultado). **No son contexto:** Claude no las carga; lo útil de cada misión pasa a la bóveda solo como aprendizajes aprobados.
- **Skins:** 8 decorados pixel alrededor de la tarjeta (Clásico, Castillo, Dulcelandia, Hawái, Glaciar, Volcán, Bosque encantado, Cosmos), con figuras en las esquinas, bandas, laterales y partículas; el reloj cambia con cada skin. Se guardan en tu navegador.
- **Meta** plegable con trofeo y **nombre de la misión** editable (✎).
- **Tiempo y tokens** en la animación de trabajo: el tiempo es exacto; los tokens, aproximados.

Tras confirmar, los ajustes se bloquean. Estado: propuesta → confirmada → trabajando (paso N de M) → revisión → completada · pausa · bloqueada. Nunca porcentajes de avance inventados ni tiempo restante.

**Estimaciones:** fórmula por tipo, modelo y esfuerzo. Cada misión cerrada guarda el % real gastado, y con varias misiones del mismo tipo las estimaciones pasan a basarse en tu historial.

**Coste:** editar en la tarjeta no gasta cupo de Claude; Claude lee la tarjeta una vez al empezar (unos pocos miles de tokens).

## 4. Revisión cruzada

Un modelo ve mal sus propios errores, así que revisa la **otra casa**. Al terminar una misión definida o compleja, Claude pregunta en una línea:

> ¿Revisión? Sugerido: **Sonnet 5.5 medium** · sí / otro / no

| Lo hizo | Revisa (sugerido) |
|---|---|
| Sol 6.1 / Terra 6.1 | Sonnet 5.5 `medium` (`high` si el riesgo es alto) |
| Sonnet 5.5 | Sol 6.1 `medium` |
| Opus 5.5 | Sol 6.1 `high` u Opus en una sesión nueva si Iván prefiere |
| Astra 6 | Opus 5.5 `high` |

Una revisión por misión; máximo 2 correcciones; si discrepan, deciden las pruebas o Iván. Astra **no** se usa para revisar.

## 5. Capacidad y relevo

| Claude usado | Acción |
|---|---|
| < 85 % (5 h) y < 92 % (semanal) | Normal |
| 85–95 % / 92–97 % | Claude escribe el contrato de traspaso |
| ≥ 95 % / ≥ 97 % | **Reserva:** Claude solo coordina. Relevo automático a Codex si la misión ya tiene contrato y Codex tiene cupo; si es creativa o falta una decisión, pregunta a Iván |
| Sin Claude | Iván habla directo con Codex (mismo `AGENTS.md` y bóveda) |

Nunca se activa una API de pago automáticamente.

## 6. Memoria y aprendizaje

- **Recuperar:** índice del proyecto → búsqueda → notas concretas. Nunca la bóveda entera.
- **Cerrar misión:** 0–3 aprendizajes propuestos; Iván aprueba; se actualiza la nota existente; la anterior pasa a `sustituido`.
- **Guardar en la misión:** tipo, modelos, % gastado real, tiempo real, revisión sí/no, resultado.
- **Repaso semanal** (corto): Claude propone 1–3 cambios a estas reglas según el historial; Iván aprueba. Así el Gremio mejora y cambia de visión con el uso.

## 7. Ahorradores instalados (Ponytail, RTK, Caveman)

- **Caveman:** solo para respuestas de Claude a Iván, si gusta. **Nunca** en prompts entre Claude y Codex: un prompt comprimido pierde precisión y causa retrabajo.
- **RTK:** una prueba independiente (JetBrains) no encontró ahorro. Medir dos días con y sin él (`/usage`) y decidir.
- **Ponytail:** ~10 % en prueba independiente. Mantener; limitar a subagentes que escriben código con `PONYTAIL_SUBAGENT_MATCHER`.

## 8. Instalación en un proyecto: el «brief del gremio»

Al instalar el Gremio en un proyecto (Roblox, Pragmat, micro‑SaaS…), Claude lee lo que el proyecto ya sabe (archivos, notas, `AGENTS.md` existente) y entrega un **brief** para que Iván lo edite:

1. Qué es el proyecto y qué fuentes de verdad tiene.
2. **Misiones típicas** del proyecto con su tipo sugerido y equipo (ej.: «Nuevo personaje → compleja → Opus + Sol; revisión Sonnet»).
3. Herramientas propias (p. ej. conexión Studio/MCP, Buffer) y si están verificadas.
4. Riesgos propios (economía, pagos, datos de clientes).
5. Qué se guarda en la bóveda y dónde.

Iván corrige el brief y queda como adaptador del proyecto (corto). El prompt de instalación se escribe en la siguiente fase.

## 9. Prompts

Claude escribe a Codex con la plantilla del nivel que toque (ver `PROMPTS.md`). Un buen prompt vale sus tokens; uno vago se paga con retrabajo.
