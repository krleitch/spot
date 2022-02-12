// Use this for catching and handling errors for async functions, catchs and throws so middleware can detect
const catchAsync = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

const errorMiddleware = (err: any, req: any, res: any, next: any) => {
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