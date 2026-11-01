import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasks, users } from "../db/schema.js";
import { TaskService, NotFoundError } from "./task.service.js";

// Estas pruebas necesitan la base levantada:  docker compose up -d
// Usan la base real: el servicio y los repositorios, sin nada falso.

const servicio = new TaskService();

let ana: number;

beforeEach(async () => {
  await db.delete(tasks);
  await db.delete(users);
  const [usuario] = await db
    .insert(users)
    .values({ name: "Ana", email: "ana@example.com" })
    .returning();
  ana = usuario.id;
});

describe("TaskService con base de datos", () => {
  it("crea una tarea para un usuario existente", async () => {
    const creada = await servicio.createTask({ title: "Entregar tarea", userId: ana });

    assert.equal(creada.title, "Entregar tarea");
    assert.equal(creada.userId, ana);
    assert.equal(creada.completed, false);
    assert.equal((await servicio.getById(creada.id)).id, creada.id);
  });

  it("no guarda nada si el usuario no existe", async () => {
    await assert.rejects(
      () => servicio.createTask({ title: "Huérfana", userId: 999_999 }),
      (error: unknown) => error instanceof NotFoundError,
    );

    const todas = await servicio.listAll();
    assert.equal(todas.length, 0);
  });

  it("lista por usuario solo las tareas de ese usuario", async () => {
    const otro = await db.insert(users).values({ name: "Luis", email: "luis@example.com" }).returning();
    await servicio.createTask({ title: "De Ana", userId: ana });
    await servicio.createTask({ title: "De Ana 2", userId: ana });
    await servicio.createTask({ title: "De Luis", userId: otro[0].id });

    const deAna = await servicio.listByUser(ana);

    assert.equal(deAna.length, 2);
    assert.ok(deAna.every((t) => t.userId === ana));
  });

  it("pagina las tareas con el total correcto", async () => {
    for (let i = 1; i <= 5; i++) {
      await servicio.createTask({ title: `Tarea ${i}`, userId: ana });
    }

    const pagina2 = await servicio.listPaginated(2, 2);

    assert.equal(pagina2.data.length, 2);
    assert.equal(pagina2.total, 5);
    assert.equal(pagina2.totalPages, 3);
  });

  it("completa una tarea existente", async () => {
    const creada = await servicio.createTask({ title: "Por hacer", userId: ana });

    const completada = await servicio.completeTask(creada.id);

    assert.equal(completada.completed, true);
  });

  it("actualiza el título y lo deja guardado", async () => {
    const creada = await servicio.createTask({ title: "Vieja", userId: ana });

    await servicio.updateTask(creada.id, { title: "Nueva" });

    assert.equal((await servicio.getById(creada.id)).title, "Nueva");
  });

  it("no actualiza una tarea que no existe", async () => {
    await assert.rejects(() => servicio.updateTask(999_999, { title: "x" }), NotFoundError);
  });

  it("elimina una tarea y después ya no existe", async () => {
    const creada = await servicio.createTask({ title: "Borrar", userId: ana });

    await servicio.removeTask(creada.id);

    await assert.rejects(() => servicio.getById(creada.id), NotFoundError);
  });

  it("al borrar un usuario se borran sus tareas", async () => {
    await servicio.createTask({ title: "Se va con Ana", userId: ana });

    await db.delete(users).where(eq(users.id, ana));

    assert.equal((await servicio.listAll()).length, 0);
  });
});
