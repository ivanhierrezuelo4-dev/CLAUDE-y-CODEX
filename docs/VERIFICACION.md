# Verificación de la primera edición

Ejecutada en Linux, con Node.js 24 y Chromium del entorno.

## Comprobado

- Instalación reproducible con `npm ci --prefer-offline --no-fund`.
- Compilación de TypeScript y build de producción con Vite.
- 19 pruebas de backend y adaptadores aprobadas, sin pruebas omitidas.
- 3 recorridos de navegador aprobados: proyecto nuevo y memoria, Excel con dos hojas y exportación, navegación móvil y búsqueda.
- Las peticiones preparadas no ejecutan modelos. La consulta permanece bloqueada mientras los permisos estén desactivados.
- Contexto aislado por proyecto; actualización del índice; documentos fijados; exceso de presupuesto visible; detección de cambios de memoria antes de enviar.
- Estados de ejecución, revisión y aprobación; segunda opinión preparada; guardado idempotente de resultados aprobados en memoria; concurrencia y cancelación.
- Transporte literal por stdin con una CLI de prueba; UTF-8 y eventos sin salto de línea final.
- Auditoría npm de dependencias de producción: sin avisos conocidos en el momento de la consulta. Esto no constituye una garantía de seguridad futura.

## Pendiente de comprobación en el ordenador de Iván

- Lanzadores nativos de Windows/macOS.
- Instalación, versión y autenticación de su Claude Code y su Codex CLI.
- Elegibilidad y condiciones vigentes de la suscripción de Claude para esta interfaz personal.
- Una consulta real autorizada por proveedor y el consumo que comunique.
- Calidad de recuperación con sus documentos reales.
- Sus conexiones existentes con Studio/MCP y Buffer; esta edición no las controla.

Los tests usan ejecutores inyectados y una CLI falsa para probar el protocolo. No se han hecho llamadas reales a modelos ni se han utilizado las cuentas del usuario para producir resultados de prueba. Detectar una sesión de Codex en el entorno no valida el flujo completo en su PC.

La automatización de GitHub está configurada; una validación local no establece que un workflow remoto haya terminado.

## Vista web incrustada

Se añadieron dos pruebas del modo de demostración: rechaza bases de datos persistentes y bloquea guardado, consultas a modelos e inspección de sesiones. El conjunto pasa con 21 pruebas. Se sirve el build en el puerto 3000, separado de la oficina personal. La disponibilidad del botón de la plataforma necesita su ruta al puerto; una comprobación dentro de Chromium no verifica por sí sola ese botón externo.
