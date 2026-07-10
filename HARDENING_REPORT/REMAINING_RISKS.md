# Riesgos restantes

- Reglas, indices y migracion no estan publicados/ejecutados: la app 1.3.0 no debe sustituir produccion hasta completar el runbook.
- Ajustes o transferencias heredados incompletos requieren revision manual.
- APK release firmada no existe porque no se proporciono keystore; el artefacto `app-release-unsigned.apk` y el debug local no deben publicarse.
- Instalacion, actualizacion, FLAG_SECURE, backup/Smart Switch, teclado, gesto y Recents requieren Samsung Galaxy A33 fisico.
- App Check no esta activo; hacerlo sin prueba puede bloquear al usuario.
- Firestore Emulator no exige indices compuestos como produccion; deben publicarse y probarse manualmente.
- El bundle inicial baja 39.8%, no 50%, por Firebase Auth/Firestore obligatorio al restaurar sesion.
- El limite analitico es 2,000 documentos por rango; la UI debe advertir/segmentar si una cuenta supera ese volumen en la ventana consultada.
- El dry-run de migracion se valido con origen vacio en el emulador; los conteos y saldos reales deben revisarse durante una ventana manual antes de cualquier publicacion.
