# Matriz de navegacion

| Ruta | Destino Atrás sin historial |
| --- | --- |
| `/login` | acceso; al autenticar redirige a `/` |
| `/` | doble pulsacion en <2 s para salir |
| `/add`, `/history`, `/analysis`, `/settings` | destinos principales |
| `/movements/:id` | `/history` |
| `/settings/accounts`, `/settings/categories`, `/settings/backup`, `/settings/updates` | `/settings` |
| `/budget`, `/reports`, `/advisor` | `/` |
| `/comparisons` | `/analysis` |

El orden de Atrás es: cerrar dialogo, bloquear formulario modificado, historial real, fallback. Navegador, boton visual y Android usan el mismo router.
