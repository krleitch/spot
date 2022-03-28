export enum UserRole {
  USER = "USER",
  GUEST = "GUEST",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

// Client side user
// Facebook and Google accounts can possibly be missing several fields
export interface User {
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

// Get
export interface GetUserRequest {}
export interface GetUserResponse {
  user: User;
}

// Update
export interface UpdateUsernameRequest {
  username: string;
}
export interface UpdateUsernameResponse {
  user: User;
}

export interface UpdateEmailRequest {
  email: string;
}
export interface UpdateEmailResponse {
  user: User;
}

export interface UpdatePhoneRequest {
  phone: string;
}
export interface UpdatePhoneResponse {
  user: User;
}

// Delete
export interface DeleteUserRequest {}
export interface DeleteUserResponse {}

// Facebook and Google
export interface FacebookConnectRequest {
  accessToken: string;
}
export interface FacebookConnectResponse {
  user: User;
}
export interface FacebookDisconnectRequest {}
export interface FacebookDisconnectResponse {
  user: User;
}

export interface GoogleConnectRequest {
  accessToken: string;
}
export interface GoogleConnectResponse {
  user: User;
}
export interface GoogleDisconnectRequest {}
export interface GoogleDisconnectResponse {
  user: User;
}

// User verification
export interface VerifyRequest {}
export interface VerifyResponse {}
export interface VerifyConfirmRequest {
  token: string;
}
export interface VerifyConfirmResponse {
  user: User;
}

// Store
export interface SetUserStore {
  user: Partial<User>; // Give properties you want to update
}