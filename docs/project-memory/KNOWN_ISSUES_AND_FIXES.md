# Problemas conocidos y soluciones

## SYNC-001

- Sintoma: el Dashboard mostraba un error rojo mientras la consulta financiera seguia deshabilitada porque aun no existia cuenta activa.
- Causa raiz: `financial.isError || !financial.data` confundia datos aun no solicitados con fallo definitivo.
- Solucion: combinar estado de cuentas, `isPending`, `fetchStatus`, cache, refetch y politica Firebase; conservar datos durante actualizacion.
- Prueba de regresion: politica de reintentos unitaria, E2E de carga y Dashboard sin error durante estado pendiente.
- No repetir: no usar `!data` como unica condicion de error.

## EXPORT-001

- Sintoma: Blob, anchor y `link.click()` no guardaban de forma fiable PDF, CSV o respaldos en Android.
- Causa raiz: el mecanismo web no confirma persistencia en almacenamiento Android.
- Solucion: generacion separada, SAF con `ACTION_CREATE_DOCUMENT`, temporales limitados a `cache/exports/`, Share oficial y FileOpener.
- Prueba de regresion: bytes PDF, MIME/nombre, builds Android y cancelacion sin iniciar importacion.
- No repetir: anchor download es exclusivamente web; no considerar guardado un Blob temporal.

## PRIVACY-001

- Sintoma: toda release bloqueaba capturas sin eleccion del usuario.
- Causa raiz: `MainActivity` aplicaba `FLAG_SECURE` de forma incondicional.
- Solucion: preferencia local `SharedPreferences`, desactivada por defecto, reversible y aplicada al instante.
- No repetir: conservar `FLAG_SECURE`, pero siempre condicionado a la preferencia local.

## PLAY-001

- Sintoma: un unico paquete mezclaba actualizador externo y futura distribucion Play.
- Solucion: flavors `github` y `play`, AAB privado, API 35, 16 KB, Fastlane Supply fijado y workflow manual con precondiciones.
- No repetir: nunca subir a Play una variante que declare `REQUEST_INSTALL_PACKAGES`.

## UI-001

- Identificador: UI-001.
- Fecha: 2026-07-10.
- Sintoma: los movimientos del Dashboard excedian el ancho movil; la descripcion se truncaba y el importe quedaba fuera de la tarjeta.
- Contexto donde aparecio: viewport de 360 x 800 con descripciones largas y un importe COP de nueve cifras.
- Causa raiz confirmada: icono, texto e importe compartian una fila flexible; el texto usaba truncado y el importe no tenia espacio garantizado. `overflow-x-hidden` ocultaba la anchura real de la tarjeta.
- Intentos fallidos: agregar solo `min-width: 0` y ocultar el desbordamiento horizontal.
- Por que fallaron: no cambiaban la distribucion de la fila ni devolvian visibilidad al contenido recortado.
- Solucion que funciono: grid movil de dos columnas con importe en fila propia, tercera columna en `sm`, texto multilina y contenedores acotados a `100%`.
- Archivos modificados: `MovementItem.tsx`, `RecommendationCard.tsx`, `Dashboard.tsx`, `Layout.tsx` e `index.css`.
- Pruebas que validan la solucion: `dashboard-responsive-content.spec.ts`, `components.test.tsx` y capturas sinteticas locales.
- Como detectar una regresion: `scrollWidth > clientWidth + 1`, tarjeta fuera del viewport, ellipsis computado o ausencia del texto `120.000.000`.
- Que no volver a hacer: no usar `truncate`, altura fija ni `overflow-x-hidden` para esconder este problema.

## TEST-001

- Identificador: TEST-001.
- Fecha: 2026-07-10.
- Sintoma: un parche amplio fallo al coincidir con un separador previamente mal codificado.
- Contexto donde aparecio: reemplazo conjunto de tres componentes de interfaz.
- Causa raiz confirmada: el texto leido y los bytes del separador no coincidian.
- Intentos fallidos: repetir el parche con el mismo contexto textual.
- Por que fallaron: la coincidencia seguia dependiendo del caracter corrupto.
- Solucion que funciono: reemplazar el componente pequeno completo y usar un separador ASCII estable.
- Archivos modificados: `MovementItem.tsx`.
- Pruebas que validan la solucion: typecheck, prueba unitaria del componente y Playwright responsive.
- Como detectar una regresion: caracteres extranos entre categoria y fecha o fallo de compilacion.
- Que no volver a hacer: no repetir un parche que depende del mismo texto corrupto; reducir el alcance y cambiar la hipotesis.

## RELEASE-001

- Identificador: RELEASE-001.
- Fecha: 2026-07-10.
- Sintoma: la ultima APK publica esta firmada con certificado Android Debug.
- Contexto donde aparecio: verificacion previa a publicar v1.3.2.
- Causa raiz confirmada: la entrega anterior se compilo con la configuracion debug y no existe una firma release configurada en el proyecto.
- Intentos fallidos: considerar otra APK debug como actualizacion publicable.
- Por que fallaron: una firma debug no cumple la condicion de release segura aunque sea compatible con la APK instalada.
- Solucion que funciono: publicar el codigo mediante PR y conservar sin cambios el manifiesto de actualizacion hasta disponer de una firma release aprobada.
- Archivos modificados: documentacion de release y versionado de codigo.
- Pruebas que validan la solucion: `apksigner verify --print-certs`, `version:check` y ausencia de cambios en `update-manifest.json`.
- Como detectar una regresion: una Release nueva cuyo certificado indique Android Debug o un manifiesto que apunte a un APK no verificado.
- Que no volver a hacer: no publicar APK debug como release segura ni crear un keystore nuevo sin autorizacion.

## RELEASE-002

- Identificador: RELEASE-002.
- Fecha: 2026-07-11.
- Sintoma: v1.3.1 debug no puede actualizar directamente a una APK release.
- Contexto donde aparecio: primera publicacion release permanente de v1.3.2.
- Causa raiz confirmada: Android exige el mismo certificado para actualizar una instalacion existente.
- Intentos fallidos: tratar la firma debug como identidad publicable o cambiar de certificado en cada release.
- Por que fallaron: las APK resultantes no son una ruta de actualizacion segura ni estable.
- Solucion que funciono: identidad release local permanente, secretos de CI y validacion de huella publica en el workflow manual.
- Archivos modificados: workflow de release, guia de firma, guia de migracion y documentacion de memoria.
- Pruebas que validan la solucion: `assembleRelease`, `apksigner verify` y verificacion de `applicationId`, version y huella.
- Como detectar una regresion: firma Android Debug, huella distinta, APK debuggable o manifiesto actualizado antes de una ruta compatible.
- Que no volver a hacer: no publicar debug, claves temporales, keystores ni manifests de actualizacion incompatibles.

## RELEASE-003

- Identificador: RELEASE-003.
- Fecha: 2026-07-11.
- Sintoma: Gradle no encontro un keystore local con una ruta absoluta de Windows.
- Contexto donde aparecio: primera compilacion local `assembleRelease`.
- Causa raiz confirmada: las barras invertidas de la ruta se interpretaron como escapes al leer el archivo de propiedades Java.
- Intentos fallidos: almacenar la ruta absoluta de Windows con barras invertidas.
- Por que fallaron: Gradle recibio una ruta relativa malformada.
- Solucion que funciono: guardar la ruta local con barras normales; CI usa una ruta temporal de Linux.
- Archivos modificados: propiedades locales ignoradas y esta memoria; no se modifico el build de produccion.
- Pruebas que validan la solucion: `assembleRelease` finalizo y `apksigner` valido la APK.
- Como detectar una regresion: fallo `validateSigningRelease` al iniciar una compilacion release.
- Que no volver a hacer: no usar barras invertidas en `storeFile` dentro de propiedades Java.

## RELEASE-004

- Identificador: RELEASE-004.
- Fecha: 2026-07-11.
- Sintoma: GitHub Actions intento ejecutar las pruebas Playwright con Vitest y detuvo la compilacion release.
- Contexto donde aparecio: paso `npm run test` del workflow Android en Ubuntu.
- Causa raiz confirmada: el patron de exclusion `tests/e2e/**` del script no excluyo de forma fiable las pruebas E2E en Linux.
- Intentos fallidos: confiar en el mismo glob que habia funcionado en Windows.
- Por que fallaron: el filtrado de rutas no fue equivalente entre los dos entornos.
- Solucion que funciono: usar el patron explicito `tests/e2e/**/*.spec.ts` en el script de Vitest; las pruebas Playwright permanecen en su paso independiente.
- Archivos modificados: `frontend/package.json`, `.github/workflows/android-release.yml` y esta memoria.
- Pruebas que validan la solucion: 21 pruebas unitarias ejecutadas localmente y workflow Android completado en GitHub Actions.
- Como detectar una regresion: errores `Playwright Test did not expect test() to be called here` durante el paso de Vitest.
- Que no volver a hacer: no usar `tests/e2e/**` ni un argumento posicional `src` para separar Vitest y Playwright en CI.

## RELEASE-005

- Identificador: RELEASE-005.
- Fecha: 2026-07-11.
- Sintoma: GitHub Actions detuvo la compilacion Android con `./gradlew: Permission denied`.
- Contexto donde aparecio: primer `assembleRelease` ejecutado en el runner Ubuntu.
- Causa raiz confirmada: `frontend/android/gradlew` estaba versionado con modo `100644`, sin permiso de ejecucion.
- Intentos fallidos: ejecutar el wrapper directamente sin corregir su modo en Git.
- Por que fallaron: Linux respeta el bit ejecutable del archivo versionado.
- Solucion que funciono: registrar `frontend/android/gradlew` con modo `100755`.
- Archivos modificados: `frontend/android/gradlew` y esta memoria.
- Pruebas que validan la solucion: workflow Android completo en GitHub Actions.
- Como detectar una regresion: el log falla inmediatamente al invocar `./gradlew` con codigo 126.
- Que no volver a hacer: no depender de permisos locales de Windows para scripts ejecutados en Linux.

## RELEASE-006

- Identificador: RELEASE-006.
- Fecha: 2026-07-11.
- Sintoma: `assembleRelease` termino correctamente, pero la comprobacion posterior salio con codigo 1 sin identificar la condicion.
- Contexto donde aparecio: validacion de paquete, version, modo debug y certificado en GitHub Actions.
- Causa raiz confirmada: verificaciones silenciosas con `grep` y `test` no aportaban diagnostico y dependian de una extraccion rigida.
- Intentos fallidos: validar todos los metadatos mediante comandos silenciosos bajo `set -e`.
- Por que fallaron: cualquier diferencia terminaba el paso sin exponer el valor publico comparado.
- Solucion que funciono: validaciones explicitas, metadatos publicos en el log y huella normalizada antes de comparar.
- Archivos modificados: `.github/workflows/android-release.yml` y esta memoria.
- Pruebas que validan la solucion: workflow Android completo, APK no depurable y certificado esperado.
- Como detectar una regresion: error explicito de paquete, version, modo depurable o certificado en el log.
- Que no volver a hacer: no ocultar el dato publico que explica una validacion fallida de release.

## RELEASE-007

- Identificador: RELEASE-007.
- Fecha: 2026-07-11.
- Sintoma: `apksigner` valido la APK en CI, pero la extraccion textual de su huella produjo una cadena vacia.
- Contexto donde aparecio: comprobacion del certificado posterior a `assembleRelease` en Ubuntu.
- Causa raiz confirmada: el parser dependia del texto exacto emitido por la version de `apksigner` instalada en el runner.
- Intentos fallidos: extraer la huella con `awk` y despues con `sed` desde la salida humana de `apksigner`.
- Por que fallaron: ambas soluciones dependian de la misma etiqueta de salida no estable.
- Solucion que funciono: exportar el certificado PEM con `keytool` y calcular SHA-256 con OpenSSL.
- Archivos modificados: `.github/workflows/android-release.yml` y esta memoria.
- Pruebas que validan la solucion: workflow Android completo y huella publica igual a `EXPECTED_CERT_SHA256`.
- Como detectar una regresion: huella vacia o error explicito `Unexpected APK signing certificate`.
- Que no volver a hacer: no parsear texto humano de `apksigner` para obtener la identidad criptografica.

## PACKAGE-001

- Identificador: PACKAGE-001.
- Fecha: 2026-07-13.
- Sintoma: compartir un directorio local completo produce paquetes enormes y puede arrastrar caches, builds, historial Git, APKs, respaldos o secretos.
- Contexto donde aparecio: preparacion de material para revision externa de ChatGPT.
- Causa raiz confirmada: una copia de workspace no distingue codigo versionado util de artefactos generados o informacion sensible.
- Solucion que funciona: generar paquetes de revision solo con el workflow manual `ChatGPT review package`, con exclusiones, escaneo de secretos, metadatos, checksum y extraccion de prueba.
- Que no volver a hacer: no volver a intentar compartir un archivo masivo cuando el codigo versionado puede empaquetarse de forma verificable en menos de 100 MB.
