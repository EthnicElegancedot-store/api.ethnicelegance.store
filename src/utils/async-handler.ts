import { NextFunction, Request, Response } from "express";

type handler =
  | ((req: Request, res: Response, next: NextFunction) => void)
  | ((req: Request, res: Response, next: NextFunction) => Promise<any>);

/**
 * This function is used to wrap async route handlers to catch errors and pass them to the next middleware.
 * @param fn - The async route handler function.
 * @returns A function that wraps the async handler and catches errors.
 **/

function asyncHandler(fn: handler) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
