# Plan de pruebas Play

1. Ejecutar unitarias, reglas, E2E, responsive 320-1366 px y fuente 200 %.
2. Probar en track interno con cuenta sintetica y correo verificado.
3. Validar carga lenta, sin red, refetch con cache y errores de permisos.
4. Validar selector SAF, cancelar, guardar, abrir y compartir PDF/CSV/respaldo.
5. Validar importacion bloqueada si no se guarda respaldo preventivo.
6. Validar capturas permitidas por defecto y bloqueadas al activar privacidad.
7. Validar AAB con bundletool, API 35, firma, ausencia de `.so`, 16 KB y ausencia del actualizador externo.
8. Probar instalacion y reanudacion en dispositivo fisico sin borrar datos.
