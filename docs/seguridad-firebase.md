# Seguridad Firebase

1. Mantener Email/Password sin registro publico.
2. Verificar `ribenp7@gmail.com` y obtener su UID.
3. Crear respaldo verificado.
4. Probar `firestore.rules.transition`, `firestore.rules` e indices en Emulator.
5. Publicar manualmente reglas de transicion.
6. Ejecutar dry-run, revisar y copiar a `users/{uid}`.
7. Validar conteos, saldos y movimientos heredados en revision.
8. Publicar manualmente reglas e indices finales.
9. Mantener Storage cerrado y evaluar App Check sin enforcement inicial.

La configuracion web de Firebase es publica por diseno. La frontera real es Authentication, UID y Security Rules. Codex no ejecuto ninguna accion de consola o produccion.
