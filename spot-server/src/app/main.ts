// import 'module-alias/register.js';

// import moduleAlias from 'module-alias';

// console.log(__dirname + "./build/app/routes");

// moduleAlias.addAliases({
//   "@models": __dirname + "../../../spot-commons/build/models",
//   "@exceptions": __dirname + "../../../spot-commons/build/exceptions",
//   "@constants": __dirname + "../../../spot-commons/build/constants",
//   "@db": __dirname + "/db",
//   "@routes": __dirname + "/routes",
//   "@services": __dirname + "/services",
//   "@helpers": __dirname + "/helpers",
//   "@config": __dirname + "../config"
// });

import express from 'express';
const app = express();

import bodyParser from 'body-parser';
import Cors from 'cors';
import rfs from 'rotating-file-stream';
import morgan from 'morgan';
import path from 'path';

// Routes
import posts from '@routes/posts';
import root from '@routes/root';
import accounts from '@routes/accounts';
import comments from '@routes/comments';
import notifications from '@routes/notifications';
import friends from '@routes/friends';
import auth from '@routes/authentication';
import admin from '@routes/admin';

// Db
import * as mySql from '@db/mySql';
// import mongo from '@db/mongo';

// Utils
import errorHandler from '@helpers/errorHandler';
import passport from '@services/authentication/passport';
import authentication from '@services/authentication/authentication';
import locationService from '@services/locations';
import authorization from '@services/authorization/authorization';
import roles from '@services/authorization/roles';

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

// Error middleware
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