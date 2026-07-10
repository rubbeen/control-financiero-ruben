# Matriz de pruebas

| Area | Prueba | Viewport | Datos de prueba | Resultado | Fecha | Comando |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Contenido y overflow | 320 x 720 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Contenido y overflow | 360 x 800 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Contenido y overflow | 384 x 854 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Contenido y overflow | 390 x 844 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Contenido y overflow | 412 x 915 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Fuente ampliada | 360 x 800, 20 px | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Dashboard | Fuente ampliada | 412 x 915, 22 px | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Tablet | Contenido y overflow | 768 x 1024 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Escritorio | Contenido y overflow | 1366 x 768 | Cinco movimientos sinteticos | Pasa | 2026-07-10 | `playwright test tests/e2e/dashboard-responsive-content.spec.ts` |
| Componentes | Movimiento, recomendacion, eje y tooltip COP | jsdom | Fixtures sinteticos | Pasa, 21 pruebas | 2026-07-10 | `npm run test:unit` |
| Reglas | Aislamiento por UID y validacion | Emulator | Identidades ficticias | Pasa, 17 pruebas | 2026-07-10 | `npm run test:rules` |
| Rendimiento | Consultas acotadas | Emulator, 5.000 movimientos | Datos sinteticos | Pasa, 5 consultas Dashboard | 2026-07-10 | `npm run perf:queries` |
| Navegacion | Rutas, Atrás, cache y responsive | 360 a 1366 px | Datos sinteticos | Pasa, 8 pruebas; 2 condicionales omitidas | 2026-07-10 | `npm run test:e2e` |
| Migracion | Copia raiz a UID sin borrar origen | Emulator | Datos sinteticos | Pasa | 2026-07-10 | `MIGRATION_E2E=true playwright test tests/e2e/legacy-migration.spec.ts` |
| Build web | Produccion y lazy chunks | N/A | Configuracion local ignorada | Pasa | 2026-07-10 | `npm run build` |
| Android | Lint | N/A | Build sin datos personales | Pasa, 0 errores y 17 advertencias | 2026-07-10 | `gradlew.bat lint` |
| Android | Tests y APK debug local | N/A | Build sin datos personales | Pasa | 2026-07-10 | `gradlew.bat test assembleDebug` |
| Dispositivo | Samsung Galaxy A33 fisico | 1080 x 2400 | Datos sinteticos | Pendiente | 2026-07-10 | Prueba manual |
