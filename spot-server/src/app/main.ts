require('module-alias/register');
const express = require('express');
const app = express();

const bodyParser = require('body-parser')
const Cors = require('cors');

// Routes
const posts = require('./routes/posts');
const root = require('./routes/root');
const accounts = require('./routes/accounts');
const comments = require('./routes/comments');
const image = require('./routes/image');
const notifications = require('./routes/notifications');
const friends = require('./routes/friends');
const auth = require('./routes/auth');
const admin = require('./routes/admin');

// Db
const mySql = require('./db/mySql');
const mongo = require('./db/mongo');

// Utils
const errorHandler = require('./errorHandler');
const passport = require('@services/auth/passport');
const authentication = require('@services/auth/auth');
const locationService = require('@services/locations');
const authorization = require('./authorization/authorize');
const roles = require('./authorization/roles');

const port = 3000;

mySql.initDb();
// mongo.initDb();

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

// Check the users location data on each request
app.use(locationService.checkLocation)

// Unprotected
app.use('/', root);
app.use('/auth', auth);

// Optional auth, user may or may not be filled check req.authenticated
app.use('/posts', authentication.optionalAuth , posts);
app.use('/comments', authentication.optionalAuth, comments);

// Auth
app.use('/accounts', passport.authenticate('jwt', {session: true}), accounts);
app.use('/image', passport.authenticate('jwt', {session: true}), image);
app.use('/notifications', passport.authenticate('jwt', {session: true}), notifications);
app.use('/friends', passport.authenticate('jwt', {session: true}), friends);

// Auth + roles
app.use('/admin', passport.authenticate('jwt', {session: true}), authorization.checkRoleMiddleware([roles.owner, roles.admin]), admin);

// Error middleware
app.use(errorHandler.errorMiddleware);

app.listen(port, (err: any) => {
  if (err) {
    console.log('Error listening: ', err);
    mySql.closeDb().then(() => {
      console.log('Terminating connection to Db');
    });
  }
  console.log(`Server is listening on ${port}`);
})
