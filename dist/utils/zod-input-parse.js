/**
 * A wrapper for function for zod error
 * @param schema
 * @param body
 * @returns number
 */
export function zodInputParse(schema, body) {
    const error = schema?.safeParse(body);
    if (!error?.success &&
        error?.error?.issues &&
        Array.isArray(error.error.issues)) {
        return error.error.issues
            .map((issue) => {
            if (issue?.message) {
                return issue.message;
            }
            return "Invalid input";
        })
            .join(", ");
    }
    return false;
}
