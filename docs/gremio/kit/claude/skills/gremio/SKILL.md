---
name: gremio
description: Crear, actualizar y cerrar misiones del Gremio (tarjeta del tablero, plan de misión, delegación a Codex, revisión cruzada y aprendizajes). Usar cuando Iván pida un trabajo de más de ~10 minutos, cuando llegue un aviso «Gremio · misión … CONFIRMADA» desde la tarjeta, o cuando diga «empezar», «cierra la misión» o «continúa la misión M-XXX».
---

# Skill: gremio

Lee las reglas de `~/.claude/CLAUDE.md` (bloque Gremio). Datos de la tarjeta y protocolo completo: `GREMIO.md`, secciones 6–8.

## 1. Crear misión (compacta)
1. Clasifica: sencilla, definida o compleja. Sigue la tabla de la sección 4 de GREMIO.md.
2. Lee `~/.gremio/estado.json` y anota `cupoAntes` (el % de 5 h). Si no existe, no pongas el campo.
3. Elige 2–4 notas de la bóveda: el `_brief.md` del proyecto y las notas concretas. Ese es el cofre.
4. Escribe el plan **solo del tipo sugerido** en `<proyecto>/gremio/misiones/M-XXX.md`, con `misiones/PLANTILLA-mision.md`.
5. Publica la misión en el tablero: `ArtifactData set` en `gremio/mision`, con el formato de la sección 6.1 de GREMIO.md. Si hay una misión anterior completada, primero copia su resumen a `completadas/<id>` en un `batch`.
6. Copia el mismo estado en `~/.gremio/mision.json` y en `Gremio/Tablero.md` de la bóveda.
7. Al chat, en 2–3 líneas: qué propones y «ajusta la tarjeta y pulsa Confirmar».

## 2. Al recibir «CONFIRMADA»
- El aviso trae el tipo, el equipo, Astra, los pasos con modelo propio, la estimación y las notas. **No releas la misión**, salvo «Especificación editada: sí».
- Si el tipo confirmado es distinto del sugerido, escribe ahora el plan de ese tipo.
- Pon `estado: trabajando`, `paso: 0` e `inicio` (ISO), con `if_version`.

## 3. Ejecutar
- Cada pieza de Codex lleva un contrato de nivel 3 (`PROMPTS.md`) que apunta a su hito del archivo de plan:
  `/codex:rescue --model <modelo> --effort <esfuerzo> --background <contrato>`; luego `/codex:status` y `/codex:result`.
- Al cambiar de paso, actualiza `paso` y, si hay datos reales, `tokens`, en el tablero, en `mision.json` y en `Tablero.md`.
- Pide la revisión cruzada en una línea: «¿Revisión? Sugerido: Sonnet 5.5 medium · sí / otro / no».

## 4. Cerrar
- Pon `estado: completada` y el `resultado` (qué se hizo, qué se probó con su salida, qué falta), junto con el tiempo real, el % real y los tokens.
- Propón 0–3 aprendizajes; si Iván los aprueba, actualiza `Proyectos/<X>/aprendizajes.md`.
- Recuerda a Iván que la siguiente misión empieza en una sesión nueva.

## 5. Relevo
Si el cupo entra en reserva: deja el archivo de plan al día (progreso y siguiente paso) y dile a Iván «abre Codex y di: continúa la misión M-XXX».
