import { UserRole } from '@models/user.js';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string | null;
      emailUpdatedAt: Date | null;
      username: string;
      usernameUpdatedAt: Date;
      phone: string | null;
      phoneUpdatedAt: Date | null;
      profilePictureSrc: string | null;
      facebookId: string | null;
      googleId: string | null;
      verifiedAt: Date | null;
      createdAt: Date;
      deletedAt: Date | null;
      role: UserRole;
    }
  }
}
