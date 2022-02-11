const express = require('express');
const router = express.Router();

router.use(function timeLog(req: any, res: any, next: any) {
  next();
});

// router.get('/', function (req: any, res: any) {
//     res.send('Spot');
// });

export default router;
