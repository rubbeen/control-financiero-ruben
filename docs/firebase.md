# Firebase Firestore v1.3.0

Proyecto esperado: `control-financiero-ruben`, plan Spark. Los datos nuevos viven en:

- `users/{uid}/accounts`
- `users/{uid}/categories`
- `users/{uid}/movements`
- `users/{uid}/budgets`
- `users/{uid}/meta/counters`
- `users/{uid}/meta/initialization`

Las reglas finales exigen autenticacion, UID coincidente, `ribenp7@gmail.com` y correo verificado. Tambien validan campos y bloquean colecciones raiz. Storage permanece totalmente cerrado.

No publiques reglas finales antes de completar `MIGRATION_RUNBOOK.md`, porque el cliente anterior y los datos raiz dejarian de funcionar.
