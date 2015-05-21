
var path = require('path');
var fs = require('fs');
var express = require('express');

var router = express.Router();

// Test Game
router.get('/test', function(req, res) {
  res.render('test');
}); 

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

// Add objects with coords
router.get('/commands-4', function(req, res) {
  res.render('commands-4');
}); 

// Add objects without coords challenge
router.get('/commands-5', function(req, res) {
  res.render('commands-5');
}); 

// Grid explanation
router.get('/commands-6', function(req, res) {
  res.render('commands-6');
}); 

// Add objects with coords challenge
router.get('/commands-7', function(req, res) {
  res.render('commands-7');
});

// Javascript adding objects
router.get('/js-3', function(req, res) {
  res.render('js-3');
});

// Javascript adding objects challenge
router.get('/js-4', function(req, res) {
  res.render('js-4');
});

// Javascript final high score challenge
router.get('/js-5', function(req, res) {
  res.render('js-5');
});

module.exports = router;



