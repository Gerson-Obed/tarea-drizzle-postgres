import type { ErrorRequestHandler } from "express";
import { NotFoundError } from "../services/task.service.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
};
