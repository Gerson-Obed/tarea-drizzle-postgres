import { z } from "zod";

// Salida estructurada del plan. Cada campo tiene su .describe(): el modelo
// lo lee como instrucción, no solo como nombre.
export const planSchema = z.object({
  resumen: z.string().describe("Una frase que resume el plan para el usuario."),
  tareas: z
    .array(
      z.object({
        titulo: z.string().describe("Título corto de la tarea, en español."),
        prioridad: z
          .enum(["alta", "media", "baja"])
          .describe("Qué tan urgente es la tarea respecto al objetivo."),
        pasos: z.array(z.string()).describe("Pasos concretos para completarla, máximo 5."),
      }),
    )
    .describe("Entre 1 y 8 tareas que llevan al objetivo."),
});

export type Plan = z.infer<typeof planSchema>;
