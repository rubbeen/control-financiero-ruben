# Cuentas y actualizaciones

## Cuentas separadas

La app permite manejar varias cuentas financieras como carpetas:

- General
- Cuenta de ahorro
- Efectivo
- Nequi
- Deudas
- Negocio

Cada cuenta tiene sus propios movimientos, presupuesto, analisis mensual, IA financiera y balance. Las categorias son compartidas para mantener el orden.

Los datos se guardan en Firebase Firestore:

- `accounts`
- `movements`
- `budgets`
- `categories`

Los movimientos y presupuestos nuevos usan la cuenta activa. Los datos antiguos sin `account_id` pertenecen a la cuenta `General`.

## Actualizaciones con GitHub Releases

La pantalla `Actualizar app` permite configurar un repositorio de GitHub, consultar la ultima release y descargar el APK publicado.

Android no permite que una app instalada fuera de Play Store se actualice en silencio. La app puede descargar el APK, pero el usuario debe confirmar la instalacion.

Formato esperado:

```text
https://github.com/usuario/control-financiero-ruben
```

La release debe tener un archivo `.apk` adjunto.
