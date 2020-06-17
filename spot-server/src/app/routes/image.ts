const express = require('express');
const router = express.Router();

const upload = require('../services/image');
const singleUpload = upload.single('image');


router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Upload a post photo
router.post('/upload/posts', function (req: any, res: any) {

    singleUpload(req, res, function(err: any) {

        if (err) {
            console.log(err);
            return res.status(422).send('Error uploading iamge');
        }

        return res.json({'imageSrc': req.file.location});

    });

});

// Upload a post photo
router.post('/upload/comments/:postId', function (req: any, res: any) {

    singleUpload(req, res, function(err: any) {

        if (err) {
            console.log(err);
            return res.status(422).send('Error uploading iamge');
        }

        return res.json({'imageSrc': req.file.location});

    });

});

export = router;
