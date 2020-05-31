
// Use this for catching and handling errors for async functions, catchs and throws so middleware can detect
export const catchAsync = (fn: any) => {
    return (req: any, res: any, next: any) => {
        fn(req, res, next).catch(next);
    };
};

export const errorMiddleware = (err: any, req: any, res: any, next: any) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        name: err.name,
        status: err.status,
        message: err.message
    });
}
