# Sistema de actualizacion

Fuente fija: `rubbeen/control-financiero-ruben`. La URL no es editable. El cliente valida esquema, HTTPS, propietario/repositorio, versionCode, fecha, notas, tamano y SHA-256. La descarga usa stream, progreso y AbortController; solo tras comprobar bytes/hash escribe en cache Android y abre el instalador del sistema. Un archivo invalido nunca se abre. Si falla el manifiesto se ofrece la pagina oficial de Releases.

`scripts/prepare-release.mjs` requiere versiones 1.3.0/130, APK release y configuracion de firma externa; calcula hash/tamano y crea localmente `release-output/update-manifest.json`, checklist y APK. No publica ni usa tokens.

Estado: implementado y probado por unidades para esquema/URL/hash invalido; instalador real pendiente de APK release firmada y Samsung fisico.
