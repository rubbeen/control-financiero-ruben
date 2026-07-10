# Cambios de seguridad

- Datos bajo `users/{uid}` con UID, correo autorizado y `email_verified`.
- Reglas por operacion, allowlist de campos, importes enteros y campos inmutables.
- Colecciones raiz bloqueadas en reglas finales; reglas de transicion separadas.
- Backend LAN sin autenticacion retirado.
- Auth limpia cache, cuenta activa e inicializacion en logout.
- Respaldo AES-GCM/PBKDF2; CSV neutralizado; importacion limitada.
- Actualizacion con repositorio fijo, HTTPS, tamano y SHA-256.
- CSP, cleartext desactivado, backup Android desactivado y `FLAG_SECURE` release.
- Keystore, contrasenas, tokens, service accounts y `.env` fuera de Git.

No se publicaron reglas ni se activo App Check enforcement.
