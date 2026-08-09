# API de tareas con Drizzle, Zod, REST y tRPC

Proyecto de Programación 4 que usa PostgreSQL en Docker, Drizzle ORM, contratos
con Zod, cinco endpoints REST, procedimientos tRPC y documentación OpenAPI.

## Ejecutar

```bash
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```

Abrir Swagger en <http://localhost:3000/docs>.

## REST

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/tasks?page=1&limit=10` | Lista paginada |
| GET | `/api/tasks/:id` | Una tarea |
| POST | `/api/tasks` | Crear una tarea |
| PATCH | `/api/tasks/:id` | Actualizar una tarea |
| DELETE | `/api/tasks/:id` | Eliminar una tarea |

Los cuerpos, parámetros y consultas pasan por contratos Zod. Si son inválidos,
la API responde con código `400` y una lista de errores.

Ejemplo para crear:

```json
{
  "title": "Aprender tRPC",
  "description": "Probar la mutación desde un cliente",
  "userId": 1
}
```

## tRPC

El endpoint está montado en `/trpc` y expone:

- Consultas: `tasks.list`, `tasks.byId`.
- Mutaciones: `tasks.create`, `tasks.update`, `tasks.delete`.

El tipo `AppRouter` se exporta desde `src/trpc/router.ts` para que un cliente
tRPC obtenga los tipos de entrada y salida automáticamente.

## OpenAPI

La documentación se sirve en `/docs`, el documento JSON en `/openapi.json` y
también puede exportarse al archivo raíz `openapi.json` con:

```bash
npm run docs:generate
```
