import { Request, Response, NextFunction } from 'express';

import { UserRole, User } from '@models/../newModels/user.js';
import * as authorizationError from '@exceptions/authorization.js';

// Middleware used on routes
const checkUserHasRoleMiddleware =
  (roles: Array<UserRole>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new authorizationError.AuthorizationError());
    }

    const hasRole = roles.find((role) => req.user?.role === role);
    if (!hasRole) {
      return next(new authorizationError.AuthorizationError());
    }

    return next();
  };

// Used within a function given a user
const checkUserHasRole = (user: User, roles: Array<UserRole>): boolean => {
  const found = roles.find((role) => user.role === role);
  return found !== undefined;
};

export default { checkUserHasRoleMiddleware, checkUserHasRole };
