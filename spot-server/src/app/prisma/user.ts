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
  return {
    ...createdUser,
    role: UserRole[createdUser.role]
  };
};

const findUserById = async (
  userId: string
): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    }
  });
  if (user) {
    // Map the schema enum to the user enum
    return {
      ...user,
      role: UserRole[user.role]
    };
  } else {
    return null;
  }
};

// Find a user by their username
// Use for friends / notifications when we don't know id
const findUserByUsername = async (
  username: string
): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  if (user) {
    // Map the schema enum to the user enum
    return {
      ...user,
      role: UserRole[user.role]
    };
  } else {
    return null;
  }
};

// Check if the email is alrady in use
// Useful for checking google / facebook associated emails
const userEmailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  if (user) {
    return true;
  } else {
    return false;
  }
};

// Check if the username is alrady in use
const userUsernameExists = async (username: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  if (user) {
    return true;
  } else {
    return false;
  }
};

// Used by passport to get the account on login with local auth
const findUserByEmailPassport = async (email: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  })
  return user;
}

// Used by passport to get the account on login with local auth
const findUserByUsernamePassport = async (username: string): Promise<P.User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  })
  return user;
}

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
  })
  return updatedUser;
}

export default {
  createUser,
  findUserById,
  findUserByUsername,
  userEmailExists,
  userUsernameExists,
  findUserByEmailPassport,
  findUserByUsernamePassport,
  softDeleteUser
};
