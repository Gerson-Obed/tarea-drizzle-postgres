import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  completed: z.boolean().optional().default(false),
  userId: z.number().int().positive(),
}).strict();

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  userId: z.number().int().positive().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Debe enviar al menos un campo para actualizar",
});

export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.number().int().positive(),
  createdAt: z.date(),
});

export const taskResponseSchema = taskSchema.extend({
  createdAt: z.iso.datetime(),
});

export const paginatedTasksSchema = z.object({
  data: z.array(taskResponseSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const errorSchema = z.object({
  error: z.string(),
  issues: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
