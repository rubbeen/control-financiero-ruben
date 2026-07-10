# Resultados de pruebas

| Suite | Resultado |
| --- | --- |
| ESLint | correcto, sin avisos |
| TypeScript | correcto |
| Unit/RTL | 12/12; 78.73% statements y 80.14% lineas |
| Firestore Rules | 17/17 en demo Emulator |
| E2E responsive/navegacion | 7/7; 60 capturas |
| Perf queries | correcto con 5,000 movimientos, 20 categorias, 12 meses, 3 cuentas; Dashboard 860 docs/868.40 ms, Historial 50 docs/114.89 ms |
| Build Vite | correcto |
| Version check | 1.3.0 (130), correcto |
| Capacitor sync | correcto, 3 plugins |
| Android lint/test/assembleDebug | correcto |
| Android assembleRelease | compila optimizado, pero solo genera `app-release-unsigned.apk`; no es distribuible |
| Preparador release | rechazo correcto: no existe APK release firmada |
| Migracion | dry-run correcto en emulador demo, cero escrituras y cero borrados |

Las pruebas no usaron datos reales ni servicios Firebase de produccion.
