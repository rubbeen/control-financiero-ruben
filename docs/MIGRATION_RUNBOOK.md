# Migracion Firestore por UID

Este procedimiento es manual. El desarrollo de v1.3.0 no publica reglas ni copia datos de produccion.

1. Confirma en Firebase Authentication que `ribenp7@gmail.com` esta verificado y anota su UID.
2. Exporta y verifica un respaldo antes de cualquier cambio.
3. Inicia el Emulator con `npm run emulator` desde `frontend`.
4. Prueba `firestore.rules.transition` en Emulator.
5. Cuando se apruebe una ventana real, publica manualmente las reglas de transicion.
6. Ejecuta primero el modo seguro: `node scripts/migrate-firestore.mjs --uid=UID` con `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.
7. Revisa el JSON creado en `HARDENING_REPORT/migration/` y cada `needsReview`.
8. En una ventana autorizada, usa credenciales externas y agrega `--execute --allow-production`; nunca copies credenciales al repositorio.
9. Compara conteos, saldos calculados y muestras sin información personal en los registros.
10. Prueba la app v1.3.0 con la estructura por UID.
11. Publica manualmente `firestore.rules` solo después de validar.
12. Conserva las colecciones raiz durante el periodo de recuperacion.
13. Su eliminacion debe ser una operacion futura, separada y aprobada.

El script es idempotente, escribe lotes de 400, conserva un checkpoint, se detiene ante conteos distintos y nunca borra las colecciones raiz.
