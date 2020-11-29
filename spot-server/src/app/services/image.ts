export { upload, predictNsfw };

const aws = require('@services/aws');
const axios = require('axios')

// s3 upload
const multer = require('multer');
const multerS3 = require('multer-s3');

// nsfwjs
const tf = require('@tensorflow/tfjs-node');
// TODO: check env
if  ( false ) {
    tf.enableProdMode();
}
const nsfw = require('nsfwjs');
let model: any;
nsfw.load().then((m: any) => {
    console.log('Nsfwjs Model Loaded');
    model = m;
}); // To load a local model, nsfw.load('file://./path/to/model/')

// Only allow jpeg and png
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
    }
}

// upload files to s3
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

            const json = JSON.parse(req.body.json);
            let prefix = '';

            // Create the name
            // req.filename contains the id for the content
            if ( json.postId && json.commentId) {
                // reply
                prefix = 'posts/' + json.postId + '/comments/' + json.commentId + '/';
            } else if ( json.postId) {
                // comment
                prefix = 'posts/' + json.postId + '/comments/' + req.filename + '/';
            } else {
                // post
                prefix = 'posts/' + req.filename + '/';
            }

            cb(null, prefix + req.filename)
        }
    })
});

//  predict if image is nsfw
async function predictNsfw(imgUrl: string) {

    if ( !imgUrl ) {
        return false;
    }

    const pic = await axios.get(imgUrl, {
        responseType: 'arraybuffer',
    });
    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    const image = await tf.node.decodeImage(pic.data,3);
    const predictions = await model.classify(image);
    image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    // check if porn or hentai
    return predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';
}
