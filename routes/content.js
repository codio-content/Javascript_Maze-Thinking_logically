
var path = require('path');
var fs = require('fs');
var express = require('express');

var router = express.Router();

// Random Maze Game
router.get('/commands-1', function(req, res) {
  res.render('commands-1');
}); 

// Empty Maze Game
router.get('/commands-2', function(req, res) {
  res.render('commands-2');
}); 

// Empty Maze Game Challenge
router.get('/commands-3', function(req, res) {
  res.render('commands-3');
}); 

// Javascript empty game with monsters
router.get('/js-1', function(req, res) {
  res.render('js-1');
}); 

// As above but challenge
router.get('/js-2', function(req, res) {
  res.render('js-2');
}); 

module.exports = router;
