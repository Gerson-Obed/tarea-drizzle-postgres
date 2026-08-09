import { Router, type RequestHandler } from "express";
import {
  createTaskSchema,
  idParamsSchema,
  paginationSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "../package/contracts/task.contract.js";
import { TaskService } from "../services/task.service.js";
import { validate } from "./validation.js";

export const taskRouter = Router();
const service = new TaskService();
const asyncRoute = (handler: RequestHandler): RequestHandler => handler;

taskRouter.get("/", validate("query", paginationSchema), asyncRoute(async (req, res) => {
  const { page, limit } = req.validated!.query as { page: number; limit: number };
  res.json(await service.listPaginated(page, limit));
}));

taskRouter.get("/:id", validate("params", idParamsSchema), asyncRoute(async (req, res) => {
  const { id } = req.validated!.params as { id: number };
  res.json(await service.getById(id));
}));

taskRouter.post("/", validate("body", createTaskSchema), asyncRoute(async (req, res) => {
  const task = await service.createTask(req.validated!.body as CreateTaskInput);
  res.status(201).json(task);
}));

taskRouter.patch(
  "/:id",
  validate("params", idParamsSchema),
  validate("body", updateTaskSchema),
  asyncRoute(async (req, res) => {
    const { id } = req.validated!.params as { id: number };
    res.json(await service.updateTask(id, req.validated!.body as UpdateTaskInput));
  })
);

taskRouter.delete("/:id", validate("params", idParamsSchema), asyncRoute(async (req, res) => {
  const { id } = req.validated!.params as { id: number };
  await service.removeTask(id);
  res.status(204).send();
}));
