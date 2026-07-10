# Evaluacion de Firebase App Check

App Check no se activa ni se exige en v1.3.0.

- El frontend usa Firebase Web SDK dentro de un WebView de Capacitor; el proveedor web habitual depende de reCAPTCHA y debe probarse dentro del APK.
- Play Integrity ofrece mejor identidad de aplicacion Android, pero requiere una integracion nativa compatible con el SDK web actual o cambiar el acceso Firebase a plugins nativos.
- El modo debug debe registrarse solo en un proyecto de prueba y sus tokens nunca deben guardarse en Git.
- Una adopcion segura empieza con metricas sin enforcement, sigue con una APK interna y solo despues habilita enforcement gradualmente.
- Activarlo antes de validar puede bloquear por completo al usuario autorizado.

Bandera reservada: `VITE_ENABLE_APP_CHECK=false`. La app no inicializa proveedor alguno mientras sea `false` y no hay claves reCAPTCHA en el repositorio.
