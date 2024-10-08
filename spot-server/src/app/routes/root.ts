import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

router.get('/', (req: Request, res: Response) => {
  res.status(200).send({})
})

export default router;
