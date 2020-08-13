// Mail Service

const nodemailer = require("nodemailer");
const aws = require('aws-sdk');

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

export { transporter }
