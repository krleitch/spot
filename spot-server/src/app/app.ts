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
import spot from '@routes/spot.js';
import root from '@routes/root.js';
import user from '@routes/user.js';
import chat from '@routes/chat.js';
import comment from '@routes/comment.js';
import notification from '@routes/notification.js';
import friend from '@routes/friend.js';
import authentication from '@routes/authentication.js';
import admin from '@routes/admin.js';

// Utils
import errorHandler from '@helpers/errorHandler.js';

// Services
import passport from '@services/authentication/passport.js';
import authenticationService from '@services/authentication/authentication.js';
import locationService from '@services/location.js';
import authorizationService from '@services/authorization.js';

// Models
import { UserRole } from '@models/user.js';

const port = process.env.PORT || 3000;

// ************
// Setup
// ************

app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow only the chat service to call this route
const chatCors = {
  origin: 'http://localhost:4000',
  optionsSuccessStatus: 200
};
app.use('/chat', Cors(chatCors), authenticationService.requiredAuth, chat);

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
  '/spot',
  authenticationService.optionalAuth,
  locationService.checkLocation,
  spot
);
app.use(
  '/comment',
  authenticationService.optionalAuth,
  locationService.checkLocation,
  comment
);

// Required Auth
app.use('/user', authenticationService.requiredAuth, user);
app.use('/notification', authenticationService.requiredAuth, notification);
app.use('/friend', authenticationService.requiredAuth, friend);

// Required Auth + roles
app.use(
  '/admin',
  authenticationService.requiredAuth,
  authorizationService.checkUserHasRoleMiddleware([
    UserRole.OWNER,
    UserRole.ADMIN
  ]),
  admin
);

// Error middleware
app.use(errorHandler.errorMiddleware);

// Make this a module
export default app;

