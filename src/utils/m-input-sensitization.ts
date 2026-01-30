import { zodInputParse } from "./zod-input-parse.js";
import { NextFunction, Request, Response } from "express";
import response from "./response.js";
import { whichZodSchema } from "./zod-schema.js";
import { log } from "./logger.js";

export default function InputSensitization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ZodInputSchema = whichZodSchema(req.path);

  const isInvalidInputs = zodInputParse(ZodInputSchema, req.body);

  log(isInvalidInputs, "info");
  if (isInvalidInputs) {
    return response.failure(res, isInvalidInputs, 400, null);
  }

  return next();
}
