# Rollback de migracion

1. Deten el uso de la app v1.3.0.
2. Conserva tanto las colecciones raiz como `users/{uid}`; no borres datos durante el incidente.
3. Vuelve manualmente a `firestore.rules.transition` para permitir temporalmente el cliente anterior.
4. Instala la ultima APK conocida y firmada con el mismo `applicationId`.
5. Compara el respaldo previo, el reporte de migracion y los conteos.
6. Corrige la copia por UID y vuelve a ejecutar el script: el checkpoint permite reanudar.
7. Solo restablece las reglas finales cuando saldos, conteos y movimientos en revision coincidan.

No se automatiza la eliminacion del destino. Un rollback destructivo necesita una aprobacion independiente y un respaldo verificado.
