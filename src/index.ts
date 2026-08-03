import { TaskService } from "./services/task.service.js";

/**
 * Demo: el servicio se conecta al repositorio y este a la base de datos.
 * Ejecutar con: npm run dev  (requiere Postgres levantado y datos sembrados)
 */
async function main() {
  const taskService = new TaskService();

  console.log("Todas las tareas:");
  const tasks = await taskService.listAll();
  console.table(tasks);

  console.log("\nCreando una tarea nueva para el usuario 1...");
  const nueva = await taskService.createTask({
    title: "Probar el servicio",
    description: "Verificar que TaskService use TaskRepository",
    userId: 1,
  });
  console.log("Tarea creada:", nueva);

  console.log(`\nMarcando la tarea ${nueva.id} como completada...`);
  const completada = await taskService.completeTask(nueva.id);
  console.log("Tarea actualizada:", completada);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
