# Diagnostico de rendimiento

La version base descargaba colecciones raiz completas, filtraba en JavaScript, sembraba categorias al listar y consultaba categorias por cada movimiento. `monthly()` construia seis resumentes y tendencias consultaba secuencialmente mes por mes. Todas las paginas, graficas y jsPDF vivian en un chunk de 1,746.74 kB.

La version final usa consultas por UID/cuenta/rango, pagina de 50, un Map de categorias, una sola carga de tendencias, calculos puros, cache con staleTime y rutas diferidas. Firebase Auth/Firestore suma 704.03 kB y debe cargar al inicio para restaurar sesion y proteger datos; por eso la reduccion inicial medida es 39.8%, no el 50% deseado.
