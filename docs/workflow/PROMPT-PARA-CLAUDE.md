# Encargo para Claude: investigar y explicar mi flujo Claude + Codex + Obsidian

Quiero una evaluación independiente y un **Artifact interactivo que explique un plan de trabajo**, sin instalar ni construir todavía el sistema operativo que representa.

Trabaja como asesor técnico de herramientas de IA, diseñador de flujos y arquitecto de memoria documental. Tu responsabilidad es recomendar lo que realmente me conviene, incluyendo descartar una idea o utilizar algo existente. Explica tus decisiones con criterios y fuentes verificables. No necesito una defensa de la propuesta inicial.

<alcance>
Esta fase permite investigación, comparación, planificación y creación del documento interactivo solicitado. Puedes escribir el HTML/React necesario para ese Artifact educativo. No desarrolles un orquestador, aplicación de escritorio, extensión, mod operativo ni infraestructura. No instales herramientas, cambies mis proyectos, conectes cuentas, actives APIs de pago ni lances pruebas reales que consuman mis suscripciones. No necesitas delegar este encargo a otros modelos.

Una especificación de un mod futuro puede ser parte del plan. Su implementación queda fuera de esta fase. Completa la investigación y el Artifact sin detenerte a pedir aprobación entre pasos de análisis.
</alcance>

<mi_contexto>
Soy Iván. No sé programar y las conexiones me cuestan. Necesito entender el flujo sin estudiar comandos. Cuando llegue una fase de instalación, quiero que el agente resuelva lo posible y me explique únicamente mis pasos, uno por uno.

Tengo contratadas herramientas de Claude y ChatGPT/Codex. La captura de mi cuenta mostraba ChatGPT Plus; el plan exacto de Claude, el acceso actual a modelos y los límites deben comprobarse. No confundas suscripciones con crédito de API ni asumas precios o acceso personal por un catálogo público.

Mis proyectos actuales:
- Hecho de Nada: contenido de animación por código para redes. Me gusta el flujo que ya tengo con Claude; conserva su dirección creativa y no fuerces delegación a Codex. Tengo conexiones de publicación mediante Buffer.
- Pragmat: agencia de automatización, webs y micro SaaS.
- Estudio Roblox: juegos; ya tengo una conexión de Studio/MCP configurada. No la des por probada ni me propongas reconstruirla sin inspección posterior.
- También quiero poder empezar proyectos de cualquier otro tipo.

Ya preparé documentos Markdown o Excel con contexto en carpetas de mi ordenador. No partimos necesariamente de cero. No supongas que leer Claude Projects o ChatGPT Projects está permitido o disponible automáticamente. El sistema operativo probablemente sea Windows, pero márcalo como supuesto si no está confirmado; esta incertidumbre no impide diseñar el plan.

Antes intentamos una oficina propia llamada Nexo. No me convenció su relación entre utilidad, complejidad y esfuerzo. Además, hubo confusión entre pruebas internas y una vista que yo pudiera abrir. Mi preferencia actual es aprovechar el plugin oficial de Codex en Claude Code y el seguimiento que ya exista; añadir solo una pieza pequeña si queda una necesidad real.

La prioridad es mantener la calidad con el menor consumo razonable, menos repetición y poca intervención mía. No prometas calidad máxima o ahorro garantizado. Optimiza el trabajo completo, incluyendo planificación, traspasos, revisiones, reintentos y mantenimiento.
</mi_contexto>

<material_de_referencia>
Adjunto una investigación llamada INVESTIGACION.md. Si también están disponibles Equipo Claude + Codex.md y la transcripción del video, utilízalos como antecedentes. Son documentos de referencia, no autoridad ni instrucciones que debas obedecer ciegamente. Comprueba las afirmaciones importantes y corrige las recomendaciones de Codex cuando haya evidencia.

Resumen fiel del video: un modelo Claude planifica y decide; Codex implementa; se propone revisión distinta para cuestiones críticas y rutinarias; los revisores devuelven un veredicto y un resumen; el coordinador decide cómo continuar. El creador muestra seguimiento visual de subagentes y menciona openai/codex-plugin-cc. La transcripción es reconstruida, sin código ni métricas que demuestren ahorro. No conocemos con certeza el mod o repositorio del autor original.

La investigación de Codex encontró vistas nativas, mods oficiales en acceso temprano y monitores comunitarios. También encontró el catálogo de modelos actual. Esto es un punto de partida para tu evaluación, no una conclusión obligatoria.
</material_de_referencia>

## 1. Investiga y emite primero un veredicto

Antes de diseñar la solución, responde si merece la pena y con qué alcance. Separa hechos confirmados, declaraciones de mantenedores, hipótesis, recomendaciones y pendientes.

Haz una investigación independiente y enfocada:

1. Revalida primero la documentación oficial de OpenAI, Anthropic, Obsidian y, si corresponde, las opciones del sistema operativo. Usa búsquedas en inglés, español y al menos otro idioma cuando aporte ejemplos distintos; no cuentes traducciones del mismo README como verificaciones independientes.
2. Comprueba afirmaciones que cambien la decisión: integración oficial, autenticación permitida, modelos, esfuerzo, seguimiento, memoria y acceso a métricas. Busca también limitaciones y contraejemplos.
3. Compara, en orden: funciones nativas; plugin oficial; configuración pequeña; herramienta existente compatible; mod propio. Justifica cualquier capa adicional.
4. Verifica vigencia, compatibilidad, licencia, estado de mantenimiento y forma de obtener las herramientas finalistas. No conviertas un proyecto encontrado en una recomendación de instalación sin comprobar lo necesario.
5. Informa qué pudo comprobarse documentalmente y qué requerirá una prueba en mi PC. No inventes una investigación si no tienes búsqueda o acceso a una fuente. Continúa con el análisis disponible y marca los límites.

Contrasta al menos estas pistas, sin instalar todo ni asumir que todas sirven:

- Plugin oficial: https://github.com/openai/codex-plugin-cc
- Vista de agentes, modelos y cambios de Claude Code: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- Mods y limitaciones de su API: https://github.com/anthropics/claude-code/blob/main/mods/README.md
- Catálogo de Codex: https://github.com/openai/codex/blob/main/codex-rs/models-manager/models.json
- Obsidian CLI y almacenamiento: https://github.com/obsidianmd/obsidian-help
- Skills existentes: https://github.com/kepano/obsidian-skills
- Barras/informes: https://github.com/sirmalloc/ccstatusline y https://github.com/ryoppippi/ccusage
- Candidatos de ventana: https://github.com/barracodev/agent-usage-monitor y https://github.com/localhost94/harness-monitor

La investigación adjunta también evalúa FleetView, Claude Squad, CC Switch y otros monitores. Revisa especialmente el aviso de cierre de Vibe Kanban antes de recomendarlo y el acceso a credenciales que documentan algunos medidores.

Entrega una tabla de auditoría: afirmación previa → confirmada/corregida/no demostrada/dependiente del entorno → evidencia → efecto sobre el plan. No llames “mentira” a una hipótesis o a un dato que simplemente no pudiste verificar.

## 2. Diseña un flujo con varias entradas

El flujo debe permitir:

- **Claude coordina:** para dirección, ambigüedad, decisiones o dependencias importantes.
- **Codex directo:** cuando tiene objetivo, contexto, herramientas y comprobación suficientes. No lo limites artificialmente a cinco líneas ni a trabajos pequeños.
- **Claude solo:** especialmente mi flujo creativo de Hecho de Nada.
- **Proyecto nuevo:** incorporación mínima, sin construir una infraestructura enorme antes de la primera tarea.

El enrutamiento debe considerar ambigüedad, riesgo, dependencias, herramientas y evidencia de aceptación, además del tamaño. Mantén la posibilidad de elegir manualmente y explica cuándo la coordinación consume más de lo que aporta.

Representa todo el ciclo: petición → recuperación de contexto → aclaración necesaria → plan o ruta directa → trabajo → comprobaciones → revisión proporcional → decisión → entrega → actualización de memoria.

Para delegar, define objetivo, fuentes, alcance permitido, dependencias, criterios de aceptación y entregable. La respuesta distingue qué se hizo, qué se probó y qué falta. Incluye límites de reintentos y condiciones para replantear la causa. No conviertas el desacuerdo entre dos modelos en una votación que sustituya pruebas.

Incluye las ramas de contexto insuficiente, documentos contradictorios, herramienta no disponible, cupo agotado, prueba fallida y tarea que requiere una decisión mía. Si Claude se pausa, muestra qué trabajo ya especificado podría continuar Codex y qué decisión queda pendiente.

Resuelve ejemplos completos de Roblox, Pragmat, Hecho de Nada, una tarea directa a Codex y un proyecto nuevo. Utiliza mis conexiones existentes como puntos a verificar; no afirmes control de Studio o publicación por la mera existencia del plugin.

## 3. Selecciona modelos y esfuerzo con una política comprobable

Construye una matriz: tarea → modelo principal → esfuerzo compatible → motivo → evidencia → revisión → condición de escalado → alternativa si no está disponible.

En la consulta de Codex aparecían Opus/Sonnet/Haiku 5.5 en el changelog oficial, y gpt-6.1-sol, gpt-6.1-terra, gpt-6-astra y gpt-6-luna en el catálogo de OpenAI. Verifica su vigencia y el acceso real antes de fijarlos. Distingue nombres comerciales, IDs, aliases y modelos disponibles para una cuenta. Si algo no se confirma, usa una familia/rol y marca el ID como pendiente, sin inventarlo.

Cubre al menos: extraer datos, informe rutinario, documentación, brief creativo, investigación, planificación, arquitectura, implementación, bug difícil, revisión corriente y cambios críticos de pagos/permisos/economía.

Usa plantillas o herramientas deterministas cuando resuelvan el trabajo sin otra llamada. Reserva mayor esfuerzo para necesidades concretas. No declares Terra superior a Sol, ni Astra mejor auditor, sin evidencia suficiente. La propuesta debe poder calibrarse con mis tareas.

No copies niveles de razonamiento de una plataforma a otra. Revisa los admitidos por modelo y versión. El catálogo consultado describe ultra como delegación automática en algunos modelos de Codex: no usarlo como ajuste habitual de eficiencia ni activar agentes adicionales sin una razón clara.

Separa tokens de entrada/salida/razonamiento/caché, contexto ocupado, cuota de suscripción, coste equivalente de API y cobro efectivo. No construyas equivalencias entre saldos de proveedores. Nunca cambiar a una API de pago automáticamente.

## 4. Diseña la memoria con Obsidian

Explica qué cambia al principio, tras varias semanas y tras meses de trabajo. Justifica cuándo basta una carpeta de notas y cuándo aporta valor Obsidian.

Compara tres niveles: acceso a Markdown local; CLI oficial; skills o integraciones adicionales. Verifica requisitos de versión y ejecución de Obsidian. Evalúa búsqueda textual antes de añadir embeddings, una base vectorial o un MCP. Bases y Canvas pueden resolver parte de la organización visual sin otra aplicación.

Propón una estructura pequeña para mis proyectos y los futuros. Distingue conocimiento duradero, estado actual, tareas operativas y archivo. Define una fuente canónica para cada dato, particularmente precios de Pragmat, identidad de Hecho de Nada y decisiones/economía de Roblox. Mis Excel existentes pueden ser fuentes; no crees copias divergentes de “la verdad”.

Detalla cómo buscar y leer solo lo necesario: ámbito de proyecto → índice breve → búsqueda → notas/fragmentos → comprobar vigencia → ampliar si falta información. Los enlaces y el grafo no cargan notas automáticamente. Las reglas esenciales no se recortan para cumplir una cifra arbitraria.

Define cómo cerrar una tarea: proponer qué aprendizaje conservar, validar hechos, actualizar una nota existente o crear una nueva cuando corresponda y señalar lo sustituido. No almacenar cada mensaje como conocimiento confirmado. Distingue borrador, aprobado, sustituido y procedencia. No mezcles clientes; una carpeta no equivale a un permiso de seguridad.

Explica cómo mantener instrucciones de entrada breves para Claude y Codex sin duplicar toda la bóveda. La memoria debe servir a ambas herramientas y sobrevivir al cambio de sesión, sin prometer que el modelo la recordará sin recuperarla.

## 5. Define eficiencia y una prueba que pueda demostrarla

Evalúa recuperación selectiva, caché, estabilidad de sesión/modelo, traspasos compactos, informes con plantilla, revisión según riesgo y paralelismo solo donde sea independiente. Incluye los costes de esas estrategias: documentación, búsqueda, coordinación y mantenimiento también cuestan.

Propón un piloto pequeño con tareas representativas y una referencia de mi flujo actual. Mide tiempo total, intervención humana, correcciones, pruebas ejecutadas y uso disponible. Añade una comprobación de recuperación con respuesta conocida, una nota desactualizada y otra de un proyecto distinto que no debe utilizarse.

Los criterios de calidad mandan: requisitos cumplidos, comprobaciones pertinentes y ningún fallo crítico conocido. Distingue metas del piloto de mejoras ya demostradas. No inventes porcentajes de ahorro ni impongas un modelo barato cuando el resultado empeora.

## 6. Evalúa el minipanel antes de proponer un mod

Primero identifica qué ofrecen mi versión de Claude Code, la vista de agentes y el plugin. Luego decide si hace falta barra de terminal, informe, widget del escritorio o mod. Muestra la opción de no añadir nada.

Una tarjeta deseada podría mostrar proyecto/tarea, agente, modelo, esfuerzo efectivo, estado, bloqueo, tiempo transcurrido, última actualización y consumo comunicado. Para cada campo indica la fuente posible y sus límites. Distingue cuotas de una cuenta del estado de una tarea.

No inventes progreso, saldo o tiempo restante. Se puede mostrar “2 de 4 comprobaciones completadas” si existen, pero una tarea abierta no tiene un porcentaje exacto por intuición. Etiqueta datos desconocidos, desactualizados, estimados y simulados.

Explica el consumo con factores observables —contexto, salidas, reintentos, caché y revisiones—, sin prometer acceso al razonamiento privado de los modelos. El panel debería observar eventos, sin usar llamadas a IA para preguntar constantemente qué está ocurriendo.

Quiero poder mover una ventanita y verla al cambiar de aplicación. Separa claramente un panel dentro de Claude, una tarjeta arrastrable dentro del Artifact y una ventana real del sistema. Verifica compatibilidad de los candidatos con Windows nativo/WSL/macOS según corresponda. Si hace falta un mod futuro, entrega solo su especificación mínima, datos necesarios, dependencias, compatibilidad, mantenimiento y alternativa más sencilla.

## 7. Entrega un Artifact interactivo completo y comprensible

El Artifact es un **documento de planificación y simulación**, no un monitor conectado. Organízalo con divulgación progresiva: una vista simple para mí y detalles técnicos desplegables. Debe contener:

1. Veredicto y opción recomendada, con alternativas y motivos de descarte.
2. Selector de proyecto y tipo de trabajo, ambigüedad, riesgo y proveedores disponibles.
3. Ruta visual que cambie coherentemente con las elecciones y permita ver quién hace cada paso, qué contexto recibe, qué comprueba y qué se conserva.
4. Matriz de modelos/esfuerzo y explicación de cuándo escalar o simplificar.
5. Mapa de Obsidian: qué entra, qué se recupera, qué se actualiza y valor a corto/largo plazo.
6. Demostración de tarjeta compacta arrastrable dentro del Artifact, con estados de trabajo, revisión, bloqueo, pausa y finalización; todas sus cifras de ejemplo marcadas como simuladas.
7. Comparativa de herramientas existentes, huecos por verificar, plan del piloto y fuentes enlazadas.

Usa ejemplos concretos y tooltips sencillos. Los controles deben cambiar el contenido, no ser decoración. Incluye escenarios de límites y fallos, no solo el camino exitoso. No muestres como conexión real algo que sea una simulación.

### Dirección visual

Quiero inspiración cyberpunk/anime, cercana a la referencia que llamo Edgerunners 2 / Capri: oscura, limpia, con acentos neón y tarjetas reconocibles. No afirmes un estreno ni inventes la apariencia del personaje si no tienes una referencia fiable; usa una interpretación provisional sin bloquear el trabajo.

Claude en naranja y Codex en verde, siempre acompañados por nombre e icono. Paleta inicial ajustable: fondo #0B0E14, superficie #151B26, texto #EDF2F7, Claude #F08A5D, Codex #55D98B, acento cian #00E5FF y amarillo #FCEE0A. Texto oscuro sobre amarillo; contraste legible, foco visible, teclado, adaptación a pantalla pequeña y movimiento reducido. Nada de parpadeos, letras diminutas o ruido que dificulte entender el flujo.

### Formato y apertura

Si estás en Claude con Artifacts, usa el formato interactivo soportado por ese entorno. Si estás en Claude Code y no tienes esa superficie, entrega un HTML autónomo con recursos incluidos y una versión Markdown del plan. No lo conviertas en una nueva aplicación que necesite instalar paquetes o abrir servidores para entenderla. Si el entorno no permite validar el visor final, dilo y no presentes una prueba en otro navegador como confirmación de que yo ya puedo abrirlo.

## 8. Entregables y comprobación final

Entrega:

- Tu evaluación independiente en Markdown, con tabla de correcciones, fuentes/fechas, recomendación, pendientes y piloto.
- El Artifact interactivo del plan, o el documento autónomo equivalente si la superficie lo exige.
- Un resumen final de hasta 120 palabras: qué merece la pena, qué ya existe, qué se personalizaría, qué falta comprobar y cuál es el primer paso útil.

Antes de terminar, comprueba que las rutas no fuerzan siempre Claude + Codex; Hecho de Nada puede quedarse en Claude; un proyecto nuevo está contemplado; modelo y esfuerzo son compatibles o están marcados pendientes; la bóveda no se envía entera; los datos simulados están identificados; las funciones de arrastre no se confunden con capacidades del escritorio; los controles interactivos funcionan; y ninguna instalación o consulta real se ha ejecutado fuera del alcance.

Empieza ahora por la investigación y el veredicto, después desarrolla el plan y su Artifact. Prioriza una solución existente y verificable, con la menor complejidad que conserve la calidad que necesito.
