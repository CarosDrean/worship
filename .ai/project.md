# Worship - Plan de implementacion

Aplicacion local en espanol para actividades espirituales. Stack: React + Vite,
Node.js + Express y persistencia exclusiva en JSON.

## Comandos, puertos y cadena de suministro

- Gestor: `pnpm@11.20.0`, workspaces `backend` y `frontend`.
- Desarrollo: `pnpm dev`, backend en 3001 y frontend en 5173.
- Build: `pnpm build`.
- Validacion: `pnpm check` (`typecheck`, Biome y auditoria de dependencias).
- Instalacion reproducible: `pnpm install --frozen-lockfile`.
- `minimumReleaseAge`, `trustPolicy: no-downgrade`, `save-exact` y scripts de
  dependencias bloqueados por pnpm son parte de la configuracion de seguridad.

## Alcance inicial

Se implementan actividades, calendario, asistencia, reflexiones, dashboard,
frases locales, importacion/exportacion, temas y una interfaz de Google Calendar
preparada para sincronizacion manual mediante mocks cuando no existan credenciales.
