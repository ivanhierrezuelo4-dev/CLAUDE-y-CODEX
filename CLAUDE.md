# Nexo: instrucciones para Claude Code

Nexo es la oficina personal de Iván. Él no programa: resuelve la instalación y explica únicamente las acciones que necesiten su intervención, una por una. Lee README.md y AGENTS.md antes de actuar.

## Objetivo y preferencias

- Proyectos ilimitados en concepto (no restringir la interfaz a los tres iniciales).
- Claude coordina por preferencia del usuario. Codex es un colaborador capaz de ejecutar, investigar, diseñar propuestas y revisar; no hay un límite artificial de cinco líneas.
- Hecho de Nada empieza en modo solo Claude; no cambies esa preferencia sin pedirlo.
- Prioridad: calidad, con el menor contexto necesario. No prometas ahorros automáticos; revisa fuentes y mide uso cuando esté disponible.
- El usuario ya preparó contexto en documentos MD o Excel en carpetas de su PC. Ayúdale a importarlo desde Memoria. No supongas acceso al contexto de Claude Projects o ChatGPT.
- Studio/MCP y Buffer pueden estar ya configurados: preserva su configuración y confirma el estado sin leer ni imprimir secretos.

## Preparación local

1. Usa el checkout existente; no crees un worktree salvo petición explícita. Comprueba cambios antes de actualizar.
2. Detecta Node.js 24. Si falta, prepara la instalación desde la distribución oficial con verificación normal. No desactives TLS ni verificaciones.
3. Ejecuta `npm ci`, `npm run check` y `npm run doctor` desde este directorio.
4. Inicia `npm start`; comprueba `/api/health` y una operación representativa de proyecto/documento. Guarda datos de prueba en un proyecto aparte.
5. En Windows, comprueba `Abrir-Nexo.cmd`. En macOS, `Abrir-Nexo.command`. Los lanzadores Windows/macOS se proporcionan, pero aún requieren validación en esa plataforma.
6. Abre la interfaz local y explica dónde crear proyectos e importar contexto. No expongas el servidor a Internet.
7. Comprueba las CLI oficiales y sus sesiones. El inicio de sesión lo hace el usuario en el flujo oficial; no leas archivos de autenticación ni copies valores.
8. Antes de habilitar Claude dentro de esta interfaz, verifica las condiciones y modalidades vigentes de Anthropic. La integración técnica no demuestra autorización contractual. No uses claves API ni alternativas de cobro por tu cuenta.
9. Con autorización para consumir cupo, realiza una consulta corta de solo lectura por proveedor, confirma la respuesta y su estado. Si no se puede, informa el bloqueo concreto. No simules una conexión.

## Límites de esta entrega

La aplicación organiza, busca memoria, prepara peticiones y tiene adaptadores de consulta de solo lectura. No realiza aún delegación autónoma de implementación, no controla Studio/Buffer y no importa historiales de Projects. La exportación Markdown es compatible con Obsidian; no es sincronización bidireccional. Cada petición es independiente del historial salvo el contexto que incluya explícitamente.

## Entrega al usuario

Déjalo abierto, con instrucciones sencillas para volver a abrirlo. Si has usado documentos reales, conserva `.nexo/` y no los incluyas en commits. No pidas a Iván que resuelva comandos que puedas ejecutar tú.
