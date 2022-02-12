import aws from 'aws-sdk';
declare const _default: {
    s3: aws.S3;
    lambda: aws.Lambda;
    getUrlFromBucket: (fileName: string) => string;
};
export default _default;
