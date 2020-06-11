const express = require('express');
const router = express.Router();

router.use(function timeLog (req: any, res: any, next: any) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Auth-Token, X-Requested-With, Content-Type, Accept, Authorization");
    // res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    // console.log('[ROOT] ', Date.now());
    next();
});

// router.get('/', function (req: any, res: any) {
//     res.send('SPOT');
// });

export = router;
