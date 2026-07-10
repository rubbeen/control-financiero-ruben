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

## Estado v1.3.2

- [x] Frontend, Emulator, responsive, build, Capacitor y Android validados.
- [x] Version 1.3.2 (132) sincronizada sin cambiar `applicationId`.
- [x] Codigo preparado para push y PR sin datos personales.
- [ ] GitHub Release bloqueada: APK anterior y nueva usan Android Debug y no existe clave release configurada.
- [ ] `update-manifest.json` se conserva sin cambios hasta disponer de una APK release segura y compatible.
