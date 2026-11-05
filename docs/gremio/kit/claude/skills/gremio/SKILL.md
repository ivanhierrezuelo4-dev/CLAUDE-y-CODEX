---
name: gremio
description: Crear, actualizar y cerrar misiones del Gremio (tarjeta del tablero, plan de misión, delegación a Codex, revisión cruzada y aprendizajes). Usar cuando Iván pida un trabajo de más de ~10 minutos, cuando llegue un aviso «Gremio · misión … CONFIRMADA» desde la tarjeta, o cuando diga «empezar», «cierra la misión» o «continúa la misión M-XXX».
---

# Skill: gremio

Lee las reglas de `~/.claude/CLAUDE.md` (bloque Gremio). Datos de la tarjeta y protocolo completo: `GREMIO.md`, secciones 6–8.

**Tu sandbox en el tablero:** cada proyecto es un *sandbox* con su documento `proyectos/<slug>` (`{ "proyecto": "Nombre bonito" }`) y sus *tarjetas* (misiones) en `proyectos/<slug>/misiones/<M-XXX>`. Puede haber varias tarjetas a la vez. El `slug` es el nombre del proyecto en minúsculas, sin tildes y con guiones (`Hecho de Nada` → `hecho-de-nada`). El sandbox `boveda` es de la bóveda y lo lleva el chat madre. Nunca escribas en el sandbox de otro proyecto.

## 0. Nombres de modelo (la tarjeta usa nombres cortos)
| En la tarjeta | Codex (`--model`) | Claude (`/model` o subagente) |
|---|---|---|
| Sol 6.1 | `gpt-6.1-sol` | — |
| Terra 6.1 | `gpt-6.1-terra` | — |
| Astra 6 | `gpt-6-astra` | — |
| Luna 6 | `gpt-6-luna` | — |
| Opus 5.5 | — | `claude-opus-5-5` (subagente: `opus`) |
| Sonnet 5.5 | — | `claude-sonnet-5-5` (subagente: `sonnet`) |
| Haiku 5.5 | — | `claude-haiku-5-5` (subagente: `haiku`) |
| Fable 5.1 | — | `claude-fable-5-1` (subagente: `fable`) |

Esfuerzo: `low` · `medium` · `high` · `xhigh`; si algo no acepta `xhigh`, usa `high` y díselo a Iván. Si un nombre no aparece en `/model` de su herramienta, avisa a Iván y propón el más cercano, sin elegir por tu cuenta.

## 1. Crear misión (compacta)
1. Clasifica: sencilla, definida o compleja. Sigue la tabla de la sección 4 de GREMIO.md.
2. Lee `~/.gremio/estado.json` y anota `cupoAntes` (el % de 5 h). Si no existe, no pongas el campo.
3. Elige 2–4 notas de la bóveda: el `_brief.md` del proyecto y las notas concretas. Ese es el cofre.
4. Escribe el plan **solo del tipo sugerido** en `<proyecto>/gremio/misiones/M-XXX.md`, con `misiones/PLANTILLA-mision.md`.
5. Publica la tarjeta en el tablero con `ArtifactData`: `set proyectos/<slug>/misiones/<M-XXX>` con el formato de la sección 6.1 de GREMIO.md. El número sigue al último del sandbox. Si el sandbox tiene tarjetas completadas, archívalas en el mismo `batch`: `set completadas/<slug>-<id>` con su resumen, `proyecto` y `proyectoId`, y luego `delete proyectos/<slug>/misiones/<id>`.
   Además, `update gremio/estado` con `{cinco_h, semanal, actualizado}` copiados de `~/.gremio/estado.json`, para que el tablero muestre el cupo.
6. Copia el mismo estado en `~/.gremio/mision.json` y en `Gremio/Tablero.md` de la bóveda.
7. Al chat, en 2–3 líneas: qué propones y «ajusta la tarjeta y pulsa Confirmar».

## 2. Al recibir «empezar»
- Iván confirma en la tarjeta y luego escribe **«empezar»** en el chat de su proyecto. Lee **una vez** la tarjeta confirmada (`estado: lista`) de tu sandbox: `proyectos/<slug>/misiones/<M-XXX>`. Su campo `confirmacion` resume el tipo, el equipo, Astra, los pasos con modelo propio, la estimación y las notas. Lee `spec` solo si dice «Especificación editada: sí».
- **Comprueba tu modelo:** si la tarjeta pide para la orquesta un modelo o esfuerzo de Claude distinto al de esta sesión, no empieces. Dile a Iván en una línea: «Cambia con `/model` a <modelo> (esfuerzo <x>) y vuelve a escribir empezar». Un chat no puede cambiarse de modelo a sí mismo.
- Si el tipo confirmado es distinto del sugerido, escribe ahora el plan de ese tipo.
- Pon `estado: trabajando`, `paso: 0` e `inicio` (ISO), con `if_version`.

## 3. Ejecutar
- Cada pieza de Codex lleva un contrato de nivel 3 (`PROMPTS.md`) que apunta a su hito del archivo de plan, con **el modelo y el esfuerzo exactos de ese paso** (los de la tarjeta, traducidos con la tabla de la sección 0):
  `/codex:rescue --model gpt-6.1-sol --effort high --background <contrato>`; luego `/codex:status` y `/codex:result`.
- Los pasos de Claude que la tarjeta asigna a otro modelo, como la revisión con Sonnet, se lanzan como **subagente** con ese modelo.
- **Revisión con Codex:** `/codex:review` no acepta modelo ni esfuerzo; solo úsalo si la tarjeta pide justo el de `~/.codex/config.toml`. Si pide otro, usa `/codex:rescue --model <m> --effort <e> --wait "Revisa sin modificar ningún archivo: …"` con el prompt de revisión cruzada de `PROMPTS.md`.
- Al cambiar de paso, actualiza `paso` y, si hay datos reales, `tokens`, en `proyectos/<slug>/misiones/<M-XXX>`, en `mision.json` y en `Tablero.md`. Aprovecha para actualizar `gremio/estado`.
- Pide la revisión cruzada en una línea: «¿Revisión? Sugerido: Sonnet 5.5 medium · sí / otro / no».

## 3b. Si Codex falla: avisar y preguntar, nunca sustituir en silencio
Si un paso asignado a Codex no se puede lanzar o falla (`/codex:setup` no está listo, sesión cerrada, sin cupo, error del plugin, modelo no disponible):
1. **No lo hagas tú con Claude por tu cuenta.** El Gremio existe para repartir el trabajo y gastar menos cupo de Claude.
2. Intenta arreglarlo una vez si es obvio: `/codex:setup` y, si pide iniciar sesión, pídele a Iván `!codex login`.
3. Si sigue sin funcionar, para y marca la tarjeta (`update` con `if_version`):
   `estado: "bloqueada"`, `alerta: { "tipo": "codex", "titulo": "CODEX NO RESPONDE", "texto": "<qué pasó, en una línea>", "pregunta": "¿Sigo solo con Claude (gasta más cupo de Claude) o espero a que lo arregles?", "opciones": ["sigue sin Codex", "espera"] }`.
4. En el chat, en 2 líneas: qué falló y las dos opciones.
5. Si Iván escribe **«sigue sin Codex»**: `alerta.resuelta: true`, `estado: "trabajando"`, y haces ese paso con Claude, con un Sonnet de esfuerzo parecido, salvo que la tarjeta diga otra cosa. Apúntalo en el resultado.
   Si escribe **«espera»**: déjala bloqueada hasta que diga «sigue».
6. Lo mismo vale para cualquier otro bloqueo (falta un dato, una decisión de negocio): `alerta` con `tipo: "decision"`, su pregunta y sus opciones.

## 4. Cerrar
- Pon `estado: completada` y el `resultado` (qué se hizo, qué se probó con su salida, qué falta), junto con el tiempo real, el % real y los tokens.
- Propón 0–3 aprendizajes; si Iván los aprueba, actualiza `Proyectos/<X>/aprendizajes.md`.
- Recuerda a Iván que la siguiente misión empieza en una sesión nueva.

## 4b. Si Iván cierra la tarjeta desde el tablero
En su paso de revisión, Iván puede pulsar **«✔ Listo · cerrar misión»**. El tablero copia la tarjeta a `completadas/<slug>-<id>` (con `cerradaPor: "ivan"`) y la borra de `misiones/`. Si al actualizar la tarjeta ya no existe, o Iván dice «ya la cerré»: no la vuelvas a crear. Termina lo que tengas pendiente solo si él lo pide, actualiza el archivo de plan, propón 0–3 aprendizajes y deja `~/.gremio/mision.json` y `Tablero.md` como completada.

## 5. Relevo
Si el cupo entra en reserva: deja el archivo de plan al día (progreso y siguiente paso) y dile a Iván «abre Codex y di: continúa la misión M-XXX».

## 6. Bóveda (solo el chat madre)
- El sandbox `boveda` muestra el resumen de `gremio/boveda`. Actualízalo cuando Iván diga «actualiza la bóveda en el tablero» o tras cerrar una tarjeta que cambie la bóveda:
  `{ "nombre": "<bóveda>", "notas": <número de .md>, "proyectos": [{ "nombre", "brief": true|false }], "aprendizajes": [{ "texto", "proyecto", "fecha" }] (los 6 más recientes, una línea cada uno), "decisiones": [{ "texto", "proyecto" }] (vigentes, una línea), "actualizado": ISO }`.
- Solo títulos y frases cortas: nunca contenido completo ni datos sensibles.
- Las tareas de la bóveda (ordenar, resumir, unir notas) son tarjetas en `proyectos/boveda/misiones/<M-XXX>`.
