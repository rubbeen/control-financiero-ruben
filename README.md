# Control Financiero Ruben

Aplicacion de control financiero personal en COP para Android y web.

La version actual usa Firebase Firestore para guardar la informacion en la nube. Esto permite consultar los datos desde el celular con internet aunque el computador este apagado.

## Funciones principales

- Dashboard con saldo, ingresos, gastos, balance y graficos.
- Cuentas separadas para manejar ahorro, efectivo, proyectos u otros balances independientes.
- Registro de ingresos y gastos con categoria, fecha, metodo, notas y clasificacion.
- Historial con filtros y edicion.
- Categorias y presupuestos mensuales.
- Analisis mensual, comparativas y reportes.
- IA financiera local con recomendaciones bajo demanda segun consumos diarios y mensuales.
- Firebase Firestore como base de datos principal.
- Login con Firebase Authentication limitado a `ribenp7@gmail.com`.
- Actualizaciones por GitHub Releases desde la app.

## Moneda

La app esta pensada para Colombia y muestra valores en peso colombiano, COP.

## Android

El APK publicado esta en la seccion Releases:

https://github.com/rubbeen/control-financiero-ruben/releases

Para instalar:

1. Descarga el APK de la ultima release.
2. Abre el archivo en Android.
3. Permite instalar aplicaciones desconocidas si Android lo solicita.
4. En futuras versiones, abre Ajustes > Actualizar version dentro de la app.

## Frontend

El frontend usa React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Firebase y Capacitor.

Comandos:

```bash
cd frontend
npm install
npm run build
npx cap sync android
```

## Backend opcional

El backend FastAPI/SQLite se conserva como herramienta local opcional para pruebas y exportaciones. La app Android actual trabaja principalmente con Firebase Firestore.

Comandos:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Seguridad

- No pide claves bancarias.
- No conecta bancos.
- No usa publicidad.
- Firestore debe usar las reglas incluidas en `firestore.rules`.
- Storage queda cerrado con `storage.rules`.
- La configuracion publica de Firebase no es una clave secreta; la seguridad real esta en Firebase Authentication y las reglas.

## Version

Version publicada: v1.2.0
