# Instalacion local

1. Instala Node compatible y ejecuta `npm ci` dentro de `frontend`.
2. Usa `npm run dev` para web o `npm run cap:sync` para sincronizar Android.
3. Configura Android SDK y JDK 21.
4. Genera debug con `frontend/android/gradlew.bat assembleDebug`.
5. Para release, configura un keystore externo siguiendo `HARDENING_REPORT/RELEASE_GUIDE.md`.

No se inicia backend, no se abre puerto 8000 y no se configura IP del computador.
