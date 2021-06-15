require('module-alias/register');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const Cors = require('cors');
const rfs = require('rotating-file-stream')
const morgan = require('morgan');
const path = require('path')

// Routes
const posts = require('@routes/posts');
const root = require('@routes/root');
const accounts = require('@routes/accounts');
const comments = require('@routes/comments');
const notifications = require('@routes/notifications');
const friends = require('@routes/friends');
const auth = require('@routes/authentication');
const admin = require('@routes/admin');

// Db
const mySql = require('@db/mySql');
// const mongo = require('@db/mongo');

// Utils
const errorHandler = require('@helpers/errorHandler');
const passport = require('@services/authentication/passport');
const authentication = require('@services/authentication/authentication');
const locationService = require('@services/locations');
const authorization = require('@services/authorization/authorization');
const roles = require('@services/authorization/roles');

const port = process.env.PORT || 3000;

mySql.initDb();
// mongo.initDb();

app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

// Unprotected routes
app.use('/', root);
app.use('/auth', auth);

// Optional auth, user may or may not be filled check req.authenticated
// Only check location on posts and comments, only requests that send location details are verified
app.use('/posts', authentication.optionalAuth, locationService.checkLocation, posts);
app.use('/comments', authentication.optionalAuth, locationService.checkLocation, comments);

// Required Auth
app.use('/accounts', authentication.requiredAuth, accounts);
app.use('/notifications', authentication.requiredAuth, notifications);
app.use('/friends', authentication.requiredAuth, friends);

// Required Auth + roles
app.use('/admin', authentication.requiredAuth, authorization.checkRoleMiddleware([roles.owner, roles.admin]), admin);

// Error middleware
app.use(errorHandler.errorMiddleware);

app.listen(port, (err: any) => {
  if (err) {
    console.log('Error listening: ', err);
    mySql.closeDb().then(() => {
      console.log('Terminated connection to Db');
    }, (err: any) => {
      console.log('Error terminating connection to Db', err);
    });
  }
  console.log(`Server is listening on ${port}`);
});
