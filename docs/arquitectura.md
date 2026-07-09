# Arquitectura

Control Financiero Rubén usa una arquitectura local:

- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts y Lucide React.
- Backend: Python, FastAPI, SQLModel y SQLite.
- Android: Capacitor.
- Datos: `data/finance.db`.
- Exportaciones: `exports`.

El celular se conecta al computador por WiFi local usando la URL configurable del backend. No se usa nube ni conexion bancaria.
