# Matriz de consultas Firestore

| Pantalla | Query key | Coleccion/filtros | Orden/limite/indice | staleTime | Invalidacion y cache |
| --- | --- | --- | --- | --- | --- |
| Global | `accounts,uid` | accounts activas | sin limite practico; max cuentas usuario | 10 min | crear/editar/saldo; memoria |
| Global | `categories,uid` | categories | max categorias usuario | 24 h | cambios categoria/logout |
| Dashboard/Analisis | `budget,uid,account,year,month` | documento `account-year-month` | lectura directa, 1 doc | 30 s o 5 min historico | guardar presupuesto |
| Dashboard/Analisis | `financialAnalysis,uid,account,period,trendMonths` | movements por account y rango | `date desc,id desc`, limit 2,000; indice account/date/id | 30 s o 5 min | mutaciones de cuenta/periodo |
| Dashboard | `latestMovements,uid,account` dentro del dataset | account | `date desc,id desc`, limit 5 | 30 s | mutacion de movimientos |
| Historial | `movements,uid,account,filters` | account, fechas, categoria/tipo opcional | `date desc,id desc`, limit 50, `startAfter`; indices declarados | 30 s | mutacion de cuenta; paginas en memoria |
| Detalle | `movement,uid,id` | documento directo | 1 doc | 30 s | editar/eliminar |

No hay consultas de categoria por fila ni lectura completa en Dashboard o Historial.
