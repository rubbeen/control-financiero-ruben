# Firma Android release

- Application ID: `com.ruben.controlfinanciero`.
- Identidad creada: 2026-07-11.
- Alias publico: `control-financiero-ruben-release`.
- Huella SHA-256: `84:57:C0:87:9F:10:04:9F:D9:CC:2E:5B:FA:5B:3B:12:4A:02:3E:35:8B:AF:0E:BF:AF:42:56:F5:3D:9E:0C:4E`.

La misma clave debe reutilizarse para todas las versiones posteriores a v1.3.2. Perderla impide publicar actualizaciones compatibles; conserva una copia externa segura del keystore y de las credenciales sin incluirlas en Git.

Para Google Play, esta identidad se importa como app signing key. Despues se crea una upload key separada; sus secretos `ANDROID_UPLOAD_*` nunca sustituyen ni exponen la app signing key. Consulta `docs/play-store/APP_SIGNING_PLAN.md`.

Verificacion del APK:

```powershell
apksigner verify --verbose --print-certs control-financiero-ruben-v1.3.2.apk
```

GitHub Actions usa los secretos `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` y los seis secretos `VITE_FIREBASE_*` de compilacion. El workflow valida la huella antes de subir el artifact.
