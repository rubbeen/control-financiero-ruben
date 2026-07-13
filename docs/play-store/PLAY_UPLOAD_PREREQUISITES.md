# Prerrequisitos para subir a Google Play

- [ ] Cuenta de desarrollador creada, pagada y verificada.
- [ ] Aplicacion creada con `com.ruben.controlfinanciero`.
- [ ] Terminos aceptados.
- [ ] Play App Signing configurado importando la identidad actual.
- [ ] Upload key separada creada y registrada.
- [ ] Cuenta de servicio creada; Android Publisher API habilitada; permisos concedidos.
- [ ] Secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` configurado en GitHub.
- [ ] Secrets `ANDROID_UPLOAD_KEYSTORE_BASE64`, `ANDROID_UPLOAD_KEYSTORE_PASSWORD`, `ANDROID_UPLOAD_KEY_ALIAS` y `ANDROID_UPLOAD_KEY_PASSWORD` configurados.
- [ ] Variable `PLAY_UPLOAD_CERT_SHA256` configurada.
- [ ] Variables `PLAY_CONSOLE_APP_CREATED`, `PLAY_APP_SIGNING_CONFIGURED` y `PLAY_POLICIES_COMPLETED` configuradas en `true` solo con evidencia.
- [ ] Ficha minima, politica de privacidad, App content, Data Safety, Financial features, App access, content rating, audiencia y ads declaration completados.

El workflow falla antes de publicar y muestra solamente los nombres pendientes. Nunca se debe pegar el JSON o un keystore en el chat.
