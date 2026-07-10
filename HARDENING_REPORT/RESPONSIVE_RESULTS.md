# Resultados responsive

Playwright recorrio Login, Dashboard, Agregar, Historial, Detalle, Analisis, Presupuesto, Reportes, Ajustes, Backup, Actualizaciones y Cuentas en 360x800, 390x844, 412x915, 768x1024 y 1366x768.

- 60 capturas locales en `screenshots/`.
- `scrollWidth <= innerWidth` en todos los recorridos.
- Bottom Navigation con cinco opciones, texto de 12 px y targets >=44 px.
- Login usa `min-w-0`, ancho completo y contenido envolvente.
- Montos grandes se apilan o envuelven; filas largas reservan ancho al monto.
- Header usa safe-area, titulo/correo truncados y Atrás accesible.
- Formularios sin guardar y dialogo accesible verificados.

Pendiente: teclado, gesto, Recents y orientacion en Samsung Galaxy A33 fisico.
