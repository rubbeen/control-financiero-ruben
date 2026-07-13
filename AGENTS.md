# Guia del proyecto

Lee `docs/project-memory/KNOWN_ISSUES_AND_FIXES.md` y `TECHNICAL_DECISIONS.md` antes de modificar codigo; actualiza esa memoria despues de resolver un problema.

- Stack: React, TypeScript, Vite, Tailwind CSS, TanStack React Query, React Router, Firebase y Capacitor Android.
- Comandos: desde `frontend`, usa `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`, `npm run cap:sync` y `npm run version:check`.
- Archivos clave: `frontend/src`, `frontend/tests`, `firestore.rules`, `frontend/android/app/build.gradle` y `update-manifest.json`.
- Seguridad: nunca publiques secretos, correos personales, UID, datos financieros, rutas locales, keystores, APK, respaldos ni archivos `.env` reales. Usa datos sinteticos y Firebase Emulator.
- Versionado: sincroniza `package.json`, `APP_VERSION`, `versionName` y `versionCode`; no cambies `applicationId`.
- Publicacion: PR y validaciones primero. Publica Release y manifiesto solo con APK release firmada, compatible y verificada; nunca presentes una APK debug como release segura.
- Firma Android: reutiliza siempre la identidad release permanente documentada en `docs/android-signing.md`; el keystore y sus credenciales permanecen fuera de Git y la huella se valida en CI.
- Firebase: no despliegues reglas ni migres produccion desde una tarea de interfaz sin autorizacion separada.
- Paquetes para revision: usa el workflow manual `ChatGPT review package`; nunca compartas carpetas completas con `node_modules`, builds, caches, `.git`, keystores, secrets, respaldos o datos reales. Valida siempre checksum y extraccion antes de entregar el artifact.
