export = passport;

// passport
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

// config
const secret = require('@config/secret.json');

// services
const auth = require('@services/authentication/authentication');

// db
const accounts = require('@db/accounts');

// Login Local
const localOptions = {  
    usernameField: 'emailOrUsername',
    passwordField: 'password'
};

passport.use(new LocalStrategy(localOptions,
    function(emailOrUsername: any, password: any, done: any) {

        const regex = /^\S+@\S+\.\S+$/;
        const isEmail = emailOrUsername.match(regex) != null;

        if (isEmail) {
            accounts.getAccountByEmailWithPass(emailOrUsername).then( (user: any) => {
                user = user[0];
                if (!user || !user.pass) { return done(null, false); }
                if (!auth.validatePassword(user, password)) { return done(null, false); }
                delete user.pass;
                delete user.salt;
                return done(null, user);
            }, (err: any) => {
                return done(err);
            });
        } else {
            accounts.getAccountByUsernameWithPass(emailOrUsername).then( (user: any) => {
                user = user[0];
                if (!user || !user.pass) { return done(null, false); }
                if (!auth.validatePassword(user, password.toString())) { return done(null, false); }
                delete user.pass;
                delete user.salt;
                return done(null, user);
            }, (err: any) => {
                return done(err);
            });            
        }
    }
));

// NOT USING
// For sessions
passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    accounts.getAccountById(id).then( (user: any) => {
        return done(null, user[0])
    }, (err: any) => {
        return done(err);
    });
});

// Login with JWT token
const jwtOptions = {  
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret.secret,
};

passport.use(new JwtStrategy(jwtOptions,
    function (payload: any, done: any) {
        // NEW
        // TODO: Can we just refresh the token, so that way we dont need to do db lookup
        // concerning verified / facebook / google updates
        accounts.getAccountById(payload.id.id).then( (user: any) => {
            return done(null, user[0])
        }, (err: any) => {
            return done(err);
        });
        // OLD
        // done(null, payload.id);
    }
));
