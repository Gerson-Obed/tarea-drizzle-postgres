import { writeFile } from "node:fs/promises";
import { generateOpenApiDocument } from "./openapi.js";

await writeFile("openapi.json", `${JSON.stringify(generateOpenApiDocument(), null, 2)}\n`);
console.log("openapi.json generado correctamente");
