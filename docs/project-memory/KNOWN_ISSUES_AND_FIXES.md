# Problemas conocidos y soluciones

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
