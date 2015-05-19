
var path = require('path');
var fs = require('fs');
var express = require('express');

var router = express.Router();


// game
router.get('/one', function(req, res) {
  res.render('one');
});


// blockly script
router.get('/two-blockly', function(req, res) {
  res.render('two-blockly');
});

// game
router.get('/two', function(req, res) {
  res.render('two');
});


// blockly script
router.get('/three-blockly', function(req, res) {
  res.render('three-blockly');
});

// game
router.get('/three', function(req, res) {
  res.render('three');
});


module.exports = router;
