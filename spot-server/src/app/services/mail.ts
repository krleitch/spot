// Mail Service

const nodemailer = require("nodemailer");
const aws = require('aws-sdk');
const Email = require('email-templates');
const path = require('path');

const awsconfig = require('../../../awskey.json');

// TODO: move out of sandbox
// https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html?icmpid=docs_ses_console

aws.config.update({
    secretAccessKey: awsconfig.SecretAccessKey,
    accessKeyId: awsconfig.AccessKeyID,
    region: 'us-east-1'
});

let transporter = nodemailer.createTransport({
  SES: new aws.SES({
      apiVersion: '2010-12-01'
  })
});

const rootPath = path.join(__dirname, '../emails');
const imagePath = path.join(__dirname, '../emails/logo.png');

const email = new Email({
  transport: transporter,
  send: true,
  preview: false,
  message: {
    // from: 'test@spot.com',
    attachments: [{
      filename: 'spot_logo.png',
      path: imagePath,
      cid: 'spotlogo'
    }]
  },
  views: {
    options: {
      extension: 'pug',
    },
    root: rootPath,
  },
});

export { email }
