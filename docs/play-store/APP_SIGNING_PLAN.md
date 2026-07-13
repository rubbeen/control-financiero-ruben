# Plan de firma para Google Play

Estado: preparado; configuracion externa pendiente.

- La identidad de firma de la aplicacion debe seguir siendo SHA-256 `84:57:C0:87:9F:10:04:9F:D9:CC:2E:5B:FA:5B:3B:12:4A:02:3E:35:8B:AF:0E:BF:AF:42:56:F5:3D:9E:0C:4E`.
- Al activar Play App Signing se debe elegir importar la app signing key existente mediante el procedimiento cifrado oficial. No se debe permitir que Play genere otra identidad si se requiere compatibilidad con la APK de GitHub.
- La app signing key firma lo que reciben los usuarios. La upload key separada autentica futuros AAB enviados a Play. La cuenta de servicio solo autoriza Android Publisher API.
- Crear despues una upload key separada, registrar su certificado en Play Console y guardar sus secretos unicamente en GitHub Actions.
- Nunca subir keystores, contrasenas, Base64 ni archivos de recuperacion como artifacts.

Puerta: comparar la huella mostrada por Play App Signing con la huella anterior antes de publicar cualquier track.
