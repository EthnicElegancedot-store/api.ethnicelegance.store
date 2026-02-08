/**
 * This function is used to wrap async route handlers to catch errors and pass them to the next middleware.
 * @param fn - The async route handler function.
 * @returns A function that wraps the async handler and catches errors.
 **/
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
export default asyncHandler;
