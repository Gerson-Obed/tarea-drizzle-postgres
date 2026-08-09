import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { taskRouter } from "./http/task.routes.js";
import { errorHandler } from "./http/error-handler.js";
import { appRouter } from "./trpc/router.js";
import { generateOpenApiDocument } from "./docs/openapi.js";

export const app = express();
const openapi = generateOpenApiDocument();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "API funcionando",
    rest: "/api/tasks",
    trpc: "/trpc",
    docs: "/docs",
    openapi: "/openapi.json",
  });
});

app.use("/api/tasks", taskRouter);
app.use("/trpc", trpcExpress.createExpressMiddleware({ router: appRouter }));
app.get("/openapi.json", (_req, res) => res.json(openapi));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor: http://localhost:${port}`);
    console.log(`Swagger: http://localhost:${port}/docs`);
  });
}
