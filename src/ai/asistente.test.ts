import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { generarPlan, responderChat, tareasDelUsuario } from "./asistente.js";
import { planSchema } from "./schemas.js";

// Modelo falso: no gasta tokens y devuelve exactamente lo que le indicamos.
const uso = {
  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

const modeloConTexto = (trozos: string[]) =>
  new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t" },
          ...trozos.map((delta) => ({ type: "text-delta" as const, id: "t", delta })),
          { type: "text-end", id: "t" },
          { type: "finish", usage: uso, finishReason: { unified: "stop", raw: "end_turn" } },
        ],
      }),
    }),
  });

// Modelo que siempre pide la herramienta: sirve para probar el tope de pasos.
const modeloQuePideHerramienta = () =>
  new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          {
            type: "tool-call",
            toolCallId: "c1",
            toolName: "tareasDelUsuario",
            input: JSON.stringify({ userId: 1 }),
          },
          { type: "finish", usage: uso, finishReason: { unified: "tool-calls", raw: "tool_use" } },
        ],
      }),
    }),
  });

const planValido = {
  resumen: "Preparar el examen en tres días.",
  tareas: [
    { titulo: "Repasar derivadas", prioridad: "alta", pasos: ["Hacer 10 ejercicios"] },
  ],
};

describe("planSchema", () => {
  it("acepta un plan con la forma correcta", () => {
    assert.equal(planSchema.safeParse(planValido).success, true);
  });

  it("rechaza una prioridad que no existe", () => {
    const malo = { ...planValido, tareas: [{ ...planValido.tareas[0], prioridad: "urgentísima" }] };
    assert.equal(planSchema.safeParse(malo).success, false);
  });
});

describe("generarPlan", () => {
  it("entrega objetos parciales mientras llega y el final cumple el esquema", async () => {
    const json = JSON.stringify(planValido);
    const mitad = Math.floor(json.length / 2);
    const modelo = modeloConTexto([json.slice(0, mitad), json.slice(mitad)]);

    const resultado = generarPlan({ objetivo: "Preparar el examen", modelo });

    const parciales: unknown[] = [];
    for await (const parcial of resultado.partialObjectStream) parciales.push(parcial);

    assert.ok(parciales.length >= 2, "debió llegar más de un parcial");
    const final = await resultado.object;
    assert.deepEqual(planSchema.parse(final), planValido);
  });
});

describe("responderChat", () => {
  it("se detiene en el tope de pasos y no pide la herramienta sin fin", async () => {
    const modelo = modeloQuePideHerramienta();

    const resultado = responderChat({ mensaje: "¿Qué tengo pendiente?", userId: 1, modelo });
    await resultado.text;

    assert.equal(modelo.doStreamCalls.length, 4);
  });
});

describe("tareasDelUsuario", () => {
  it("devuelve un error como dato si el usuario no existe, sin lanzar", async () => {
    const execute = tareasDelUsuario.execute!;
    const salida = await execute({ userId: 999_999 }, { toolCallId: "x", messages: [], context: {} });

    assert.deepEqual(salida, { error: "El usuario 999999 no existe" });
  });
});
