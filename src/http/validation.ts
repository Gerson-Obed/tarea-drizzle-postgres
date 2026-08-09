import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

declare global {
  namespace Express {
    interface Request {
      validated?: { body?: unknown; params?: unknown; query?: unknown };
    }
  }
}

export function validate(part: "body" | "params" | "query", schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res.status(400).json({
        error: "Datos inválidos",
        issues: result.error.issues.map(({ path, message }) => ({ path, message })),
      });
      return;
    }
    req.validated ??= {};
    req.validated[part] = result.data;
    next();
  };
}
