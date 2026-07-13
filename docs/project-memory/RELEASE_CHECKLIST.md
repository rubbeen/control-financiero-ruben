# Lista de release

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
