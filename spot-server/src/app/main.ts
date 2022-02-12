
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import express from 'express';
const app = express();

import bodyParser from 'body-parser';
import Cors from 'cors';
import rfs from 'rotating-file-stream';
import morgan from 'morgan';

// Routes
import posts from '@routes/posts.js';
import root from '@routes/root.js';
import accounts from '@routes/accounts.js';
import comments from '@routes/comments.js';
import notifications from '@routes/notifications.js';
import friends from '@routes/friends.js';
import auth from '@routes/authentication.js';
import admin from '@routes/admin.js';

// Db
import * as mySql from '@db/mySql.js';
// import mongo from '@db/mongo.js';

// Utils
import errorHandler from '@helpers/errorHandler.js';
import passport from '@services/authentication/passport.js';
import authentication from '@services/authentication/authentication.js';
import locationService from '@services/locations.js';
import authorization from '@services/authorization/authorization.js';
import roles from '@services/authorization/roles.js';

const port = process.env.PORT || 3000;

mySql.initDb();
// mongo.initDb();

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

// Unprotected routes
app.use('/', root);
app.use('/auth', auth);

// Optional auth, user may or may not be filled check req.authenticated
// Only check location on posts and comments, only requests that send location details are verified
app.use(
  '/posts',
  authentication.optionalAuth,
  locationService.checkLocation,
  posts
);
app.use(
  '/comments',
  authentication.optionalAuth,
  locationService.checkLocation,
  comments
);

// Required Auth
app.use('/accounts', authentication.requiredAuth, accounts);
app.use('/notifications', authentication.requiredAuth, notifications);
app.use('/friends', authentication.requiredAuth, friends);

// Required Auth + roles
app.use(
  '/admin',
  authentication.requiredAuth,
  authorization.checkRoleMiddleware([roles.owner, roles.admin]),
  admin
);

// // Error middleware
app.use(errorHandler.errorMiddleware);

app.listen(port, () => {
  // if (err) {
  //   console.log('Error listening: ', err);
  //   mySql.closeDb().then(
  //     () => {
  //       console.log('Terminated connection to Db');
  //     },
  //     (err: any) => {
  //       console.log('Error terminating connection to Db', err);
  //     }
  //   );
  // }
  console.log(`Server is listening on ${port}`);
});

export {}