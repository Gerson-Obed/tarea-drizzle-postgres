import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, streamObject, streamText, tool, type LanguageModel } from "ai";
import { z } from "zod";
import { NotFoundError, TaskService } from "../services/task.service.js";
import { planSchema } from "./schemas.js";

const servicio = new TaskService();
const modeloPorDefecto = (): LanguageModel => anthropic("claude-sonnet-5-5");

// Herramienta real: consulta la base. Si el usuario no existe, no lanza:
// devuelve el error como dato para que el modelo lo pueda explicar.
export const tareasDelUsuario = tool({
  description: "Lista las tareas que ya tiene un usuario. Úsala antes de proponer tareas para no repetirlas.",
  inputSchema: z.object({
    userId: z.number().int().positive().describe("Id del usuario en la base."),
  }),
  execute: async ({ userId }) => {
    try {
      const tareas = await servicio.listByUser(userId);
      return { tareas: tareas.map((t) => ({ titulo: t.title, completada: t.completed })) };
    } catch (error) {
      if (error instanceof NotFoundError) return { error: error.message };
      throw error;
    }
  },
});

// El tope de 4 pasos: un paso para llamar la herramienta, uno para leer su
// respuesta y uno para contestar, con un margen. Sin tope, un modelo que
// siga pidiendo la herramienta podría gastar tokens sin fin.
const TOPE_PASOS = 4;

export function responderChat({
  mensaje,
  userId,
  modelo = modeloPorDefecto(),
}: {
  mensaje: string;
  userId: number;
  modelo?: LanguageModel;
}) {
  return streamText({
    model: modelo,
    system:
      `Eres el asistente de tareas. Responde en español y de forma breve. ` +
      `El usuario tiene id ${userId}. Si pregunta por sus tareas, usa la herramienta tareasDelUsuario.`,
    prompt: mensaje,
    tools: { tareasDelUsuario },
    stopWhen: stepCountIs(TOPE_PASOS),
  });
}

export function generarPlan({
  objetivo,
  modelo = modeloPorDefecto(),
}: {
  objetivo: string;
  modelo?: LanguageModel;
}) {
  return streamObject({
    model: modelo,
    schema: planSchema,
    system:
      "Eres un planificador de tareas. Convierte el objetivo del usuario en un plan " +
      "de tareas concretas, en español. Si el texto no es un objetivo, devuelve un " +
      "plan con una sola tarea que pida reformularlo.",
    prompt: objetivo,
  });
}
