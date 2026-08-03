# Tarea - Programación 4

Postgres en Docker + esquema en Drizzle ORM, con arquitectura de repositorio y servicio.

## Requisitos

- Node.js 18+
- Docker y Docker Compose

## 1. Levantar PostgreSQL en Docker

```bash
cp .env.example .env
npm install
npm run docker:up
```

Esto levanta un contenedor `postgres:16-alpine` en el puerto `5432` con:

- usuario: `tarea_user`
- password: `tarea_pass`
- base de datos: `tarea_db`

Para bajarlo: `npm run docker:down`

## 2. Esquema (schema.ts)

El esquema vive en `src/db/schema.ts` y define dos tablas:

- **users**: id, name, email, created_at
- **tasks**: id, title, description, completed, user_id (FK a users), created_at

## 3. Generar y aplicar la migración

```bash
npm run db:generate   # genera el SQL en drizzle/ a partir de schema.ts
npm run db:migrate    # aplica la migración contra la base de datos
```

La migración ya generada está en `drizzle/0000_great_zarda.sql`. Si modificás
`schema.ts`, corré `db:generate` de nuevo para crear una migración nueva.

## 4. Sembrar datos

```bash
npm run db:seed
```

Inserta 2 usuarios y 5 tareas de ejemplo (definidos en `src/db/seed.ts`).

## 5. Servicio conectado al repositorio

- `src/repositories/task.repository.ts` y `user.repository.ts`: acceso a datos
  (consultas Drizzle puras).
- `src/services/task.service.ts`: lógica de negocio, usa `TaskRepository` y
  `UserRepository` por inyección de dependencias.
- `src/index.ts`: demo que instancia `TaskService` y lo ejercita.

```bash
npm run dev
```

## Estructura del proyecto

```
.
├── docker-compose.yml
├── drizzle.config.ts
├── drizzle/                  # migraciones generadas
├── src/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts          # cliente de Drizzle (Pool de pg)
│   │   └── seed.ts
│   ├── repositories/
│   │   ├── task.repository.ts
│   │   └── user.repository.ts
│   ├── services/
│   │   └── task.service.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Flujo completo

```bash
cp .env.example .env
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
npm run dev
```
