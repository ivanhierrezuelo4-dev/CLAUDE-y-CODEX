# Decisiones de la primera edición

## Una oficina local primero

Los proyectos y las herramientas de Iván están en su ordenador. El servidor escucha solo en loopback. No se usa un backend remoto, registro de cuentas, Docker ni una clave propia para abrir la oficina. La app guarda documentos privados fuera del historial Git.

## Contexto recuperable, no contexto acumulado en cada llamada

El contexto importado se fragmenta con solapamiento y se indexa con FTS5, separando proyectos. Los términos de consulta se normalizan; los documentos fijados se incorporan completos. Se seleccionan coincidencias dentro de un límite estimado. El usuario puede inspeccionar el texto exacto. Si el material fijado excede el límite, la preparación falla con una explicación.

Limitación deliberada: la búsqueda inicial es léxica. Puede omitir sinónimos o contexto relevante con otro vocabulario. Se muestran avisos; el usuario puede fijar documentos o reformular. No se afirma que esta selección preserve automáticamente toda la calidad de una bóveda completa. El presupuesto es una aproximación y no limita contexto interno del proveedor, lecturas de herramientas ni salida.

Cada paquete registra hashes de documentos. Si una fuente seleccionada cambia antes de ejecutar, se requiere preparar otra petición. La búsqueda y la preparación no llaman a modelos.

## Integración por adaptadores

Cada proveedor expone estado y una ejecución de consulta. Se lanzan procesos sin shell, con texto por stdin y un máximo de tres minutos. Solo se ejecuta una consulta por proyecto a la vez. No hay bucles automáticos de revisión. Al detener una ejecución puede existir consumo parcial. Al reiniciar, las ejecuciones antiguas quedan interrumpidas, nunca aprobadas por defecto.

Los tests inyectan ejecutores: validan estados y resultados, no el servicio externo. La sesión de suscripción se comprueba separadamente sin revelar valores. Los CLI de versiones no reconocidas se mantienen como pendientes. La elegibilidad de Claude para una interfaz personalizada se debe confirmar antes del uso real.

## Permisos de la edición actual

Claude responde sin herramientas ni MCP. Codex usa sandbox de solo lectura y no carga la configuración global del usuario. Ambos pueden producir planes y revisiones; el dashboard no convierte esos planes en implementaciones automáticamente. La siguiente fase deberá definir carpetas editables, operaciones permitidas, verificación e integración sin afectar cambios del usuario.

No hay adopción de modelos por los nombres de la transcripción ni sustitución automática de cuentas al alcanzar límites.

## Memoria abierta

Se usa SQLite para el estado operativo y el contenido importado. La exportación de documentos genera una carpeta de Markdown para Obsidian. Esto evita mantener dos fuentes de verdad. Obsidian no es obligatorio. La sincronización de cambios externos se incorporará solo con reglas para conflictos y revisión.

## Validación en el PC

Antes de ampliar a ejecución autónoma: comprobar Node 24, lanzador de su sistema operativo, CLI actuales, condiciones de uso, sesión, una consulta real autorizada y calidad de recuperación con documentos reales. Después medir tiempo total, intervención, correcciones y consumo comunicado sobre tareas representativas. El criterio es trabajo útil con menos repetición, sin sacrificar resultados.
