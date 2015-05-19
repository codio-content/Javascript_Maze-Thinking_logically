
var path = require('path');
var fs = require('fs');
var express = require('express');

var router = express.Router();


router.get('/one', function(req, res) {
  res.render('one');
});

router.get('/two', function(req, res) {
  res.render('two');
});


module.exports = router;
