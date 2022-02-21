import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { User, UserRole } from '@models/../newModels/user.js';

// The properties that exist on the @model user
const selectModelUser = P.Prisma.validator<P.Prisma.UserSelect>()({
  userId: true,
  email: true,
  emailUpdatedAt: true,
  username: true,
  usernameUpdatedAt: true,
  phone: true,
  phoneUpdatedAt: true,
  facebookId: true,
  googleId: true,
  verifiedAt: true,
  createdAt: true,
  deletedAt: true,
  role: true
});

// Change the prisma enum to the model enum
const mapToModelEnum = <T>(
  userWithRole: Omit<T, 'role'> & { role: P.UserRole }
): Omit<T, 'role'> & { role: UserRole } => {
  return {
    ...userWithRole,
    role: UserRole[userWithRole.role]
  };
};

// Create a new user, with default metadata
const createUser = async (
  email: string,
  username: string,
  password: string,
  phone: string,
  salt: string
): Promise<User> => {
  const user: P.Prisma.UserCreateInput = {
    email: email,
    username: username,
    password: password,
    phone: phone,
    salt: salt,
    role: UserRole.USER
  };
  const userMetadata = {};
  let createdUser = await prisma.user.create({
    data: {
      ...user,
      UserMetadata: { create: userMetadata }
    },
    select: selectModelUser
  });
  // Map the schema enum to the user enum
  return mapToModelEnum<User>(createdUser);
};

// Returns the client user
const findUserById = async (userId: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    },
    select: selectModelUser
  });
  return user ? mapToModelEnum<User>(user) : null;
};

// Also get the user metadata
const findUserAndMetadataById = async (userId: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    },
    include: {
      UserMetadata: true
    }
  });
  return user ? mapToModelEnum<P.User>(user) : null;
};

// Find a user by their username
// Use for friends / notifications when we don't know id
const findUserByUsername = async (username: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  return user ? mapToModelEnum<P.User>(user) : null;
};

const findUserByEmail = async (email: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  return user ? mapToModelEnum<P.User>(user) : null;
};
// Check if the email is alrady in use
// Useful for checking google / facebook associated emails
const emailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  return !!user;
};

// Check if the username is alrady in use
const usernameExists = async (username: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  return !!user;
};

// Check if the username is alrady in use
const phoneExists = async (phone: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      phone: phone
    }
  });
  return !!user;
};

// Used by passport to get the account on login with local auth
const findUserByEmailPassport = async (
  email: string
): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  return user ? mapToModelEnum<P.User>(user) : null;
};

// Used by passport to get the account on login with local auth
const findUserByUsernamePassport = async (
  username: string
): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  return user ? mapToModelEnum<P.User>(user) : null;
};

// soft delete the user
const softDeleteUser = async (userId: string): Promise<P.User> => {
  const user = await findUserById(userId);
  const timestamp = new Date().getTime();

  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      deletedAt: new Date(),
      username: `@del:${timestamp}:${user?.username}`,
      email: `@del:${timestamp}:${user?.email}`,
      phone: `@del:${timestamp}:${user?.phone}`,
      googleId: `@del:${timestamp}:${user?.googleId}`,
      facebookId: `@del:${timestamp}:${user?.facebookId}`
    }
  });
  return mapToModelEnum<P.User>(updatedUser);
};

const updateUsername = async (
  userId: string,
  newUsername: string
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      username: newUsername,
      usernameUpdatedAt: new Date()
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const updateEmail = async (
  userId: string,
  newEmail: string
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      email: newEmail,
      emailUpdatedAt: new Date()
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const updatePhone = async (
  userId: string,
  newPhone: string
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      phone: newPhone,
      phoneUpdatedAt: new Date()
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const updatePassword = async (
  userId: string,
  newPassword: string,
  newSalt: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      password: newPassword,
      salt: newSalt,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const verifyUser = async (
  userId: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      verifiedAt: new Date(),
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

// Facebook Accounts

const createFacebookUser = async (
  facebookId: string,
  email: string | null,
  username: string,
): Promise<User | null> => {
  const createdUser = await prisma.user.create({
    data: {
      email: email,
      username: username,
      facebookId: facebookId,
      role: UserRole.USER,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(createdUser);
};

const findUserByFacebookId = async (
  facebookId: string,
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      facebookId: facebookId
    },
    select: selectModelUser
  });
  return user ? mapToModelEnum<User>(user): null;
};

const connectFacebook = async (
  userId: string,
  facebookId: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      facebookId: facebookId,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const disconnectFacebook = async (
  userId: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      facebookId: null,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

// Google Accounts

const createGoogleUser = async (
  googleId: string,
  email: string | null,
  username: string,
): Promise<User | null> => {
  const createdUser = await prisma.user.create({
    data: {
      email: email,
      username: username,
      googleId: googleId,
      role: UserRole.USER
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(createdUser);
};

const findUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      googleId: googleId
    },
    select: selectModelUser
  });
  return user ? mapToModelEnum<User>(user): null;
};

const connectGoogle = async (
  userId: string,
  googleId: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      googleId: googleId,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

const disconnectGoogle = async (
  userId: string,
): Promise<User | null> => {
  const updatedUser = await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      googleId: null,
    },
    select: selectModelUser
  });
  return mapToModelEnum<User>(updatedUser);
};

export default {
  createUser,
  findUserById,
  findUserAndMetadataById,
  findUserByUsername,
  findUserByEmail,
  emailExists,
  usernameExists,
  phoneExists,
  findUserByEmailPassport,
  findUserByUsernamePassport,
  softDeleteUser,
  updateUsername,
  updateEmail,
  updatePhone,
  updatePassword,
  verifyUser,
  createFacebookUser,
  findUserByFacebookId,
  connectFacebook,
  disconnectFacebook,
  createGoogleUser,
  findUserByGoogleId,
  connectGoogle,
  disconnectGoogle
};
