

import aws from '@services/aws.js';
import axios from 'axios';

// s3 upload
import multer from 'multer';
import multerS3 from 'multer-s3';

// nsfwjs
// import tf from '@tensorflow/tfjs-node';

// config
import config from '@config/config.js';

// TODO: check env
// if  ( config.production ) {
// tf.enableProdMode();
// }
// import nsfw from 'nsfwjs';
let model: any;
// nsfw.load().then((m: any) => {
// console.log('Nsfwjs Model Loaded');
// model = m;
// }, (err: any) => {
// console.log('Error loading tensorflow model', err)
// }); // To load a local model, nsfw.load('file:///Users/kevin/Documents/repos/spot/spot-server/src/nsfwModel/')

// Only allow jpeg and png
const fileFilter = (req: any, file: any, cb: any) => {
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

// upload files to s3
const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3: aws.s3,
    bucket: 'spottables',
    metadata: function (req: any, file: any, cb: any) {
      cb(null, { originalname: file.originalname.substr(0, 255) });
    },
    key: function (req: any, file: any, cb: any) {
      const json = JSON.parse(req.body.json);
      let prefix = '';

      // Create the name
      // req.filename contains the id for the content
      if (json.postId && json.commentId) {
        // reply
        prefix = 'posts/' + json.postId + '/comments/' + json.commentId + '/';
      } else if (json.postId) {
        // comment
        prefix = 'posts/' + json.postId + '/comments/' + req.filename + '/';
      } else {
        // post
        prefix = 'posts/' + req.filename + '/';
      }

      cb(null, prefix + req.filename);
    }
  })
});

//  predict if image is nsfw before the spot is made locally on the server
async function predictNsfw(imgUrl: string): Promise<boolean> {
  // if the model was not loaded
  // if ( !model || !imgUrl ) {
  return false;
  // }

  // disable for now for memory concerns

  // const pic = await axios.get(imgUrl, {
  // responseType: 'arraybuffer',
  // });
  // Image must be in tf.tensor3d format
  // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
  // const image = await tf.node.decodeImage(pic.data,3);
  // const predictions = await model.classify(image);
  // image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
  // check if porn or hentai
  // return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
}

//  predict if image is nsfw, using aws lambda after the spot is already made
async function predictNsfwLambda(imgUrl: string): Promise<any> {
  if (!imgUrl) {
    return false;
  }

  const params = {
    FunctionName: 'nsfw-image-prediction',
    Payload: JSON.stringify({
      image: imgUrl
    })
  };

  return aws.lambda.invoke(params).promise();
}

export default { upload, predictNsfw, predictNsfwLambda };
