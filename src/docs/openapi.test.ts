import assert from "node:assert/strict";
import test from "node:test";
import { generateOpenApiDocument } from "./openapi.js";

test("documenta las cinco operaciones REST", () => {
  const document = generateOpenApiDocument();
  const operations = Object.values(document.paths).flatMap((path) => Object.keys(path));
  assert.deepEqual(operations, ["get", "post", "get", "patch", "delete"]);
});
