
export enum UserRole {
  USER = "USER",
  GUEST = "GUEST",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  OWNER = "OWNER"
}

export interface User {
    email: string;
    emailUpdatedAt: Date;
    username: string;
    usernameUpdatedAt: Date;
    phone: string;
    phoneUpdatedAt: Date;
    facebookId: string | null;
    googleId: string | null;
    verifiedAt: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    role: UserRole;
}

