# Decisiones tecnicas

## TD-006: estado asincrono y reintentos Firebase

- Decision: reintentar solo errores transitorios hasta tres veces con 500, 1000 y 2000 ms; errores de acceso no se reintentan.
- Motivo: evita falsos errores y bucles ante reglas o sesiones invalidas.

## TD-007: Storage Access Framework para exportaciones

- Decision: Android guarda con `ACTION_CREATE_DOCUMENT`; compartir usa `@capacitor/share` y solo `cache/exports/`.
- Motivo: confirma persistencia sin permisos generales de almacenamiento.

## TD-008: dos canales de distribucion

- Decision: flavors `github` y `play` sin duplicar la aplicacion. Solo GitHub declara instalacion externa.
- Motivo: cumplir Play y conservar actualizaciones directas de GitHub.

## TD-009: Fastlane Supply fijado

- Decision: `play-publish.yml` usa Fastlane 2.228.0 mediante Gemfile.
- Motivo: herramienta mantenida, versionada y con soporte directo para tracks y estados de release; evita una accion opaca de publicacion.

## TD-001: grid adaptable para movimientos

- Decision: usar `44px minmax(0, 1fr)` en movil y agregar `max-content` para el importe desde `sm`.
- Motivo: garantiza espacio al texto y mantiene el importe completo sin posiciones absolutas.
- Alternativas descartadas: una sola fila flex, reducir fuente, truncar y ocultar overflow.
- Consecuencias: las tarjetas crecen verticalmente cuando el contenido lo requiere.
- Condiciones para reconsiderarla: solo si pruebas equivalentes demuestran contenido completo desde 320 px y fuente de 22 px.

## TD-002: configuracion publica sin identidad personal

- Decision: cargar la configuracion web de Firebase desde variables `VITE_FIREBASE_*` y mantener solo placeholders en `.env.example`.
- Motivo: evita publicar identificadores innecesarios y separa configuracion local de codigo versionado.
- Alternativas descartadas: constantes personales incrustadas y correo propietario fijo en login o recuperacion.
- Consecuencias: cada entorno debe proporcionar su `.env.local`; Emulator usa valores ficticios.
- Condiciones para reconsiderarla: ninguna mientras Vite sea el sistema de build.

## TD-003: aislamiento por UID en plantillas versionadas

- Decision: las reglas publicas de referencia usan UID y correo verificado; el acceso temporal a raiz exige un claim de migracion.
- Motivo: la identidad propietaria no debe quedar escrita en un repositorio publico.
- Alternativas descartadas: correo personal hardcoded y reglas abiertas.
- Consecuencias: estas plantillas no se despliegan automaticamente; cualquier cambio de produccion requiere un procedimiento separado.
- Condiciones para reconsiderarla: solo con una estrategia multiusuario aprobada y pruebas del Emulator.

## TD-004: no publicar v1.3.2 con firma debug

- Decision: integrar el codigo, pero no crear GitHub Release ni modificar `update-manifest.json` mientras no exista APK release compatible y verificada.
- Motivo: la seguridad de una actualizacion depende del certificado, `applicationId` y aumento de `versionCode`.
- Alternativas descartadas: publicar debug o sustituir silenciosamente el certificado instalado.
- Consecuencias: el boton de actualizar sigue ofreciendo la ultima version publica valida.
- Condiciones para reconsiderarla: disponer de una clave release autorizada y un plan explicito de transicion desde la instalacion debug.

## TD-005: firma release permanente desde v1.3.2

- Decision: usar una sola identidad release RSA permanente fuera de Git y reconstruirla temporalmente en CI desde secrets.
- Motivo: las futuras actualizaciones requieren conservar el certificado de v1.3.2.
- Alternativas descartadas: reutilizar debug, crear una clave por release o guardar la clave en el repositorio.
- Consecuencias: la migracion desde v1.3.1 debug es manual; `update-manifest.json` permanece en v1.3.1 hasta una version posterior compatible.
- Condiciones para reconsiderarla: ninguna salvo una migracion de firma planificada y aprobada para todos los usuarios.
