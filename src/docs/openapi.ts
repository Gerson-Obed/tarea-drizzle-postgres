import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createTaskSchema,
  errorSchema,
  idParamsSchema,
  paginatedTasksSchema,
  paginationSchema,
  taskResponseSchema,
  updateTaskSchema,
} from "../package/contracts/task.contract.js";

const registry = new OpenAPIRegistry();
const Task = taskResponseSchema;
const CreateTask = createTaskSchema;
const UpdateTask = updateTaskSchema;
const TaskList = paginatedTasksSchema;
const ErrorResponse = errorSchema;

const json = (schema: z.ZodType) => ({
  "application/json": { schema },
});
const errors = {
  400: { description: "Datos inválidos", content: json(ErrorResponse) },
  404: { description: "Recurso no encontrado", content: json(ErrorResponse) },
};

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  summary: "Listar tareas con paginación",
  request: { query: paginationSchema },
  responses: { 200: { description: "Lista paginada", content: json(TaskList) }, 400: errors[400] },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks/{id}",
  summary: "Consultar una tarea",
  request: { params: idParamsSchema },
  responses: { 200: { description: "Tarea encontrada", content: json(Task) }, ...errors },
});

registry.registerPath({
  method: "post",
  path: "/api/tasks",
  summary: "Crear una tarea",
  request: { body: { content: json(CreateTask) } },
  responses: {
    201: { description: "Tarea creada", content: json(Task) },
    400: errors[400],
    404: errors[404],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/tasks/{id}",
  summary: "Actualizar parcialmente una tarea",
  request: { params: idParamsSchema, body: { content: json(UpdateTask) } },
  responses: { 200: { description: "Tarea actualizada", content: json(Task) }, ...errors },
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{id}",
  summary: "Eliminar una tarea",
  request: { params: idParamsSchema },
  responses: { 204: { description: "Tarea eliminada" }, 400: errors[400], 404: errors[404] },
});

export function generateOpenApiDocument() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
      title: "API de tareas - Zod, REST y tRPC",
      version: "1.0.0",
      description: "API REST documentada; tRPC está disponible en /trpc.",
    },
    servers: [{ url: "http://localhost:3000" }],
  });
}
