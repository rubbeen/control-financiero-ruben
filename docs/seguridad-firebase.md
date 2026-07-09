# Seguridad de Firebase

Esta app queda protegida con Firebase Authentication y reglas de Firestore por correo.

## 1. Activar login por correo

En Firebase Console:

1. Abre el proyecto `control-financiero-ruben`.
2. Ve a Authentication.
3. En Sign-in method, activa Email/Password.
4. En Users, crea el usuario `ribenp7@gmail.com` con una contrasena segura.

La app solo acepta este correo.

## 2. Publicar reglas de Firestore

En Firestore Database > Rules, reemplaza todo por el contenido de `firestore.rules` y publica.

Estas reglas permiten leer y escribir solamente cuando el usuario autenticado tiene este correo:

```text
ribenp7@gmail.com
```

Las colecciones protegidas son:

- `accounts`
- `categories`
- `movements`
- `budgets`

Cualquier otra ruta queda bloqueada.

## 3. Publicar reglas de Storage

En Storage > Rules, reemplaza todo por el contenido de `storage.rules` y publica.

Storage queda cerrado porque la app no necesita guardar archivos en Firebase Storage.

## 4. Orden recomendado

1. Instala la version nueva de la app.
2. Activa Email/Password y crea el usuario.
3. Entra a la app con `ribenp7@gmail.com`.
4. Publica las reglas estrictas de Firestore.
5. Vuelve a abrir la app y confirma que tus datos cargan.

## Importante

La configuracion publica de Firebase que esta en el codigo no es una contrasena. La seguridad real esta en Authentication y en estas reglas.
