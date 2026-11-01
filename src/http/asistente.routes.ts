import type { Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { generarPlan, responderChat } from "../ai/asistente.js";
import { validate } from "./validation.js";

export const asistenteRouter = Router();

const chatSchema = z.object({
  mensaje: z.string().trim().min(1).max(1000),
  userId: z.number().int().positive(),
});

const planEntradaSchema = z.object({
  objetivo: z.string().trim().min(3).max(500),
});

// El SDK no lanza los errores del modelo: los manda dentro del stream. Por eso
// leemos el stream entero y, si llega un error antes del primer trozo, todavía
// podemos responder 502. Si llega a la mitad, cortamos la respuesta.
const fallar = (res: Response, mensaje: string, detalle: unknown) => {
  if (!res.headersSent) {
    res.status(502).json({ error: mensaje, detalle: String(detalle) });
  } else {
    res.end();
  }
};

asistenteRouter.post("/chat", validate("body", chatSchema), async (req, res) => {
  const { mensaje, userId } = req.validated!.body as z.infer<typeof chatSchema>;
  const resultado = responderChat({ mensaje, userId });
  let escrito = false;
  try {
    for await (const parte of resultado.fullStream) {
      if (parte.type === "error") return fallar(res, "El asistente no respondió", parte.error);
      if (parte.type !== "text-delta") continue;
      if (!escrito) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        escrito = true;
      }
      res.write(parte.text);
    }
    if (!escrito) return fallar(res, "El asistente no devolvió texto", "stream vacío");
    res.end();
  } catch (error) {
    fallar(res, "El asistente no respondió", error);
  }
});

asistenteRouter.post("/plan", validate("body", planEntradaSchema), async (req, res) => {
  const { objetivo } = req.validated!.body as z.infer<typeof planEntradaSchema>;
  const resultado = generarPlan({ objetivo });
  let escrito = false;
  try {
    for await (const parte of resultado.fullStream) {
      if (parte.type === "error") return fallar(res, "El planificador no respondió", parte.error);
      if (parte.type !== "object") continue;
      if (!escrito) {
        res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
        escrito = true;
      }
      res.write(JSON.stringify(parte.object) + "\n");
    }
    if (!escrito) return fallar(res, "El planificador no devolvió un plan", "stream vacío");
    res.end();
  } catch (error) {
    fallar(res, "El planificador no respondió", error);
  }
});
