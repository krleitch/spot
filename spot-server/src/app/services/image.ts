const multer = require('multer');
const multerS3 = require('multer-s3');

const aws = require('@services/aws');

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
        s3: aws.s3,
        bucket: 'spot',
        metadata: function (req: any, file: any, cb: any) {
            cb(null, {originalname: file.originalname.substr(0,255)});
        },
        key: function (req: any, file: any, cb: any) {
            cb(null, req.filename)
        }
    })
});

module.exports = upload;