# Arquitectura

El frontend React consume `/api/*` mediante el proxy de Vite. El backend Express
separa rutas, servicios y persistencia. `backend/src/persistence/store.js` es la
unica capa autorizada para leer y escribir `backend/data/*.json`, usando temporal
mas rename atomico y backup `.bak`.

## Contrato

Exitos: `{ ok: true, data, meta? }`. Errores: `{ ok: false, error: { code, message, details? } }`.
Fechas de negocio `YYYY-MM-DD`; timestamps ISO; IDs UUID.

Endpoints MVP: `/api/health`, `/api/activities`, `/api/activities/calendar`,
`/api/attendance`, `/api/reflections`, `/api/quotes`, `/api/dashboard`,
`/api/data/export`, `/api/data/import`, `/api/settings` y `/api/google`.
