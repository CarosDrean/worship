# Worship

Aplicacion local en espanol para gestionar cultos, ayunos, vigilias y otras actividades espirituales. El alcance funcional y las decisiones de producto viven en `ROADMAP.md`.

## Fuente de verdad

- Leer `ROADMAP.md` antes de planificar o implementar una funcionalidad.
- No adelantar funcionalidades posteriores ni modificar decisiones establecidas sin consultar al usuario.
- El MVP incluye actividades, calendario interno, asistencia, ayunos, vigilias, notas, reflexiones, dashboard basico, frases locales, persistencia JSON, exportacion/importacion y sincronizacion manual con un calendario de Google.
- Las decisiones ambiguas de producto, datos, UX o sincronizacion deben documentarse y preguntarse antes de implementarse.

## Stack y restricciones

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Persistencia: archivos JSON, sin base de datos.
- Autenticacion propia: no existe.
- Google Calendar: OAuth local, calendario seleccionado por el usuario y sincronizacion manual bidireccional.
- No hay despliegue externo ni sincronizacion automatica en segundo plano.
- La interfaz, errores, logs, comentarios y documentacion deben estar en espanol.
- No introducir una dependencia obligatoria de IA para generar frases.

Cuando se cree la estructura del proyecto, actualizar esta seccion con los comandos reales de desarrollo, build, validacion y los puertos definitivos. No inventar comandos mientras no existan en `package.json`.

## Reglas de datos

- Los datos de negocio deben pasar por una capa centralizada de lectura y escritura.
- Crear automaticamente los JSON faltantes con defaults validos.
- Escribir mediante archivo temporal y rename atomico; conservar backup cuando corresponda.
- Usar IDs unicos y fechas en un unico formato documentado.
- Validar importaciones antes de reemplazar datos existentes.
- No modificar JSON de trabajo para probar si puede usarse un directorio temporal.
- Si una prueba modifica datos, hacer copia, registrar el hash y restaurar el estado al terminar.
- Los eventos eliminados en Google deben conservarse como historial local.
- Nunca guardar tokens OAuth en el repositorio, logs, screenshots, reportes o mensajes.
- No sobrescribir silenciosamente cambios locales o remotos. Registrar y mostrar conflictos.

## Reglas de Google Calendar

- Solo sincronizar mediante una accion explicita del usuario.
- Usar exclusivamente el `calendarId` configurado; no sincronizar todos los calendarios por defecto.
- Asociar actividades con `googleEventId` y conservar la ultima informacion de sincronizacion necesaria para detectar cambios.
- Detectar modificaciones locales y remotas antes de actualizar.
- En conflictos, permitir conservar local, conservar Google o combinar campos compatibles.
- Separar errores de OAuth, red, permisos, calendario inexistente y conflictos de datos.
- Las pruebas contra Google deben usar mocks o una cuenta de prueba y autorizacion explicita.

## Reglas de frontend

- Mantener interfaz espanola, accesible y usable con teclado.
- Implementar estados de carga, vacio, error, recuperacion y exito.
- Validar responsive en movil de 375px, tablet de 768px y escritorio de 1280px o mas.
- Mantener tema claro y oscuro con contraste suficiente.
- Respetar la direccion visual del roadmap: fondo marfil en claro, azul profundo o carbon en oscuro, verde salvia, terracota y dorado como acentos, serif para titulos/frases y sans-serif para controles/estadisticas.
- El registro de asistencia debe ser accesible desde una actividad y completarse en pocos pasos.
- No ocultar conflictos de sincronizacion ni errores de persistencia detras de estados vacios.

## Reglas de backend

- Mantener API REST con respuestas y errores consistentes.
- Validar parametros, cuerpos, fechas, tipos de actividad y estados de asistencia en el servidor.
- Mantener separadas rutas, servicios, persistencia, Google OAuth y transformaciones de dominio cuando la estructura lo permita.
- No usar una base de datos, almacenamiento remoto o autenticacion propia.
- Mantener contratos API documentados si se incorpora OpenAPI.
- No mezclar cambios de frontend y backend en una misma tarea salvo que el planner defina el contrato y los archivos de ambos lados.

## Ownership de archivos

- `planner`: `.ai/project.md`, `.ai/architecture.md`, `.ai/roadmap.md` y `.ai/tasks.md` cuando el agente principal lo solicite.
- `backend-builder`: backend, servicios de persistencia, rutas, OAuth, Google Calendar y datos de prueba temporales asignados.
- `frontend-builder`: frontend, vistas, componentes, router, estado, cliente API y estilos asignados.
- `browser-qa`: no modifica codigo fuente ni datos persistentes.
- `test-runner`: no modifica codigo fuente ni datos persistentes.
- `fixer`: solo modifica los archivos autorizados por el reporte y el agente principal.
- `ROADMAP.md` y `AGENTS.md` no se modifican durante una tarea de builder salvo solicitud explicita del agente principal.

## Orquestacion

Usar esta secuencia para features normales:

1. `planner` lee el roadmap y crea o actualiza las tareas con IDs, dependencias, archivos permitidos, criterios de aceptacion y riesgos.
2. El agente principal revisa el plan y confirma decisiones de producto o datos de alto impacto.
3. `backend-builder` y `frontend-builder` implementan tareas separadas. Solo trabajar en paralelo si tienen archivos disjuntos y contratos definidos.
4. El agente principal ejecuta la validacion tecnica disponible despues de cada tanda de builders.
5. `browser-qa` valida los flujos completos con la aplicacion ejecutandose y prueba responsive, consola y Network.
6. `fixer` corrige unicamente problemas concretos de los reportes y repite la validacion afectada.
7. El agente principal revisa el diff final, los datos restaurados, los riesgos pendientes y el cumplimiento del roadmap.

Para una correccion pequena de uno o dos archivos, el agente principal puede usar directamente `fixer` o implementar el cambio sin crear una fase completa, dejando constancia de la validacion.

## Reglas al delegar

Todo prompt a un subagente debe incluir:

- ID de tarea y objetivo exacto.
- Archivos que puede modificar.
- Archivos que no puede modificar, especialmente si hay trabajo paralelo.
- Dependencias completadas y contrato relevante.
- Flujo o casos de error a validar.
- Comando de validacion esperado.

Los builders deben ignorar errores de archivos que no son de su ownership y no corregirlos por iniciativa propia. Si hay solapamiento directo, detenerse y avisar.

## Validacion y cierre

- Ejecutar solo comandos definidos por el proyecto; no inventar tests, lint o typecheck.
- Revisar `git status --short` antes de editar.
- Revisar `git diff --stat` y el diff de los archivos propios despues de editar.
- No ejecutar `git add`, commits, push ni cambios de configuracion Git salvo solicitud explicita.
- No usar comandos destructivos como `git reset --hard` o `git checkout --`.
- No revertir cambios ajenos.
- Una tarea no esta completa si no se reportan archivos modificados, validaciones ejecutadas, datos restaurados y riesgos pendientes.
- Una fase del MVP no se cierra sin validar los flujos funcionales, estados de error, responsive y persistencia involucrados.

## Artefactos temporales

- Mantener planes, tareas, handoffs y reportes en `.ai/` por area cuando se soliciten.
- Usar `.ai/backend/` para backend, `.ai/frontend/` para frontend y `.ai/shared/` cuando una tarea cruce areas.
- Usar subdirectorios `qa/` para reportes de QA o correcciones.
- El contenido del mensaje final del agente es el entregable principal; los artefactos `.ai/` son apoyo temporal salvo solicitud expresa.
