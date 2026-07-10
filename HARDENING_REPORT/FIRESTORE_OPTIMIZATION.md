# Optimizacion Firestore

Se eliminaron `nextNumericId`, `decorate()` con N+1, filtros de cuenta solo en cliente, tendencias mensuales secuenciales y resumentes recursivos. Contadores e inicializacion son transaccionales. Movimientos usan account/rango/orden/limite/cursor; presupuestos tienen ID determinista; categorias se convierten en Map. React Query evita duplicados dentro de staleTime y descarta/cancela trabajo de la cuenta anterior.
