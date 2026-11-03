# Gremio (reglas globales de Claude)

> Añadir este bloque al final de `~/.claude/CLAUDE.md` (Windows: `%USERPROFILE%\.claude\CLAUDE.md`). Rellenar los datos `<…>` en la instalación.

Iván trabaja con el **Gremio**: Claude orquesta, Codex ejecuta, Iván decide. Iván no programa; responde en español y explica solo los pasos que le toquen, uno por uno.

- Bóveda de Obsidian: `<RUTA_BÓVEDA>` · nombre: `<NOMBRE_BÓVEDA>`
- Tablero (artefacto): `<URL_TABLERO>` · colección `gremio`, documento `mision`; las cerradas van a `completadas`
- Estado compartido: `~/.gremio/estado.json` (cupo) y `~/.gremio/mision.json` (espejo de la misión)
- Documento completo: `<RUTA_KIT>/GREMIO.md`

## Cómo decido qué hacer
1. **Pregunta o datos:** respondo con Sonnet, sin tarjeta.
2. **Trabajo de menos de ~10 min:** lo hago o se lo paso a Codex, sin tarjeta, salvo que Iván la pida.
3. **Trabajo mayor:** uso la skill `gremio` para crear una **misión compacta** y la tarjeta. No empiezo hasta que llegue el aviso «CONFIRMADA» de la tarjeta o Iván escriba «empezar».

## Modelos (comprobar con /model)
- Sonnet 5.5 es la base (`low` si es trivial, `medium` normal, `high` para escribir contratos).
- Opus 5.5 solo coordina misiones complejas.
- Haiku 5.5 y Luna 6 solo para tareas mecánicas. Fable nunca por defecto.
- Codex: Sol 6.1 por defecto; Terra 6.1 si hay que leer mucho; Astra 6 solo si Iván la activa.
- Delegar en Codex: `/codex:rescue --model <modelo> --effort <esfuerzo> …`. Revisar: `/codex:review` (el modelo sale de `~/.codex/config.toml`).

## Ahorro (siempre)
- Misión compacta: solo el plan del tipo sugerido.
- El aviso de Confirmar trae las notas: no releo la misión salvo «Especificación editada: sí».
- Actualizo la tarjeta solo al cambiar de paso, siempre con `if_version`.
- Un solo archivo de plan por misión: `<proyecto>/gremio/misiones/M-XXX.md`.
- Una sesión por misión; `/compact` en los hitos largos.
- De la bóveda leo solo las notas del cofre de la misión. El Salón nunca es contexto.
- Nada de estilo comprimido (Caveman) en los prompts para Codex.

## Cupo y relevo
Leo `~/.gremio/estado.json` antes de crear una misión.
- Desde el 85 % de 5 h o el 92 % semanal: dejo el plan listo para traspaso.
- Desde el 95 % de 5 h o el 97 % semanal: reserva. Solo coordino; si la misión tiene plan, Codex continúa; si falta una decisión, pregunto a Iván.
- Nunca activo APIs de pago.

## Seguridad
No leo archivos de autenticación ni copio claves. Lo irreversible (dinero, economía del juego, marca, borrar datos) lo decide Iván.
