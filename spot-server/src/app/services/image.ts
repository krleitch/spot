import { Request } from 'express';

// aws
import aws from '@services/aws.js';

// s3 upload
import multer from 'multer';
import multerS3 from 'multer-s3';

// Only allow jpeg, png, gif, webp
const fileFilter = (
  req: Request,
  file: Express.MulterS3.File,
  cb: (err: any, valid: boolean) => void
) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, Jpeg, Png, Gif, WebP allowed'), false);
  }
};

interface CreateRequestWithFile {
  spotId?: string,
  commentId?: string,
  filename: string
}

// upload files to s3
const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3: aws.s3,
    bucket: 'spottables',
    metadata: function (
      req: Request,
      file: Express.Multer.File,
      cb: (err: any, metadata?: any) => void
    ) {
      cb(null, { originalname: file.originalname.substring(0, 255) });
    },
    key: function (
      req: Request,
      file: Express.MulterS3.File,
      cb: (err: any, key?: string | undefined) => void
    ) {
      const json: CreateRequestWithFile = JSON.parse(req.body.json);
      let prefix = '';
      // json.filename contains the id for the new spot/comment/reply
      if (json.spotId && json.commentId && json.filename) {
        // reply
        prefix = 'spots/' + json.spotId + '/comments/' + json.commentId + '/';
      } else if (json.spotId) {
        // comment
        prefix = 'spots/' + json.spotId + '/comments/' + json.filename + '/';
      } else {
        // spot
        prefix = 'spots/' + json.filename + '/';
      }

      cb(null, prefix + json.filename);
    }
  })
});

// predict if image is nsfw before the spot is made locally on the server
const predictNsfwLocal = async (imgUrl: string): Promise<boolean> => {
  // Currently not useable
  return false;
}

//  predict if image is nsfw, using aws lambda after the spot is already made
const predictNsfwLambda = async (imgUrl: string): Promise<AWS.Lambda.InvocationResponse> => {
  const params: AWS.Lambda.InvocationRequest = {
    FunctionName: 'nsfw-image-prediction',
    Payload: JSON.stringify({
      image: imgUrl
    })
  };
  return aws.lambda.invoke(params).promise();
}

export default { upload, predictNsfwLocal, predictNsfwLambda };
