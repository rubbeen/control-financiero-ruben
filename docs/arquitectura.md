# Arquitectura v1.3.0

- UI: React, Vite, TypeScript, Tailwind y rutas hash.
- Estado remoto: TanStack React Query, cache exclusivamente en memoria.
- Identidad: Firebase Authentication Email/Password con correo verificado.
- Datos: `users/{uid}/{accounts|categories|movements|budgets}` en Firestore.
- Contadores e inicializacion: `users/{uid}/meta/*` mediante transacciones.
- Analitica: carga un rango y ejecuta calculos puros sin consultas internas.
- Android: Capacitor, HTTPS, backup desactivado y release con firma externa.

FastAPI, SQLite, puerto 8000, IP local y Python fueron retirados al confirmar que el frontend no los importaba.
