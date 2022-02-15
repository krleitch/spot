import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { User, UserRole } from '@models/../newModels/user.js';

// The properties that exist on the @model user
const selectModelUser = P.Prisma.validator<P.Prisma.UserSelect>()({
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
  userWithRole: T & { role: P.UserRole }
): T & { role: UserRole } => {
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
    role: UserRole.GUEST
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
  return mapToModelEnum(createdUser);
};

const findUserById = async (userId: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    }
  });
  return user ? mapToModelEnum(user) : null;
};

// Find a user by their username
// Use for friends / notifications when we don't know id
const findUserByUsername = async (username: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  return user ? mapToModelEnum(user) : null;
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

// Used by passport to get the account on login with local auth
const findUserByEmailPassport = async (
  email: string
): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  return user ? mapToModelEnum(user) : null;
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
  return user ? mapToModelEnum(user) : null;
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
  return mapToModelEnum(updatedUser);
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
  return mapToModelEnum(updatedUser);
};

export default {
  createUser,
  findUserById,
  findUserByUsername,
  emailExists,
  usernameExists,
  findUserByEmailPassport,
  findUserByUsernamePassport,
  softDeleteUser
};
