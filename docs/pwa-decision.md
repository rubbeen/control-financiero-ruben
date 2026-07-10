# Decision PWA

La via principal de distribucion es la APK de Capacitor. Se retiro el manifiesto web incompleto porque no existian service worker, iconos ni estrategia de actualizacion. La aplicacion web sigue funcionando en un navegador, pero no se anuncia como PWA instalable.

Esta decision evita almacenar por accidente recursos o estados financieros en caches administradas por un service worker. Una PWA futura requiere una revision separada de autenticacion, limpieza de cache y actualizaciones.
