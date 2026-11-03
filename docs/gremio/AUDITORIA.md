# Gremio · Autoauditoría de ahorro y optimización

Fecha: 3 nov 2026. Estado: **demo del tablero terminada; el sistema real aún no está instalado.**

## Qué hace bien

| Área | Por qué ahorra o evita trabajo |
|---|---|
| Rutas por tipo | Sonnet es la base; Opus solo en complejas; Haiku y Luna solo en tareas mecánicas. La mayor parte del gasto se va a Sonnet y Sol, que son los equilibrados. |
| Tú decides | El tipo viene sugerido y cambiarlo cuesta 0 tokens. Nada empieza sin «Confirmar». |
| Astra | Desactivada por defecto, con aviso de coste y solo para una pieza. |
| Revisión cruzada | Una por misión, como máximo 2 correcciones, y solo si la pides. |
| Contratos | Las plantillas por nivel (`PROMPTS.md`) reducen el retrabajo, que es el gasto escondido más grande. |
| Memoria | El cofre muestra solo las notas de esa misión; el resto de la bóveda no se lee. El Salón no es contexto. |
| Ahorradores | Caveman nunca va en prompts entre agentes. RTK se mide antes de decidir. |
| Tarjeta | Editar en la tarjeta no gasta cupo de Claude. Confirmar avisa a Claude con un resumen corto. |
| Relevo | Hay umbrales de reserva y el plan sirve de traspaso a Codex. |

## Qué no hace bien todavía, o gasta de más

| # | Problema | Coste aproximado |
|---|---|---|
| 1 | Cada misión que crea Claude incluye el plan de los **3 tipos** y la especificación completa: unos 5–7 KB de salida. | ~1,5–2k tokens de salida por misión; los planes alternativos son ~35 % de eso y casi nunca se usan. |
| 2 | Al confirmar, Claude vuelve a **leer la misión entera** para ver tus notas y cambios. | ~2k tokens de entrada por misión. |
| 3 | La **especificación**, el **contrato** y el **plan vivo** son tres textos que se pisan. | Escribir dos veces lo mismo. |
| 4 | Una misión **sencilla** con tarjeta puede costar más que la tarea. | Tarjeta + lectura ≈ lo que cuesta hacer el cambio. |
| 5 | **Republicar la página** del tablero cuesta mucho: pesa 115 KB. | ~30k tokens por publicación. Solo pasa mientras la diseñamos. |
| 6 | Los **tokens y el cupo son simulados**: la fórmula de estimación es una suposición. | Sin datos reales no se puede afinar. |
| 7 | Si Claude se queda sin cupo, **Codex no puede actualizar la tarjeta**: solo Claude escribe en ella. | El relevo funciona, pero la tarjeta se queda quieta. |
| 8 | Las **conversaciones largas** de Opus arrastran contexto. | Cada turno relee todo; compactar también cuesta. |
| 9 | El **progreso** se actualiza paso a paso con llamadas sueltas. | Poco por llamada, pero cada turno extra relee contexto. |

## Cambios propuestos (por impacto)

1. **Misión compacta:** Claude escribe solo el plan del tipo sugerido y una especificación corta. Si cambias el tipo, la tarjeta usa plantillas genéricas, y solo al confirmar otro tipo Claude escribe ese plan. *Ahorro: ~40–50 % de la salida por misión.*
2. **Confirmar lo envía todo:** el aviso incluye tus notas y los cambios por paso, así Claude no relee la misión. Solo la lee si editaste la especificación. *Ahorro: ~2k de entrada por misión.*
3. **Un solo documento:** especificación = contrato = plan vivo, en un archivo del proyecto o de la bóveda (estilo ExecPlan). La tarjeta muestra un resumen y enlaza a él. *Evita escribir dos veces lo mismo y es lo que Codex necesita para el relevo.*
4. **Umbral de tarjeta:** las tareas de menos de ~10 min van sin tarjeta, salvo que la pidas.
5. **Congelar el diseño del tablero:** a partir de aquí cambian datos, no la página. Cada misión cuesta ~1–2k tokens, no 30k.
6. **Datos reales:** un script de barra de estado guarda el % de 5 h, el semanal y los tokens de Claude, y la tarjeta los muestra. Codex: comprobar en la instalación cómo leer su uso; si no hay forma, poner el dato a mano con `/status`.
7. **Tablero espejo en Obsidian** (Markdown + Bases) para que Codex también pueda marcar el avance cuando Claude esté en reserva.
8. **Higiene de sesión:** una sesión por misión, `/compact` en los hitos y subagentes solo para trabajo paralelo.
9. **Actualizaciones agrupadas:** Claude escribe en la tarjeta solo al cambiar de paso; unas 4–6 escrituras por misión.
10. **Calibrar:** tras 5 misiones reales, comparar lo estimado con lo real y ajustar la fórmula.

## Ya aplicado (3 nov 2026)

- **Misión compacta:** la M-003 pesa 2,7 KB frente a 5,4 KB de la M-002 (−50 %). Solo trae el plan del tipo sugerido.
- **Confirmar lo envía todo:** el aviso incluye las notas de Iván y si editó la especificación.
- **Fluidez:** se quitaron los filtros animados, la capa de rayas a pantalla completa y las animaciones que movían `left`. Se redujeron las partículas y las animaciones se pausan si la pestaña no se ve. Prueba: ~60 fps.
- **Diseño congelado** desde aquí, salvo cambios que pida Iván.
- Todo lo demás está documentado en `GREMIO.md` para la instalación.

## Qué falta para que sea «completo»

- Instalación real: `AGENTS.md` y `CLAUDE.md` del Gremio, la skill, los scripts de barra de estado y del hook, y la plantilla de misión compacta.
- Brief de instalación por proyecto (Roblox, Pragmat, micro-SaaS).
- Comprobar en tu cuenta los modelos disponibles (`/model`) y si `/codex:review` deja elegir modelo.
- Encontrar la carpeta de tu bóveda de Obsidian.
- Piloto con una misión real de cada tipo.
