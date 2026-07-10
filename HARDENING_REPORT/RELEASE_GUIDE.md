# Guia de release

1. Incrementa `package.json`, `APP_VERSION`, `APP_VERSION_CODE`, `versionName` y `versionCode`.
2. Ejecuta `npm run version:check`, todas las pruebas y `cap:sync`.
3. Configura `frontend/android/keystore.properties` con un keystore externo protegido.
4. Ejecuta `gradlew.bat assembleRelease`.
5. Verifica firma/certificado con `apksigner`; nunca uses certificado Android Debug.
6. Ejecuta `npm run prepare:release` y revisa SHA, tamano y checklist.
7. Crea GitHub Release manualmente y adjunta la APK firmada.
8. Publica el manifiesto solo despues de que la URL del APK funcione.
9. Prueba descarga, SHA, instalador y actualizacion sobre una version anterior.
10. Para rollback, retira el manifiesto nuevo o apunta manualmente a una APK previamente firmada y compatible.
11. Conserva copias seguras del keystore; perderlo impide actualizar la misma instalacion.

Si v1.2.0 estaba firmada con debug, respalda Firebase, desinstala debug, instala v1.3.0 release y conserva desde entonces el mismo keystore release.
