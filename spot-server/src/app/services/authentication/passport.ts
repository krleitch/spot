// passport
import JwtStrategy from 'passport-jwt';
import ExtractJwt from 'passport-jwt';
import LocalStrategy from 'passport-local';
import passport from 'passport';

// config
import secret from '@config/secret.js';

// services
import authenticationService from '@services/authentication/authentication.js';

// db
import prismaUser from '@db/../prisma/user.js';

// model
import { User } from '@models/../newModels/user.js';

// Login Local
const localOptions = {
  usernameField: 'emailOrUsername',
  passwordField: 'password'
};

passport.use(
  new LocalStrategy.Strategy(
    localOptions,
    async (
      emailOrUsername: string,
      password: string,
      done: (err: any, user: User | null) => void
    ) => {
      const regex = /^\S+@\S+\.\S+$/;
      const isEmail = emailOrUsername.match(regex) != null;

      try {
        let passportUser;
        if (isEmail) {
          passportUser = await prismaUser.findUserByEmailPassport(
            emailOrUsername
          );
        } else {
          passportUser = await prismaUser.findUserByUsernamePassport(
            emailOrUsername
          );
        }
        if (!passportUser || !passportUser.password || !passportUser.salt) {
          return done(null, null);
        }
        if (
          !authenticationService.validatePassword(
            passportUser.password,
            passportUser.salt,
            password
          )
        ) {
          return done(null, null);
        }

        // Get the client user
        const user = await prismaUser.findUserById(passportUser.userId);
        return done(null, user);
      } catch (err: any) {
        return done(err, null);
      }
    }
  )
);

// Login with JWT token
const jwtOptions = {
  jwtFromRequest: ExtractJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret.secret
};

passport.use(
  new JwtStrategy.Strategy(
    jwtOptions,
    async (payload: any, done: (err: any, user: User | null) => void) => {
      // TODO: Can we just refresh the token, so that way we dont need to do db lookup
      // concerning verified / facebook / google updates
      const user = await prismaUser.findUserById(payload.id.userId);
      if (!user) {
        return done('error', null);
      }
      return done(null, user);
    }
  )
);

export default passport;
