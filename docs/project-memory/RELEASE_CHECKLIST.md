# Lista de release

## Estado v1.3.5

- [x] Version 1.3.5 (135) sincronizada en package, frontend, Android, script y CI.
- [x] Regresion de orientacion reproducida con host de 335 px y SVG obsoleto de 815 px.
- [x] Epoch compartido remonta solo Recharts, sin recarga, navegacion ni consultas Firebase.
- [x] Prueba dinamica pasa tres secuencias y cinco ciclos consecutivos.
- [x] Completar lint, typecheck, 35 unitarias, 17 reglas, 20 E2E y 2 condicionales omitidas.
- [x] Completar builds web GitHub/Play, lint y tests Android, APK GitHub y AAB Play firmados.
- [x] Verificar paquete `com.ruben.controlfinanciero`, version 1.3.5 (135) y certificado permanente.
- [ ] Prueba fisica no ejecutada porque no habia dispositivo ni emulador conectado.
- [x] Publicar GitHub Release v1.3.5 y actualizar el manifiesto solo tras verificar el asset.

## Estado v1.3.4

- [x] Version 1.3.4 (134) sincronizada en package, frontend, Android, script y CI.
- [x] Registro con confirmacion de contrasena, verificacion de correo y cierre de sesion temporal.
- [x] Aislamiento por UID y bloqueo de usuarios no verificados comprobados con Emulator.
- [x] Responsive sin overflow desde 320 px, telefonos, tabletas y orientacion horizontal.
- [x] Lint, typecheck, 34 unitarias, 17 reglas y 16 E2E completadas; 2 pruebas condicionales omitidas.
- [x] Generar y verificar APK GitHub release con la firma permanente.
- [x] Publicar GitHub Release v1.3.4 y actualizar el manifiesto solo tras comprobar el asset.
- [x] Publicacion en Google Play pausada por decision del propietario.

## Estado v1.3.3

- [x] Version 1.3.3 (133), package y API 35 sincronizados.
- [x] APK GitHub firmada y con permiso de instalacion externa aislado.
- [x] AAB Play firmada, sin permiso de instalacion externa, sin `.so` y con `PAGE_ALIGNMENT_16K`.
- [x] PDF, CSV y respaldo usan entrega nativa segura.
- [x] Capturas permitidas por defecto y proteccion local reversible.
- [ ] Completar prerrequisitos externos de Play Console.
- [ ] Ejecutar Release CI desde `main`, publicar GitHub Release y actualizar manifiesto tras verificar la APK.

- [ ] Ejecutar `npm ci`, lint, typecheck, unitarias, reglas, E2E, build, `cap:sync` y `version:check`.
- [ ] Ejecutar Android lint, tests y build desde la rama principal integrada.
- [ ] Revisar `git diff --check`, archivos staged y escaneo de secretos redactado.
- [ ] Confirmar version en `package.json`, app, Android y scripts; confirmar `applicationId`.
- [ ] Verificar APK anterior y nueva con `apksigner`; comparar certificados sin documentar datos privados.
- [ ] Rechazar Release si la APK es debug, no esta firmada o no puede actualizar la instalada.
- [ ] Crear commit focalizado, push verificado, Pull Request sanitizado y squash merge permitido.
- [ ] Crear GitHub Release solo despues de checks, firma compatible, SHA-256 y tamano real.
- [ ] Actualizar `update-manifest.json` solo despues de publicar y verificar los assets.
- [ ] Probar despues de publicar: deteccion, notas, descarga, SHA-256 e instalador.
- [ ] Mantener APK, keystore, propiedades, reportes y capturas fuera de Git.
- [ ] Para revision externa, usar el workflow `ChatGPT review package`; confirmar que el ZIP excluye `node_modules`, builds, caches, `.git`, keystores, secrets, respaldos y datos reales, y descargar el artifact antes de que expire.

## Estado v1.3.2

- [x] Frontend, Emulator, responsive, build, Capacitor y Android validados.
- [x] Version 1.3.2 (132) sincronizada sin cambiar `applicationId`.
- [x] Codigo preparado para push y PR sin datos personales.
- [x] APK debug previa identificada y migracion manual requerida para la primera APK release.
- [x] `update-manifest.json` se conserva en v1.3.1 hasta una version posterior compatible con la firma release.

## Firma release v1.3.2

- [x] Identidad release permanente creada fuera de Git y huella publica documentada.
- [x] Workflow manual valida version, package ID, no-debug, firma y artifact permitido.
- [x] Migracion manual desde v1.3.1 debug documentada.
- [x] `update-manifest.json` permanece en v1.3.1 por incompatibilidad de certificados.
- [ ] Crear Release solo despues de completar y verificar el workflow desde `main`.
