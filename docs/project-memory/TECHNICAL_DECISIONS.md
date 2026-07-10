# Decisiones tecnicas

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
