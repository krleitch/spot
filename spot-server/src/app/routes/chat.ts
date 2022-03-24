import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// db
import prismaUser from '@db/prisma/user.js';

// exceptions
import * as userError from '@exceptions/user.js';
import ErrorHandler from '@helpers/errorHandler.js';

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Get user information needed for the chat service
router.get(
  '/user',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new userError.GetUser());
      }
      const foundUser = await prismaUser.findUserByIdChat(userId);

      if (!foundUser) {
        return next(new userError.GetUser());
      }

      const response = { user: foundUser };
      res.status(200).json(response);
    }
  )
);

export default router;
