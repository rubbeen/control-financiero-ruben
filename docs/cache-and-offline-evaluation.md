# Cache y modo offline

React Query mejora la navegacion al reutilizar respuestas compatibles y actualizar en segundo plano. Las claves incluyen UID y cuenta, las solicitudes anteriores se cancelan al cambiar de cuenta y toda la cache se limpia al cerrar sesion.

No se habilito persistencia Firestore, service worker ni almacenamiento de movimientos en localStorage. Esto reduce datos residuales en WebView, copias Android y perfiles compartidos. Solo se guarda el ID de cuenta activa. Una futura experiencia offline requiere probar limpieza tras logout, cambio de usuario, backup Android, Smart Switch y perdida de conectividad en un dispositivo real.
