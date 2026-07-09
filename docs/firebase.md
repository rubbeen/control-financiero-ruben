# Firebase Firestore

La version actual de la app usa Firebase Firestore como base de datos principal. Esto permite usar la app desde el celular con internet aunque el computador este apagado.

## Configuracion usada

- Proyecto: `control-financiero-ruben`
- Base de datos: Cloud Firestore
- App web registrada en Firebase
- Plan: Spark

## Colecciones

- `categories`
- `movements`
- `budgets`

## Reglas

Durante pruebas puede funcionar en modo de prueba. Cuando confirmes que todo guarda bien, protege Firestore con reglas mas estrictas. Sin autenticacion, cualquier regla abierta permite acceso publico a los datos.

Mejora recomendada:

- Activar autenticacion anonima o email/password.
- Guardar datos bajo `users/{userId}`.
- Permitir lectura/escritura solo al usuario autenticado.

## Nota de privacidad

Firebase es un servicio en la nube. No pide claves bancarias y no se conecta a bancos, pero los datos financieros manuales se guardan en internet bajo el proyecto Firebase configurado.
