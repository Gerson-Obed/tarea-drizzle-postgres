import assert from "node:assert/strict";
import test from "node:test";
import { TaskService, NotFoundError } from "./task.service.js";
import type { TaskRepository } from "../repositories/task.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { Task } from "../db/schema.js";

// Repositorios falsos: el servicio no sabe si hay base de datos, así que
// estas pruebas corren sin Docker.
const tarea = (extra: Partial<Task> = {}): Task => ({
  id: 1,
  title: "Estudiar",
  description: null,
  completed: false,
  userId: 1,
  createdAt: new Date("2026-10-31T00:00:00Z"),
  ...extra,
});

const repoTareas = (tareas: Task[] = []) => {
  const llamadas: string[] = [];
  const repo = {
    findById: async (id: number) => {
      llamadas.push(`findById:${id}`);
      return tareas.find((t) => t.id === id);
    },
    update: async (id: number, data: Partial<Task>) => {
      llamadas.push(`update:${id}`);
      const actual = tareas.find((t) => t.id === id);
      return actual ? { ...actual, ...data } : undefined;
    },
    delete: async (id: number) => {
      llamadas.push(`delete:${id}`);
      return tareas.some((t) => t.id === id);
    },
    markCompleted: async (id: number) => {
      llamadas.push(`markCompleted:${id}`);
      const actual = tareas.find((t) => t.id === id);
      return actual ? { ...actual, completed: true } : undefined;
    },
  };
  return { repo: repo as unknown as TaskRepository, llamadas };
};

const repoUsuarios = (ids: number[] = []) => ({
  findById: async (id: number) => (ids.includes(id) ? { id, name: "x", email: "x@x", createdAt: new Date() } : undefined),
}) as unknown as UserRepository;

test('getById lanza NotFoundError con el mensaje "La tarea N no existe"', async () => {
  const { repo } = repoTareas([]);
  const servicio = new TaskService(repo, repoUsuarios());

  await assert.rejects(() => servicio.getById(99), (error: unknown) => {
    assert.ok(error instanceof NotFoundError);
    assert.equal(error.message, "La tarea 99 no existe");
    return true;
  });
});

test("createTask rechaza una tarea para un usuario que no existe y no la guarda", async () => {
  const { repo, llamadas } = repoTareas([]);
  const servicio = new TaskService(repo, repoUsuarios([1]));

  await assert.rejects(
    () => servicio.createTask({ title: "Nueva", userId: 42 }),
    (error: unknown) => error instanceof NotFoundError && error.message === "El usuario 42 no existe",
  );
  assert.deepEqual(llamadas, []);
});

test("updateTask revisa que el nuevo usuario exista antes de actualizar", async () => {
  const { repo, llamadas } = repoTareas([tarea()]);
  const servicio = new TaskService(repo, repoUsuarios([1]));

  await assert.rejects(
    () => servicio.updateTask(1, { userId: 42 }),
    (error: unknown) => error instanceof NotFoundError && error.message === "El usuario 42 no existe",
  );
  assert.ok(!llamadas.includes("update:1"), "no debió llegar a actualizar la tarea");
});

test("completeTask marca la tarea como completada", async () => {
  const { repo } = repoTareas([tarea({ completed: false })]);
  const servicio = new TaskService(repo, repoUsuarios([1]));

  const resultado = await servicio.completeTask(1);

  assert.equal(resultado.completed, true);
});

test("removeTask lanza NotFoundError si la tarea no existe", async () => {
  const { repo } = repoTareas([]);
  const servicio = new TaskService(repo, repoUsuarios([1]));

  await assert.rejects(() => servicio.removeTask(7), NotFoundError);
});
