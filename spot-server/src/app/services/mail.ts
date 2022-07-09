// Mail Service

import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config
import mailconfig from '@config/mail.js';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: mailconfig.MAIL_USERNAME,
    clientId: mailconfig.OAUTH_CLIENTID,
    clientSecret: mailconfig.OAUTH_CLIENT_SECRET,
    refreshToken: mailconfig.OAUTH_REFRESH_TOKEN
  },
});

// let transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     type: "OAuth2",
//     user: "user@example.com",
//     accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
//   },
// });

const rootPath = path.join(__dirname, '../emails');
const imagePath = path.join(__dirname, '../emails/spot_logo.png');

const email = new Email({
  transport: transporter,
  send: true,
  preview: false,
  message: {
    attachments: [
      {
        filename: 'spot_logo.png',
        path: imagePath,
        cid: 'spotlogo'
      }
    ]
  },
  views: {
    options: {
      extension: 'pug'
    },
    root: rootPath
  }
});

export default { email };
