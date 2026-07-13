# Matriz de pruebas

| Area | Prueba | Viewport | Datos de prueba | Resultado | Fecha | Comando |
| --- | --- | --- | --- | --- | --- | --- |
| Orientacion | Dashboard montado vertical, horizontal y vertical | 360 x 800, 412 x 915, 393 x 873 | Datos sinteticos y callback WebView omitido | Pasa, 3 secuencias | 2026-07-13 | `playwright test tests/e2e/orientation-regression.spec.ts` |
| Orientacion | Cinco ciclos sin recarga, overflow ni consultas | 360 x 800 a 800 x 360 | Datos sinteticos | Pasa | 2026-07-13 | `playwright test tests/e2e/orientation-regression.spec.ts` |
| Frontend v1.3.5 | Lint, TypeScript y servicios/componentes | jsdom | Fixtures sinteticos | Pasa, 35 unitarias | 2026-07-13 | `npm run lint` / `npm run typecheck` / `npm run test` |
| Seguridad v1.3.5 | Reglas UID y correo verificado | Emulator | Identidades ficticias | Pasa, 17 | 2026-07-13 | `npm run test:rules` |
| Navegacion v1.3.5 | Suite E2E completa con rotacion | 320 a 1366 px | Datos sinteticos | Pasa, 20; 2 condicionales omitidas | 2026-07-13 | `npm run test:e2e` |
| Builds web v1.3.5 | Variantes GitHub y Play | N/A | Configuracion local ignorada | Pasa | 2026-07-13 | `npm run build:github` / `npm run build:play` |
| Android GitHub v1.3.5 | Lint, tests, APK, paquete, version y firma | API 35 | Release 1.3.5 (135) | Pasa | 2026-07-13 | `lintGithubRelease testGithubReleaseUnitTest assembleGithubRelease` |
| Android Play v1.3.5 | Lint, tests, AAB y firma | API 35 | Release 1.3.5 (135) | Pasa; 0 `.so` | 2026-07-13 | `lintPlayRelease testPlayReleaseUnitTest bundlePlayRelease` |
| Dispositivo v1.3.5 | Rotacion fisica | Android | N/A | No ejecutada; sin dispositivo ni emulador conectado | 2026-07-13 | `adb devices -l` |
| Acceso | Registro, verificacion y primer ingreso | 320 x 568 y 740 x 360 | Usuario sintetico | Pasa | 2026-07-13 | `playwright test tests/e2e/registration.spec.ts` |
| Responsive | Todas las rutas, vertical y horizontal | 320 x 568 a 915 x 412 | Datos sinteticos | Pasa, 13 pruebas | 2026-07-13 | `playwright test tests/e2e/responsive.spec.ts` |
| Frontend | Servicios y componentes | jsdom | Fixtures sinteticos | Pasa, 34 pruebas | 2026-07-13 | `npm run test` |
| Seguridad | UID, correo verificado y validacion | Emulator | Identidades ficticias | Pasa, 17 pruebas | 2026-07-13 | `npm run test:rules` |
| Navegacion | Suite E2E completa | 320 a 1366 px | Datos sinteticos | Pasa, 16; 2 condicionales omitidas | 2026-07-13 | `npm run test:e2e` |
| Build web | Produccion GitHub | N/A | Configuracion local ignorada | Pasa | 2026-07-13 | `npm run build` |
| Android GitHub | Lint, test, firma, paquete y APK release | API 35 | Build 1.3.4 (134) | Pasa | 2026-07-13 | `lintGithubRelease testGithubReleaseUnitTest assembleGithubRelease` |
| GitHub Release | Asset, tamano, SHA-256 y descarga publicada | v1.3.4 | APK CI firmada | Pasa | 2026-07-13 | `gh release view` / `gh release download` / `apksigner` |
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
| Android release | Firma, package ID, version y huella | Local | APK firmada | Pasa | 2026-07-11 | `gradlew.bat assembleRelease` y `apksigner verify` |
| Android release | Firma, package ID, version y huella | CI manual | APK firmada | Pendiente merge | 2026-07-11 | `android-release.yml` |
| Dispositivo | Samsung Galaxy A33 fisico | 1080 x 2400 | Datos sinteticos | Pendiente | 2026-07-10 | Prueba manual |
| Carga | Query deshabilitada y refetch con cache | jsdom/E2E | Datos sinteticos | Pasa unitarias; E2E final pendiente | 2026-07-13 | `npm run test` / `npm run test:e2e` |
| Archivos | PDF inicia `%PDF`, nombre seguro y bytes base64 | jsdom | Datos sinteticos COP | Pasa | 2026-07-13 | `npm run test` |
| Android GitHub | Lint, tests, APK release | API 35 | Build local | Pasa | 2026-07-13 | `assembleGithubRelease` |
| Android Play | Lint, tests, APK y AAB release | API 35 | Build local | Pasa | 2026-07-13 | `bundlePlayRelease` |
| Play | 16 KB y librerias nativas | bundletool 1.18.3 | AAB 1.3.3 | `PAGE_ALIGNMENT_16K`; 0 `.so` | 2026-07-13 | `bundletool dump config` |
