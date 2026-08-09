import assert from "node:assert/strict";
import test from "node:test";
import { createTaskSchema, paginationSchema, updateTaskSchema } from "./task.contract.js";

test("acepta una tarea válida", () => {
  const result = createTaskSchema.safeParse({ title: "Tarea", userId: 1 });
  assert.equal(result.success, true);
});

test("rechaza campos inválidos como respuesta 400", () => {
  const result = createTaskSchema.safeParse({ title: "", userId: -1 });
  assert.equal(result.success, false);
});

test("convierte y limita los datos de paginación", () => {
  assert.deepEqual(paginationSchema.parse({ page: "2", limit: "5" }), { page: 2, limit: 5 });
  assert.equal(paginationSchema.safeParse({ limit: "101" }).success, false);
});

test("una actualización no puede estar vacía", () => {
  assert.equal(updateTaskSchema.safeParse({}).success, false);
});
