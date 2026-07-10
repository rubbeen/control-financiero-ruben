# Linea base v1.2.0

Fecha: 2026-07-09 (America/Bogota)

## Estado Git

- Rama de trabajo: `release/1.3.0-hardening-performance`.
- Commit base: `aea7e5656180ffe6d1953b7c99f5640e0424ba1e`.
- Cambio preexistente preservado: `AUDIT_HANDOFF/` sin seguimiento.

## Compilacion reproducible

| Comando | Resultado | Tiempo observado |
| --- | --- | ---: |
| `npm ci` | Correcto, 360 paquetes, 0 vulnerabilidades de npm audit | 23.39 s |
| `npm run build` | Correcto | 27.78 s total; Vite 19.91 s |
| `npx cap sync android` | Correcto | 7.54 s |
| `python -m pytest -q` | Correcto, 2 pruebas, 66 avisos | 2.76 s |
| `gradlew lint test assembleDebug` | Correcto, 181 tareas | 41.8 s |

## Tamano inicial

- `frontend/dist`: 2,153,444 bytes en 7 archivos.
- Chunk principal: 1,746.74 kB; gzip 487.45 kB.
- CSS: 15.87 kB; gzip 3.99 kB.
- APK debug: 4,843,411 bytes.
- Vite advierte que el chunk principal supera 500 kB.

## Consultas actuales

La medicion es estatica y se expresa como formula porque no se conectaron pruebas a produccion. Sea `N` la cantidad de movimientos que devuelve una lectura completa de `movements` y `C` la cantidad de categorias.

- Un resumen mensual ejecuta `4 + 2N` consultas: movimientos completos, categorias del resumen, presupuesto y dos lecturas de categorias por cada movimiento decorado.
- `analyticsService.monthly` construye seis resumentes equivalentes: `24 + 12N` consultas.
- Dashboard agrega otra lista de movimientos: total `25 + 14N` consultas, mas seis consultas de tendencias, cada una con su propio costo `4 + 2N_mes`.
- Historial lee toda la coleccion de movimientos y filtra en memoria; no tiene limite ni paginacion.
- Tendencias consulta un mes por vez.
- Los documentos leidos dependen del volumen completo de las colecciones raiz. No existe un maximo acotado.

## Tiempos de pantalla

No medidos: Dashboard, Historial, Analisis y cambio de cuenta. No existe emulador con un conjunto de datos reproducible ni se permite usar datos financieros reales. Los benchmarks posteriores usaran fixtures sinteticos y reportaran esta limitacion en vez de atribuir tiempos de red falsos.

## Hallazgos de arquitectura confirmados

- El frontend no importa `src/services/api.ts`; el backend FastAPI no participa en el producto Firebase.
- Firestore usa colecciones raiz y autorizacion global por correo.
- Los identificadores numericos se calculan leyendo colecciones completas y presentan carrera.
- La cuenta activa vive en `localStorage` y no invalida de forma consistente todas las pantallas.
- No existe router, historial de navegacion ni manejo del boton Atrás de Android.
- `jsPDF`, graficas y todas las paginas forman parte del bundle inicial.
- El saldo mostrado es el balance mensual, no el saldo acumulado.
- Cleartext y respaldo Android estan habilitados.

