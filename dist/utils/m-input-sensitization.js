import { zodInputParse } from "./zod-input-parse.js";
import response from "./response.js";
import { whichZodSchema } from "./zod-schema.js";
import { log } from "./logger.js";
export default function InputSensitization(req, res, next) {
    const ZodInputSchema = whichZodSchema(req.path);
    const isInvalidInputs = zodInputParse(ZodInputSchema, req.body);
    log(isInvalidInputs, "info");
    if (isInvalidInputs) {
        return response.failure(res, isInvalidInputs, 400, null);
    }
    return next();
}
