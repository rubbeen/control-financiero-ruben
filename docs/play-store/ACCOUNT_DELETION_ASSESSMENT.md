# Evaluacion de eliminacion de cuenta

La version 1.3.3 conserva acceso restringido y no permite crear cuentas dentro de la app. No se implementa una eliminacion destructiva incompleta.

Antes de habilitar registro publico se requiere un flujo completo: reautenticacion, respaldo opcional, confirmacion explicita, eliminacion reanudable de `users/{uid}`, eliminacion de Authentication, tratamiento de fallos parciales y recurso web funcional. Ese trabajo es requisito de una futura version publica, no una funcion declarada en 1.3.3.
