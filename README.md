# Control Financiero Ruben 1.3.3

Version de codigo: v1.3.3. Los canales GitHub y Google Play se compilan por separado.

Aplicacion financiera personal en COP construida con React, TypeScript, Firebase Auth, Cloud Firestore y Capacitor Android.

## Arquitectura

El cliente consulta Firestore directamente bajo `users/{uid}`. No existe backend Python ni servidor local: el computador puede permanecer apagado. Firebase Authentication exige una cuenta autorizada y verificada; las reglas versionadas agregan aislamiento por UID y validacion de documentos.

## Desarrollo

```powershell
cd frontend
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Emulator y pruebas

Las suites usan el proyecto ficticio `demo-control-financiero-ruben`; no pueden escribir en produccion.

```powershell
npm run test:rules
npm run test:e2e
npm run perf:queries
npm run perf:bundle
```

## Datos, cache y rendimiento

React Query mantiene cache solo en memoria y la limpia al cerrar sesion. Las claves incluyen UID y cuenta. Dashboard usa hasta cinco consultas logicas acotadas; Historial inicia con 50 movimientos y pagina por cursor `date,id`. Las categorias duran 24 horas, cuentas 10 minutos, mes actual 30 segundos y meses historicos 5 minutos.

## Android

```powershell
npm run cap:sync
cd android
gradlew.bat lint test assembleDebug
```

Android bloquea cleartext y backup. `FLAG_SECURE` es una preferencia local reversible, desactivada por defecto. El `applicationId` sigue siendo `com.ruben.controlfinanciero`.

## Firma y release

No hay keystore en el repositorio. Copia `frontend/android/keystore.properties.example` como `keystore.properties`, completa rutas y secretos externos y protege el keystore. Luego ejecuta `assembleRelease` y `npm run prepare:release`. El script rechaza preparar una release si falta la configuracion externa y no publica nada.

## Actualizacion

La app consulta un `update-manifest.json` fijo del repositorio oficial. Valida esquema, version, HTTPS, propietario, tamano y SHA-256; descarga con progreso y abre el instalador oficial de Android. La URL no es editable y siempre existe enlace alternativo a GitHub Releases.

## Respaldo

El formato `.cfrbackup` usa AES-GCM y PBKDF2. La contrasena nunca se guarda. La importacion limita tamano y registros, muestra vista previa, descarga un respaldo previo, omite conflictos y procesa lotes. El CSV se limita a la cuenta activa, incluye BOM UTF-8 y neutraliza formulas, pero no esta cifrado.

## Migracion

La aplicacion detecta las colecciones raiz anteriores y las copia automaticamente a `users/{uid}` antes de inicializar datos nuevos. No elimina el origen, evita duplicados si ya existen movimientos bajo UID y recalcula los saldos. La regla de transicion versionada exige una cuenta verificada y un claim temporal de migracion.

## Solucion de errores

- Acceso bloqueado: verifica el correo en Firebase Authentication antes de reglas finales.
- Indice faltante: revisa `firestore.indexes.json` y publica los indices manualmente.
- Rules tests: instala Java 21 e inicia mediante `npm run test:rules`.
- Android: define `JAVA_HOME`, `ANDROID_HOME` y `ANDROID_SDK_ROOT`.
- Release: si no existe APK firmada, configura `keystore.properties`; no reutilices una clave debug.
- Actualizacion: si falla el manifiesto, usa el enlace de Releases oficial mostrado por la app.
