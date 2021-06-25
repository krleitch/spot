const aws = require('aws-sdk');

// config
const awsconfig = require('@config/awskey.json');

aws.config.update({
    secretAccessKey: awsconfig.SecretAccessKey,
    accessKeyId: awsconfig.AccessKeyID,
    region: 'us-east-1'
});

const s3 = new aws.S3();
const lambda = new aws.Lambda();

const getUrlFromBucket=(fileName: string): string => {
    return 'https://spottables.s3.amazonaws.com/' + fileName;
};

export { s3, lambda, getUrlFromBucket }
