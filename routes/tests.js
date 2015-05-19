
var express = require('express');
var router = express.Router();


router.get('/one', function(req, res) {
  res.send('done');
});


module.exports = router;
