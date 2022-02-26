// Mail Service

import nodemailer from 'nodemailer';
import aws from 'aws-sdk';
import Email from 'email-templates';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// config
import awsconfig from '@config/awskey.js';

// TODO: move out of sandbox
// https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html?icmpid=docs_ses_console

aws.config.update({
  secretAccessKey: awsconfig.SecretAccessKey,
  accessKeyId: awsconfig.AccessKeyID,
  region: 'us-east-1'
});

const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
});

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
