// export { upload }

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const awsconfig = require('../../../awskey.json');

aws.config.update({
    secretAccessKey: awsconfig.SecretAccessKey,
    accessKeyId: awsconfig.AccessKeyID,
    region: 'us-east-1'
});

const s3 = new aws.S3();

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
    }
}
  
const upload = multer({
    fileFilter,
    storage: multerS3({
        acl: 'public-read',
        s3,
        bucket: 'spot',
        metadata: function (req: any, file: any, cb: any) {
            cb(null, {fieldName: 'TESTING_METADATA'});
        },
        key: function (req: any, file: any, cb: any) {
            cb(null, Date.now().toString())
        }
    })
});

module.exports = upload;