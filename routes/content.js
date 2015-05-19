
var path = require('path');
var fs = require('fs');
var express = require('express');

var router = express.Router();

// Random Maze Blockly
router.get('/commands-1-b', function(req, res) {
  res.render('commands-1-b');
});

// Random Maze Game
router.get('/commands-1', function(req, res) {
  res.render('commands-1');
});


module.exports = router;
