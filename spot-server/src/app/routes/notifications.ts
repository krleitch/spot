const express = require('express');
const router = express.Router();

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get notifications
router.get('/', function (req: any, res: any) {

});

export = router;
