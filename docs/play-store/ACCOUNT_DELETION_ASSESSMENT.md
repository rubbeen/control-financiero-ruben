# Evaluacion de eliminacion de cuenta

La version 1.3.4 permite crear cuentas dentro de la app y exige verificar el correo antes de acceder a Firestore. La distribucion en Google Play esta pausada; no se declara ni se publica todavia un flujo de eliminacion de cuenta.

Antes de retomar Google Play se requiere un flujo completo: reautenticacion, respaldo opcional, confirmacion explicita, eliminacion reanudable de `users/{uid}`, eliminacion de Authentication, tratamiento de fallos parciales y recurso web funcional. Ese trabajo sigue siendo requisito de una futura version para Play y no debe declararse como disponible en v1.3.4.
