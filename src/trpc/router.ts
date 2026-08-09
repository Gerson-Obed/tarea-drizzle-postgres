import { initTRPC, TRPCError } from "@trpc/server";
import { createTaskSchema, idParamsSchema, paginationSchema, updateTaskSchema } from "../package/contracts/task.contract.js";
import { NotFoundError, TaskService } from "../services/task.service.js";

const t = initTRPC.create();
const service = new TaskService();

function translateNotFound(error: unknown): never {
  if (error instanceof NotFoundError) {
    throw new TRPCError({ code: "NOT_FOUND", message: error.message });
  }
  throw error;
}

export const appRouter = t.router({
  tasks: t.router({
    list: t.procedure.input(paginationSchema.optional()).query(({ input }) =>
      service.listPaginated(input?.page ?? 1, input?.limit ?? 10)
    ),
    byId: t.procedure.input(idParamsSchema).query(async ({ input }) => {
      try { return await service.getById(input.id); } catch (error) { translateNotFound(error); }
    }),
    create: t.procedure.input(createTaskSchema).mutation(async ({ input }) => {
      try { return await service.createTask(input); } catch (error) { translateNotFound(error); }
    }),
    update: t.procedure
      .input(idParamsSchema.extend({ data: updateTaskSchema }))
      .mutation(async ({ input }) => {
        try { return await service.updateTask(input.id, input.data); } catch (error) { translateNotFound(error); }
      }),
    delete: t.procedure.input(idParamsSchema).mutation(async ({ input }) => {
      try {
        await service.removeTask(input.id);
        return { success: true };
      } catch (error) { translateNotFound(error); }
    }),
  }),
});

export type AppRouter = typeof appRouter;
