# Migracion Firestore

Origen: `accounts`, `categories`, `movements`, `budgets`. Destino: `users/{uid}/...`.

`scripts/migrate-firestore.mjs` es dry-run por defecto, exige UID, usa lotes de 400, checkpoints, conteos e idempotencia, calcula saldos y marca ajustes/transferencias heredados incompletos con `needs_review`. No inventa destino o direccion, no borra origen y no publica reglas. La ejecucion real no se realizo.
