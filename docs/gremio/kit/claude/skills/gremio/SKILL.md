---
name: gremio
description: Crear, actualizar y cerrar misiones del Gremio (tarjeta del tablero, plan de misión, delegación a Codex, revisión cruzada y aprendizajes). Usar cuando Iván pida un trabajo de más de ~10 minutos, cuando llegue un aviso «Gremio · misión … CONFIRMADA» desde la tarjeta, o cuando diga «empezar», «cierra la misión» o «continúa la misión M-XXX».
---

# Skill: gremio

Lee las reglas de `~/.claude/CLAUDE.md` (bloque Gremio). Datos de la tarjeta y protocolo completo: `GREMIO.md`, secciones 6–8.

**Tu sandbox en el tablero:** cada proyecto es un *sandbox* con su documento `proyectos/<slug>` (`{ "proyecto": "Nombre bonito" }`) y sus *tarjetas* (misiones) en `proyectos/<slug>/misiones/<M-XXX>`. Puede haber varias tarjetas a la vez. El `slug` es el nombre del proyecto en minúsculas, sin tildes y con guiones (`Hecho de Nada` → `hecho-de-nada`). El sandbox `boveda` es de la bóveda y lo lleva el chat madre. Nunca escribas en el sandbox de otro proyecto.

## 1. Crear misión (compacta)
1. Clasifica: sencilla, definida o compleja. Sigue la tabla de la sección 4 de GREMIO.md.
2. Lee `~/.gremio/estado.json` y anota `cupoAntes` (el % de 5 h). Si no existe, no pongas el campo.
3. Elige 2–4 notas de la bóveda: el `_brief.md` del proyecto y las notas concretas. Ese es el cofre.
4. Escribe el plan **solo del tipo sugerido** en `<proyecto>/gremio/misiones/M-XXX.md`, con `misiones/PLANTILLA-mision.md`.
5. Publica la tarjeta en el tablero con `ArtifactData`: `set proyectos/<slug>/misiones/<M-XXX>` con el formato de la sección 6.1 de GREMIO.md. El número sigue al último del sandbox. Si el sandbox tiene tarjetas completadas, archívalas en el mismo `batch`: `set completadas/<slug>-<id>` con su resumen, `proyecto` y `proyectoId`, y luego `delete proyectos/<slug>/misiones/<id>`.
   Además, `update gremio/estado` con `{cinco_h, semanal, actualizado}` copiados de `~/.gremio/estado.json`, para que el tablero muestre el cupo.
6. Copia el mismo estado en `~/.gremio/mision.json` y en `Gremio/Tablero.md` de la bóveda.
7. Al chat, en 2–3 líneas: qué propones y «ajusta la tarjeta y pulsa Confirmar».

## 2. Al recibir «CONFIRMADA»
- El aviso dice el sandbox y la tarjeta: **actúa solo si es tu sandbox** (`sandbox … (<slug>) · tarjeta M-XXX`).
- El aviso trae el tipo, el equipo, Astra, los pasos con modelo propio, la estimación y las notas. **No releas la misión**, salvo «Especificación editada: sí».
- Si el aviso no te llega, Iván escribirá «empezar» en tu chat: entonces lee `proyectos/<slug>/misiones/<M-XXX>` una vez.
- Si el tipo confirmado es distinto del sugerido, escribe ahora el plan de ese tipo.
- Pon `estado: trabajando`, `paso: 0` e `inicio` (ISO), con `if_version`.

## 3. Ejecutar
- Cada pieza de Codex lleva un contrato de nivel 3 (`PROMPTS.md`) que apunta a su hito del archivo de plan:
  `/codex:rescue --model <modelo> --effort <esfuerzo> --background <contrato>`; luego `/codex:status` y `/codex:result`.
- Al cambiar de paso, actualiza `paso` y, si hay datos reales, `tokens`, en `proyectos/<slug>/misiones/<M-XXX>`, en `mision.json` y en `Tablero.md`. Aprovecha para actualizar `gremio/estado`.
- Pide la revisión cruzada en una línea: «¿Revisión? Sugerido: Sonnet 5.5 medium · sí / otro / no».

## 4. Cerrar
- Pon `estado: completada` y el `resultado` (qué se hizo, qué se probó con su salida, qué falta), junto con el tiempo real, el % real y los tokens.
- Propón 0–3 aprendizajes; si Iván los aprueba, actualiza `Proyectos/<X>/aprendizajes.md`.
- Recuerda a Iván que la siguiente misión empieza en una sesión nueva.

## 5. Relevo
Si el cupo entra en reserva: deja el archivo de plan al día (progreso y siguiente paso) y dile a Iván «abre Codex y di: continúa la misión M-XXX».

## 6. Bóveda (solo el chat madre)
- El sandbox `boveda` muestra el resumen de `gremio/boveda`. Actualízalo cuando Iván diga «actualiza la bóveda en el tablero» o tras cerrar una tarjeta que cambie la bóveda:
  `{ "nombre": "<bóveda>", "notas": <número de .md>, "proyectos": [{ "nombre", "brief": true|false }], "aprendizajes": [{ "texto", "proyecto", "fecha" }] (los 6 más recientes, una línea cada uno), "decisiones": [{ "texto", "proyecto" }] (vigentes, una línea), "actualizado": ISO }`.
- Solo títulos y frases cortas: nunca contenido completo ni datos sensibles.
- Las tareas de la bóveda (ordenar, resumir, unir notas) son tarjetas en `proyectos/boveda/misiones/<M-XXX>`.
