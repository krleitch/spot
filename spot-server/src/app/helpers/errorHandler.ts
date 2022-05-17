import { Request, Response, NextFunction } from 'express';

// Use this for catching and handling errors for async functions, catchs and throws so middleware can detect
const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// TODO: Only return the error messages for internal errors if in dev
const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    name: err.name,
    body: err.body,
    status: err.status,
    message: err.message
  });
};

export default {
  catchAsync,
  errorMiddleware
}
