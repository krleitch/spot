import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
const app = express();

import bodyParser from 'body-parser';
import Cors from 'cors';
import rfs from 'rotating-file-stream';
import morgan from 'morgan';

// Routes
import posts from '@routes/posts.js';
import root from '@routes/root.js';
import user from '@routes/user.js';
import comments from '@routes/comments.js';
import notifications from '@routes/notifications.js';
import friends from '@routes/friends.js';
import authentication from '@routes/authentication.js';
import admin from '@routes/admin.js';

// Db
import * as mySql from '@db/mySql.js';

// Utils
import errorHandler from '@helpers/errorHandler.js';
import passport from '@services/authentication/passport.js';
import authenticationService from '@services/authentication/authentication.js';
import locationService from '@services/locations.js';
import authorizationService from '@services/authorization/authorization.js';
import roles from '@services/authorization/roles.js';

const port = process.env.PORT || 3000;

// ************
// Setup
// ************

mySql.initDb();

app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// ************
// Routes
// ************

// Unprotected routes
app.use('/', root);
app.use('/authentication', authentication);

// Optional auth, user may or may not be filled check req.user
// Only check location on posts and comments
// only requests that send location details are verified
app.use(
  '/posts',
  authenticationService.optionalAuth,
  locationService.checkLocation,
  posts
);
app.use(
  '/comments',
  authenticationService.optionalAuth,
  locationService.checkLocation,
  comments
);

// Required Auth
app.use('/user', authenticationService.requiredAuth, user);
app.use('/notifications', authenticationService.requiredAuth, notifications);
app.use('/friends', authenticationService.requiredAuth, friends);

// Required Auth + roles
app.use(
  '/admin',
  authenticationService.requiredAuth,
  authorizationService.checkRoleMiddleware([roles.owner, roles.admin]),
  admin
);

// Error middleware
app.use(errorHandler.errorMiddleware);

app
  .listen(port, () => {
    console.log(`Server is listening on ${port}`);
  })
  .on('error', (err: Error) => {
    console.log(`Error listening`);
  });

// Make this a module
export {};
