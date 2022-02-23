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

// Login Local
const localOptions = {
  usernameField: 'emailOrUsername',
  passwordField: 'password'
};

passport.use(
  new LocalStrategy.Strategy(
    localOptions,
    async (emailOrUsername: string, password: string, done: any) => {
      const regex = /^\S+@\S+\.\S+$/;
      const isEmail = emailOrUsername.match(regex) != null;

      console.log('meeee');

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
        if (!passportUser || !passportUser.password) {
          return done(null, false);
        }
        if (!authenticationService.validatePassword(passportUser, password)) {
          return done(null, false);
        }

        // Get the client user
        const user = await prismaUser.findUserById(passportUser.userId);
        return done(null, user);
      } catch (err: any) {
        return done(err, false);
      }
    }
  )
);

// For sessions
// passport.serializeUser(function (user: any, done: any) {
//   done(null, user.id);
// });

// passport.deserializeUser(function (id: any, done: any) {
//   accounts.getAccountById(id).then(
//     (user: any) => {
//       return done(null, user[0]);
//     },
//     (err: any) => {
//       return done(err);
//     }
//   );
// });

// Login with JWT token
const jwtOptions = {
  jwtFromRequest: ExtractJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret.secret
};

passport.use(
  new JwtStrategy.Strategy(jwtOptions, async (payload: any, done: any) => {
    // TODO: Can we just refresh the token, so that way we dont need to do db lookup
    // concerning verified / facebook / google updates
    const user = await prismaUser.findUserById(payload.id.userId);
    if (!user) {
      return done('err');
    }
    return done(null, user);
  })
);

export default passport;
