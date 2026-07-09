# Control Financiero Rubén

Aplicacion personal para registrar ingresos, gastos, compras, ajustes, presupuestos, analisis mensual, reportes PDF, IA financiera local y copias de seguridad. La version actual usa Firebase Firestore para que puedas acceder desde el celular con internet aunque el computador este apagado.

## Requisitos

- Windows 10 o 11.
- Python 3.11 o superior.
- Node.js 20 o superior para el frontend y Capacitor.
- Android Studio para generar APK.
- Celular con internet para usar Firebase.

## Instalacion en Windows

1. Abre esta carpeta: `control-financiero-ruben`.
2. Ejecuta `start-backend.bat`.
3. En otra terminal ejecuta `start-frontend.bat`.
4. El backend queda en `http://TU-IP-LOCAL:8000`.
5. El frontend queda en la URL que muestre Vite, normalmente `http://localhost:5173`.

## Backend

El backend local FastAPI/SQLite queda como herramienta opcional. La app Android actual guarda y consulta datos en Firebase Firestore.

Endpoints principales:

- `GET /health`
- `GET/POST/PUT/DELETE /movements`
- `GET/POST/PUT/DELETE /categories`
- `GET/POST/PUT/DELETE /budgets`
- `GET /analytics/monthly`
- `GET /reports/monthly/pdf`
- `GET /backup/export/json`
- `GET /backup/export/csv`
- `POST /backup/import/json`

Para cargar datos de prueba ejecuta:

```bash
curl -X POST http://localhost:8000/seed/demo
```

## Frontend

El frontend usa React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Firebase y Capacitor.

Incluye:

- Dashboard con saldo, ingresos, gastos, balance, graficos y recomendaciones.
- Registro rapido de movimientos.
- Historial con filtros y edicion.
- Categorias.
- Presupuesto mensual.
- Analisis mensual.
- Comparativas.
- Reportes PDF.
- Backup JSON/CSV e importacion JSON.
- IA financiera con recomendaciones bajo demanda.
- Base de datos Firebase Firestore.

## Encontrar la IP local del computador

En Windows abre CMD o PowerShell y ejecuta:

```powershell
ipconfig
```

Busca la IPv4 de tu adaptador WiFi, por ejemplo `192.168.1.100`.

## Usar desde el celular

1. Enciende el backend con `start-backend.bat`.
2. Verifica que el celular y computador esten en la misma WiFi.
3. En la app abre Ajustes.
4. Configura la URL como `http://IP-DE-TU-PC:8000`.
5. Si no conecta, revisa firewall de Windows y que el backend este usando `0.0.0.0:8000`.

## Generar APK con Capacitor

Desde `frontend`:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

En Android Studio:

1. Espera que Gradle termine.
2. Conecta el Samsung Galaxy A33 por USB con depuracion USB activa.
3. Usa Run para instalar en el celular, o Build > Generate Signed Bundle / APK para crear APK.

La app no expone datos a internet publico. Solo se conecta a la URL local que configures.

## Registrar movimientos

En la navegacion inferior toca Agregar, selecciona tipo, valor, fecha, categoria y descripcion. Los campos de metodo de pago, lugar, nota, necesario y recurrente son opcionales.

## Reporte PDF

Abre Reportes, selecciona mes y toca Descargar PDF. El backend genera el archivo en `exports` y lo descarga al dispositivo.

## Copias de seguridad

- Exportar JSON: descarga categorias, movimientos y presupuestos.
- Exportar CSV: descarga movimientos.
- Importar JSON: valida estructura y evita duplicados por tipo, valor, fecha, categoria y descripcion.

## Seguridad

- No pide claves bancarias.
- No conecta bancos.
- No usa Firebase, Supabase, AWS, Azure ni Google Cloud.
- No usa publicidad ni rastreadores.
- No abre puertos del router.
- Guarda la informacion en SQLite local.
- Advierte si configuras una URL publica.

## Errores comunes

- Sin conexion: verifica backend encendido, IP correcta y misma WiFi.
- Categorias no aparecen: reinicia backend para ejecutar seed automatico.
- El celular no entra al backend: permite Python/Uvicorn en el Firewall de Windows.
- Capacitor no genera Android: instala Android Studio y configura el SDK.
- `npm` no existe: instala Node.js LTS.

## Funciones incluidas

MVP completo con CRUD, analitica, recomendaciones con datos reales, graficos, presupuesto, PDF, backup, PWA y configuracion de Capacitor.

## Mejoras futuras

- PIN local.
- Captura de recibos local.
- Mejoras de accesibilidad.
- Mas estilos de reporte.
- Sincronizacion manual entre dispositivos mediante respaldo local.
