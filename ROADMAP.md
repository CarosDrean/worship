# Roadmap

## 0. Definicion del producto

**Objetivo:** crear una aplicacion local para gestionar cultos, ayunos, vigilias y otras actividades espirituales, con seguimiento personal y sincronizacion manual con un calendario especifico de Google.

**Decisiones establecidas:**

- Frontend con React + Vite.
- Backend local con Node.js + Express.
- Datos almacenados unicamente en archivos JSON.
- Sin autenticacion propia.
- OAuth local para Google Calendar.
- Sin despliegue externo.
- Sincronizacion manual y bidireccional.
- Solo se sincroniza el calendario seleccionado.
- Conflictos mostrados al usuario.
- Eventos eliminados en Google se conservan como historial.
- Frases generadas mediante plantillas locales.
- Interfaz en espanol.
- Diseno espiritual moderno.
- Tema claro y oscuro.
- Experiencia responsive para escritorio y movil.

## 1. Diseno funcional

**Objetivo:** definir claramente que puede hacer la aplicacion.

**Entregables:**

- Inventario de tipos de actividad: culto, ayuno, vigilia, estudio biblico, reunion, evangelismo y otro.
- Estados de asistencia: pendiente, asisti, no asisti y asistencia parcial.
- Flujo para crear, editar y archivar actividades.
- Flujo para registrar asistencia.
- Reglas para ayunos y vigilias.
- Reglas para eventos importados desde Google.
- Diseno de navegacion de escritorio y movil.
- Definicion de metricas del dashboard.

## 2. Base tecnica local

**Objetivo:** preparar la estructura separada de frontend y backend.

**Entregables:**

- Proyecto frontend con React + Vite.
- Proyecto backend con Node.js + Express.
- Comunicacion mediante API REST local.
- Configuracion de puertos y acceso desde la red local.
- Manejo de variables de entorno.
- Sistema de errores y respuestas API consistentes.
- Configuracion para ejecutar frontend y backend localmente.

## 3. Persistencia en JSON

**Objetivo:** almacenar los datos sin base de datos.

**Archivos iniciales:**

- `activities.json`
- `attendance.json`
- `quotes.json`
- `goals.json`
- `reflections.json`
- `settings.json`
- `google-sync.json`

**Entregables:**

- Lectura y escritura centralizada de archivos.
- Generacion automatica de archivos faltantes.
- Escrituras seguras mediante archivos temporales.
- Identificadores unicos para registros.
- Fechas almacenadas en formato consistente.
- Exportacion de todos los datos.
- Importacion de una copia de seguridad.
- Validacion basica de los JSON importados.

## 4. Actividades y calendario interno

**Objetivo:** construir el nucleo de la aplicacion.

**Entregables:**

- Crear actividades.
- Editar actividades.
- Archivar actividades.
- Filtrar por tipo.
- Filtrar por fecha y estado.
- Vista mensual de calendario.
- Vista de lista.
- Vista de detalle.
- Registro de ubicacion, notas y descripcion.
- Soporte para actividades recurrentes, especialmente cultos y ayunos de los sabados.

## 5. Registro de asistencia

**Objetivo:** permitir el seguimiento real de la participacion.

**Entregables:**

- Registrar asistencia desde la actividad.
- Registrar asistencia parcial.
- Registrar motivo opcional de ausencia.
- Anadir notas posteriores.
- Registrar reflexion personal.
- Guardar duracion del ayuno.
- Marcar una vigilia como completada.
- Editar registros anteriores.
- Consultar historial completo.

## 6. Dashboard y seguimiento

**Objetivo:** mostrar rapidamente el estado espiritual y de asistencia.

**Indicadores iniciales:**

- Proxima actividad.
- Actividades pendientes.
- Asistencias del mes.
- Porcentaje de asistencia.
- Racha actual.
- Mejor racha.
- Ayunos completados.
- Vigilias completadas.
- Actividades por categoria.
- Resumen semanal y mensual.

**Entregables:**

- Dashboard para escritorio.
- Dashboard simplificado para movil.
- Graficas sencillas.
- Filtros por periodo.
- Estados visuales claros.
- Acceso rapido para registrar asistencia.

## 7. Frases motivacionales

**Objetivo:** incluir motivacion sin depender de servicios externos.

**Entregables:**

- Catalogo local de frases.
- Categorias: fe, perseverancia, oracion, disciplina, servicio y esperanza.
- Generacion mediante plantillas locales.
- Frase destacada del dia.
- Frases aleatorias.
- Agregar frases manualmente.
- Editar y eliminar frases propias.
- Marcar frases favoritas.
- Asociar una frase a una actividad o reflexion.

## 8. Metas, rachas y recordatorios

**Objetivo:** mejorar el seguimiento a largo plazo.

**Entregables:**

- Crear metas mensuales.
- Definir metas por tipo de actividad.
- Mostrar progreso.
- Calcular rachas.
- Mostrar logros personales.
- Configurar recordatorios locales.
- Recordatorio de actividad pendiente.
- Recordatorio para registrar asistencia despues de un evento.

Esta fase puede mantenerse fuera del primer MVP si se quiere reducir el alcance inicial.

## 9. Integracion con Google Calendar

**Objetivo:** sincronizar unicamente el calendario configurado por el usuario.

**Entregables:**

- Crear proyecto y credenciales OAuth en Google Cloud.
- Implementar flujo OAuth local.
- Guardar token localmente.
- Listar calendarios disponibles.
- Seleccionar un calendario especifico.
- Guardar el `calendarId`.
- Importar eventos del calendario seleccionado.
- Crear en Google eventos originados localmente.
- Actualizar eventos existentes.
- Asociar cada actividad con `googleEventId`.
- Detectar eventos modificados.
- Detectar eventos eliminados.
- Conservar localmente el historial eliminado.
- Ejecutar sincronizacion unicamente mediante accion del usuario.

## 10. Resolucion de conflictos

**Objetivo:** evitar sobrescrituras silenciosas.

**Entregables:**

- Detectar cambios locales y remotos.
- Comparar fechas de modificacion.
- Mostrar los datos locales y de Google.
- Permitir conservar la version local.
- Permitir conservar la version de Google.
- Permitir combinar campos cuando sea posible.
- Registrar el resultado de la resolucion.
- Mostrar resumen de sincronizacion.

## 11. Interfaz visual

**Objetivo:** construir una identidad espiritual moderna.

**Direccion visual:**

- Fondo marfil para modo claro.
- Azul profundo o carbon para modo oscuro.
- Verde salvia, terracota y dorado como acentos.
- Tipografia serif para titulos y frases.
- Tipografia sans-serif para controles y estadisticas.
- Tarjetas limpias con bordes suaves.
- Iconografia discreta.
- Espacios amplios y poca saturacion visual.
- Frase o reflexion destacada en el dashboard.

**Responsive:**

- Calendario completo en escritorio.
- Navegacion inferior en movil.
- Botones grandes para acciones frecuentes.
- Resumen "Hoy" como pantalla principal movil.
- Registro de asistencia accesible en pocos pasos.

## 12. Pruebas y validacion

**Objetivo:** garantizar que los datos locales y la sincronizacion sean confiables.

**Pruebas necesarias:**

- Crear y editar actividades.
- Registrar asistencia.
- Repetir actividades recurrentes.
- Importar y restaurar JSON.
- Simular archivos JSON danados.
- Crear eventos desde la aplicacion.
- Modificar eventos en Google.
- Modificar eventos localmente.
- Resolver conflictos.
- Eliminar eventos en Google.
- Verificar conservacion del historial.
- Probar acceso desde otro dispositivo en la red local.
- Probar escritorio y movil.
- Probar modo claro y oscuro.

## 13. MVP recomendado

El primer lanzamiento deberia incluir unicamente:

- Actividades.
- Calendario interno.
- Registro de asistencia.
- Ayunos y vigilias.
- Notas y reflexiones.
- Dashboard basico.
- Frases locales.
- Persistencia JSON.
- Exportacion e importacion.
- Seleccion de calendario de Google.
- Sincronizacion manual bidireccional.
- Resolucion manual de conflictos.
- Diseno responsive.

## 14. Funcionalidades posteriores

Despues del MVP se pueden anadir:

- Metas avanzadas.
- Rachas y logros.
- Recordatorios del sistema.
- PWA instalable.
- Multiples perfiles.
- Compartir actividades con grupos.
- Estadisticas mas avanzadas.
- Frases generadas mediante IA opcional.
- Integracion con otros calendarios.
- Sincronizacion automatica configurable.

## 15. Fuera del alcance inicial

Inicialmente no se incluiran:

- Registro de usuarios.
- Base de datos.
- Despliegue en internet.
- Aplicacion movil nativa.
- Sincronizacion automatica en segundo plano.
- Redes sociales.
- Funciones comunitarias.
- Dependencia obligatoria de una API de inteligencia artificial.
