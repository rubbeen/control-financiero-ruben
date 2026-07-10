# Rendimiento antes y despues

`N` es la cantidad de movimientos devuelta por las lecturas completas antiguas. Los tiempos anteriores de pantalla no fueron medidos; se conservan como `no medido`.

| Escenario | Antes | Despues | Mejora | Consultas antes | Consultas despues | Documentos antes | Documentos despues |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| Dashboard | tiempo no medido | 1,419 ms despues de login E2E local; 868.40 ms Firestore aislado | medido solo despues | `25+14N` mas tendencias | 5 | colecciones completas repetidas | 860 con fixture extremo de 5,000 |
| Analisis | tiempo no medido | cache compatible reutilizable | elimina recalculos | `24+12N` | 0 adicionales si clave coincide | repetidos | 0 adicionales si cache vigente |
| Tendencias | tiempo no medido | un rango | 6-12 consultas a 1 | una por mes | 1 incluida en rango | meses separados | maximo 2,000 del rango |
| Historial | tiempo no medido | 186 ms E2E local; 114.89 ms Firestore aislado | paginado | 1 completa + `2N` categorias | 1 por pagina | toda la historia | maximo 50 |
| Crear | tiempo no medido | transaccion unica | atomico | escaneo ID + escritura | 1 transaccion | coleccion completa para ID | contador + cuenta + movimiento |
| Cambio cuenta | tiempo no medido | no aislado correctamente | cache/UID/cuenta | pantallas independientes | 4 logicas; cuentas/categorias cache | no acotado | rango acotado |
| Bundle inicial | 1,746,740 B | 1,052,271 B (287,202 B gzip) | 39.8% | n/a | n/a | n/a | n/a |
