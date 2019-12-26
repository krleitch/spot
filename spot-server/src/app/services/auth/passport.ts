export = passport;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

const secret = require('../../../../secret.json');
const auth = require('./auth');
const accounts = require('../../db/accounts');

// Login Local
const localOptions = {  
    usernameField: 'email',
    passwordField: 'password'
};

passport.use(new LocalStrategy(localOptions,
    function(email: any, password: any, done: any) {
        accounts.getAccountByEmail(email).then( (user: any) => {
            user = user[0];
            if (!user) { return done(null, false); }
            if (!auth.validatePassword(user, password)) { return done(null, false); }
            return done(null, user);
        }, (err: any) => {
            return done(err);
        });
    }
));

// For sessions
passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    console.log('called deserialize', id);
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
        done(null, payload.id);
    }
));
