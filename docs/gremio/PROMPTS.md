# Gremio · Cómo escribir prompts por nivel

Basado en las guías oficiales de Anthropic (prompting best practices, Claude Code best practices) y de OpenAI (Codex best practices, cookbook «ExecPlans» e «Iterating development workflows with Codex»). Consultadas el 2 nov 2026. Fuentes al final.

## Principios que aplican a todo

1. **Claro y directo.** Trata al modelo como una persona brillante pero nueva: no conoce tus normas. Prueba: si un colega sin contexto se confundiría con el prompt, el modelo también. [A]
2. **Explica el porqué.** «Nunca uses X *porque* Y» funciona mejor que «NUNCA X»: el modelo generaliza desde el motivo. [A]
3. **Separa con etiquetas.** Instrucciones, contexto, datos y ejemplos en bloques (`<contexto>`, `<tarea>`, `<aceptacion>`). [A]
4. **Criterios de aceptación observables.** «Al ejecutar X sale Y», no «que funcione». [O-ExecPlans]
5. **Alcance explícito.** Qué puede tocar y qué no. Evita la sobreingeniería: «solo lo pedido o claramente necesario». [A]
6. **Investigar antes de afirmar.** «No especules sobre código que no has abierto». [A]
7. **Pruebas que verifican, no que dirigen.** «No ajustes la solución a los tests; si un test está mal, avísame». [A]
8. **Cuándo detenerse.** Lista de dudas que obligan a parar y preguntar. [O-best practices: planificar o preguntar ante ambigüedad]
9. **Nada de estilo comprimido** (Caveman) entre agentes. Precisión > brevedad.
10. **Lo que funciona, a las reglas.** Si un patrón de prompt funciona o un error se repite, se guarda en `AGENTS.md` o en la skill. [O-best practices]

## Nivel 1 · Pregunta rápida (Claude, sin delegar)

No hace falta plantilla. Iván pregunta; Claude responde breve, citando la nota de la bóveda si la usó.

## Nivel 2 · Misión sencilla (Codex directo o Claude)

```
<tarea>Qué hay que hacer, en una o dos frases.</tarea>
<contexto>Archivos o notas exactas (rutas). Por qué importa.</contexto>
<alcance>Puedes tocar: … · No toques: …</alcance>
<aceptacion>Cómo comprobar que está bien (comando, resultado esperado).</aceptacion>
<respuesta>Hecho · probado (con salida) · pendiente. Máx. 10 líneas.</respuesta>
```

## Nivel 3 · Misión definida (contrato que escribe Sonnet `high` para Codex)

```
<objetivo>
Qué existirá al terminar y por qué le importa a Iván (resultado visible).
</objetivo>
<contexto>
Proyecto, fuentes de verdad (rutas de bóveda y repo, con fecha/estado),
decisiones ya tomadas que no se reabren.
</contexto>
<alcance>
Archivos y carpetas permitidos. Prohibido: … Dependencias previas: …
</alcance>
<plan_sugerido>
Pasos en orden. Puedes mejorarlos si explicas por qué.
</plan_sugerido>
<aceptacion>
1. Comando → resultado esperado.
2. Comportamiento observable → cómo verlo.
Las pruebas verifican; no adaptes la solución a ellas.
</aceptacion>
<detente_si>
Falta un dato · dos fuentes se contradicen · haría falta decidir algo de negocio,
dinero, marca o economía del juego · el cambio crece más allá del alcance.
</detente_si>
<respuesta>
Hecho / Probado (salidas) / Fallido / Pendiente · archivos cambiados ·
aprendizajes candidatos (0–3).
</respuesta>
```

## Nivel 4 · Misión compleja (Opus orquesta; plan vivo estilo ExecPlan)

Para trabajos de horas (p. ej., un sistema nuevo en Roblox), OpenAI recomienda un **plan ejecutable autocontenido y vivo**. [O-ExecPlans] Opus lo escribe una vez y lo mantiene:

```
# Misión: <nombre>
## Propósito            ← qué podrá hacer Iván después y cómo verlo
## Contexto             ← todo lo necesario, sin depender del chat; términos definidos
## Hitos                ← cada uno verificable por sí solo: meta, trabajo, resultado, prueba
## Aceptación           ← comportamientos observables y comandos
## Progreso             ← checklist con fecha (lo actualiza quien ejecuta)
## Sorpresas            ← hallazgos con evidencia corta
## Registro de decisiones ← qué se decidió, por qué, quién
## Resultado y retrospectiva ← al cerrar: qué se logró, qué falta, aprendizajes
```

Cada pieza delegada a Codex es un **contrato de nivel 3** que apunta a su hito del plan. Si ★ Astra participa, recibe el mismo plan y una pieza concreta; nunca «revisa todo».

Reglas extra de este nivel:
- **Subagentes solo para trabajo paralelo e independiente**; lo secuencial se hace directo. [A]
- **Un plan, no tres.** Opus planifica una vez; los cambios se registran en «Registro de decisiones».
- **El plan es el traspaso.** Si Claude entra en reserva, Codex continúa desde el plan sin necesitar el chat.

## Prompt de revisión cruzada (cualquier nivel)

```
<rol>Revisor de otra casa. No escribiste este trabajo.</rol>
<que_revisar>Diff o archivos: … · Objetivo original: … · Aceptación: …</que_revisar>
<foco>Errores, casos no cubiertos, riesgos (datos, dinero, economía), mejoras de claridad.</foco>
<formato>Lista: severidad (crítico/medio/menor) · archivo:línea · problema · arreglo sugerido.
Si no hay nada crítico, dilo en una línea. No reescribas el trabajo.</formato>
```

## Fuentes

- [A] Anthropic, *Prompting best practices*: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (secciones: Be clear and direct, Add context, Use examples, XML tags, Subagent orchestration, Overeagerness, Avoid focusing on passing tests, Minimizing hallucinations). Tiene guías por modelo (Opus 5.5, Sonnet 5.5) que conviene leer al afinar.
- Anthropic, *Claude Code best practices*: https://code.claude.com/docs/en/best-practices
- [O-best practices] OpenAI, *Codex best practices*: https://developers.openai.com/codex/learn/best-practices (bloqueada desde este entorno; resumen vía búsqueda: esfuerzo según tarea, planificar o preguntar ante ambigüedad, guardar patrones en AGENTS.md, retrospectivas cuando un error se repite).
- [O-ExecPlans] OpenAI Cookbook, *Using PLANS.md for multi-hour problem solving*: https://github.com/openai/openai-cookbook/blob/main/articles/codex_exec_plans.md
- OpenAI Cookbook, *Iterating development workflows with Codex*: https://github.com/openai/openai-cookbook/blob/main/examples/codex/iterating-development-workflows-with-codex.md
