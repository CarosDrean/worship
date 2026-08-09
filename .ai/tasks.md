# Tareas

| ID | Responsable | Objetivo | Dependencias |
|---|---|---|---|
| B-001 | backend-builder | Scaffolding Express, persistencia, API MVP y Google mock, con cabeceras y limites de seguridad | ninguna |
| F-001 | frontend-builder | Scaffolding React, shell, vistas MVP y responsive, con dependencias minimizadas | contrato de `.ai/architecture.md` |
| QA-001 | test-runner | Build, API, persistencia e import/export | B-001, F-001 |
| QA-002 | browser-qa | Flujos de usuario, responsive, temas y consola | QA-001 |
| FX-001 | fixer | Correcciones concretas de reportes | QA-001, QA-002 |

Ownership: B-001 solo modifica `backend/**`; F-001 solo `frontend/**`; QA no
modifica codigo ni datos persistentes; FX solo los archivos indicados por un
reporte. No se guardan tokens OAuth ni datos de prueba en el repositorio.
