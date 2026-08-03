import { db } from "./index.js";
import { users, tasks } from "./schema.js";

async function seed() {
  console.log("Sembrando datos...");

  // Limpiar tablas (orden importa por la FK)
  await db.delete(tasks);
  await db.delete(users);

  const insertedUsers = await db
    .insert(users)
    .values([
      { name: "Roberto Melendez", email: "roberto@example.com" },
      { name: "Ana Garcia", email: "ana@example.com" },
    ])
    .returning();

  const [roberto, ana] = insertedUsers;

  await db.insert(tasks).values([
    {
      title: "Levantar PostgreSQL en Docker",
      description: "Configurar docker-compose.yml con la imagen postgres",
      completed: true,
      userId: roberto.id,
    },
    {
      title: "Escribir schema.ts",
      description: "Definir tablas users y tasks con Drizzle",
      completed: true,
      userId: roberto.id,
    },
    {
      title: "Generar migración",
      description: "Correr drizzle-kit generate",
      completed: true,
      userId: roberto.id,
    },
    {
      title: "Sembrar datos",
      description: "Correr el script de seed",
      completed: false,
      userId: ana.id,
    },
    {
      title: "Conectar servicio con repositorio",
      description: "Implementar TaskService sobre TaskRepository",
      completed: false,
      userId: ana.id,
    },
  ]);

  console.log("Seed completado.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error al sembrar datos:", err);
  process.exit(1);
});
