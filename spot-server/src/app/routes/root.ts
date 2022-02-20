import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

export default router;
