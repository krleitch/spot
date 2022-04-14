import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// db
import prismaUser from '@db/prisma/user.js';

// services
import imageService from '@services/image.js';
import locationService from '@services/location.js';

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

// Get geolocation using this servers implementation
router.get(
  '/geolocation',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new userError.GetUser());
      }
      // const foundUser = await prismaUser.findUserByIdChat(userId);
      // Can also do user location checks here

      const location = {
        latitude: Number(req.query.lat),
        longitude: Number(req.query.lng)
      };

      const geolocation = await locationService.getGeolocation(location);

      const response = { geolocation: geolocation };
      res.status(200).json(response);
    }
  )
);

export default router;
