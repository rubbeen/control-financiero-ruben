# Runbook de release Play

1. Completar `PLAY_UPLOAD_PREREQUISITES.md` con evidencia externa.
2. Confirmar tag, versionCode, package, App Signing y certificado de upload.
3. Ejecutar `Publish AAB to Google Play` con track `internal` y estado `draft`.
4. Revisar el resultado en Play Console y validar que la version es 1.3.3 (133).
5. Instalar desde el track interno y ejecutar `TESTING_PLAN.md`.
6. No promover a closed o production desde el mismo acto de prueba.
7. Para produccion, exigir revision separada y texto `PUBLISH_PRODUCTION`.

Rollback: detener/haltar el rollout en Play Console; una versionCode publicada no se reutiliza ni se reduce.
