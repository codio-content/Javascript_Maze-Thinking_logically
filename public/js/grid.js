
// be safe
if(typeof console == 'undefined') {
  console = { log: function() {} };
}

// control debug messages
var debug;

if(true) {
  debug = console.log.bind(console);
}
else {
  debug = function() {};
}

/*
 * Global
 */

// browser keycodes to names
// used by keyevent
var keyMap = {
  13: 'ENTER',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  27: 'ESCAPE',
  32: 'SPACE',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z'
};

// drawing canvas
var canvas = null;

// canvas context
var context =  null

// present key state
var keyNow = {};

// old key state
var keyOld = {};

// timeout to wait between raf ticks
var timeout = 40;

// raf last time stamp
var timestamp = 0;

// game turns
var turn = 1;

// The tile size (width and height) in pixels.
var tileSize = 32;

// The maze tiles.
var tiles = null;

// All the entities in the game.
var entities = [];

// The player entity.
var player = null;

/**
 * The maze width in tiles. Either set it before calling a createMaze... 
 * function or supply a width in the the createMaze... function.
 */
var mazeWidth = 0;

/**
 * The maze height in tiles. Either set it before calling a createMaze... 
 * function or supply a height in the the createMaze... function.
 */
var mazeHeight = 0;

/**
 * The number of steps taken by the player in the maze.
 */
var steps = 0;

/**
 * The game score.
 */
var score = 0;

/**
 * The global player energy used to calculate score.
 */
var energy = 0;

// resize canvas, called by browser start functions
function resizeCanvas() {
  canvas.width = tileSize * mazeWidth;
  canvas.height = tileSize * mazeHeight;
}

// reset all key states
function resetKeys() {
  // reset old state
  for(var key in keyNow) {
    keyOld[key] = false;
    keyNow[key] = false;
  }
}

// called from UI thread
function keyevent(e) {
  if(keyMap[e.which]) {
    keyNow[keyMap[e.which]] = (e.type == 'keydown');
  }
}

// bind they keyboard events
function bindKeyEvents() {
  document.addEventListener('keydown', keyevent);
  document.addEventListener('keyup', keyevent);
}

// get array of keyboard key names.
function getKeys() {
  var keys = [];

  for (var i = 0; i < keyMap.length; i++) {
    keys.push(keyMap[i]);
  }

  return keys;
}

// called by runNode or runBrowser
update = function(delta) {
  for (var i = 0; i < entities.length; i++) {
    entities[i].update();
  }

  // move now key state to old key state
  for(var key in keyNow) {
    keyOld[key] = keyNow[key];
  }

  // entities
  for (var i = 0; i < entities.length; i++) {
    if(!entities[i].remove) {
      entities[i].render();
    }
  }

  // remove entities
  for (var i = 0; i < entities.length; i++) {
    if(entities[i].remove) {
      var e = entities[i];
      entities.splice(i, 1);
      tiles[e.x][e.y].entity = null;
      e.removed();
      i--;
    }
  }
}

// called by runBrowser
render = function() {
  var x = 0;
  var y = 0;

  context.save();
  context.setTransform(1, 0, 0, 1, x, y);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // tiles
  for (var x = 0; x < mazeWidth; x++) {
    for (var y = 0; y < mazeHeight; y++) {

      if (tiles[x][y].type == 'floor') {
        context.fillStyle = '#AD743A';
      } 
      else if (tiles[x][y].type == 'wall') {
        context.fillStyle = '#674524';
      }
      else if (tiles[x][y].type == 'bones'){
        context.fillStyle = '#2B2356';
      }
      // unknown tile type
      else {
        context.fillStyle = '#F33AE9';
      }

      context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  // entities
  for (var i = 0; i < entities.length; i++) {
    entities[i].render();
  }

  context.restore();
};

// request animation frame callback function
// called 
tickBrowser = function(t) {  
  update(t - timestamp);
  render();

  // reference maze directly
  timestamp = t;
  
  // reference maze directly
  setTimeout(function() {
    requestAnimationFrame(tickBrowser);
  }, timeout);
}

/*
 * Return a random empty floor tile.
 * If no tile can be found in attempts returns the first open tile.
 * Default attemps is 50.
 * @param {Number} attempts optional number of attempts to get empty tile.
 * @return {Object|null} atttile object or null, get location from tile.x, tile.y.
 */
function getEmptyTile(attempts) {
  attempts = attempts || 50;

  var i = 0;

  // random open
  while(i < attempts) {
    var x = Math.floor(Math.random() * (mazeWidth - 4) + 2);
    var y = Math.floor(Math.random() * (mazeHeight - 4) + 2);

    if(tiles[x][y].type == 'floor' && !tiles[x][y].entity) {
      return tiles[x][y];
    }

    i++;
  }

  // first open
  for (var x = 0; x < mazeWidth; x++) {
    for (var y = 0; y < mazeHeight; y++) {
      if(tiles[x][y].type == 'floor' && !tiles[x][y].entity) {
        return tiles[x][y];
      }
    }
  }

  // found nothing
  return null;
}

/**
 * Checks whether the named key was pressed. Provide an uppercase name.
 * 'UP', 'DOWN', 'LEFT', 'RIGHT'
 * @param {String} name the key name.
 */
function keyPressed(name) {
  return keyNow[name] && !keyOld[name];
}

/**
 * Add a wall at optional location. If no location is supplied a random
 * one will be chosen.
 * The wall will not be added if the location does not satisfy
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Boolean} was the wall added.
 */
function addWall(x, y) {
  // random positon
  if(!x && !y) {
    var tile = getEmptyTile();

    if(!tile) {
      return false;
    }

    tile.type = 'wall';

    return true;
  }

  // supplied positon
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {
    // no entity there
    if(!tiles[x][y].entity) {
      tiles[x][y].type = 'wall';

      return true;
    }
  }

  return false;
}

/**
 * Add n random wals. Caps n to 50.
 * @param {Number} n the number of monsters.
 */
function addRandomWalls(n) {
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addWall();
  };
}

/*
 * Add an entity at optional location. If no location is supplied a random
 * one will be chosen.
 * The entity will not be added if the location does not satisfy
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Entity|null} the added entity or null.
 */
function addEntity(e, x, y) {
  // check in inner wall bounds
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // no exiting entity there
    if(!tiles[x][y].entity) {
      
      // make sure adding on a floor tile
      tiles[x][y].type = 'floor';

      // add to entity array
      entities.push(e);

      // add to maze
      tiles[x][y].entity = e;

      // update entity location
      e.x = x;
      e.y = y;

      // return entity
      return e;
    }
  }

  // wasn't added
  return null;
}

/**
 * Remove entity from the maze.
 * todo: implementation. For now set entity.remove = true. 
 * @param {Entity} entity object. 
 */
function removeEnity(entity) {
  //
}

/**
 * Add Player at optional location. If no location is supplied, a location of
 * x: 1, y: mazeHeight - 2 is used.
 * The Player will not be added if the location is outside these bounds
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Player|null} the added player or null.
 */
function addPlayer(x, y) {
  // remove exiting player reference
  this.player = null;

  // default positon
  if(!x && !y) {
    return addPlayer(1, mazeHeight - 2);
  }

  // check in inner wall bounds
  // because we need to remove existing entity
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // remove existing entity
    if(tiles[x][y].entity) {
      entities.slice(entities.indexOf(tiles[x][y].entity), 1);
      tiles[x][y].entity = null;
    }

    // create
    player = new Player();
    return addEntity(player, x, y);
  }
  else {
    return null;
  }
}

/**
 * Add Goal at optional location. If no location is supplied, a location of
 * x: mazeWidth - 2, y: 1 is used.
 * The Goal will not be added if the location is outside these bounds
 * x > 0 && x < w - 1 && y > 0 && y < h - 1
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Goal} the added goal or null.
 */
function addGoal(x, y) {
  // default positon
  if(!x && !y) {
    return addGoal(mazeWidth - 2, 1);
  }

  // check in inner wall bounds
  // because we need to remove existing entity
  if(x > 0 && x < mazeWidth - 1 && y > 0 && y < mazeHeight - 1) {

    // remove existing entity
    if(tiles[x][y].entity) {
      entities.slice(entities.indexOf(tiles[x][y].entity), 1);
      tiles[x][y].entity = null;
    }

    // create
    return addEntity(new Goal(), x, y);
  }
  else {
    return null;
  }
}

/**
 * Add Monster at optional location. If no location is supplied a random
 * one will be chosen.
 * The Monster will not be added if the location is outside these bounds
 * x > 1 && x < w - 2 && y > 1 && y < h - 2
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Monster} the added monster or null.
 */
function addMonster(x, y) {
  // random positon
  if(!x && !y) {
    var tile = getEmptyTile();

    if(!tile) {
      return null;
    }

    return addEntity(new Monster(), tile.x, tile.y);
  }

  // supplied positon
  return addEntity(new Monster(), x, y);
}

/**
 * Add n random monsters. Caps n to 50.
 * @param {Number} n the number of monsters.
 */
function addRandomMonsters(n) {
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addMonster();
  };
}

/**
 * Add Energy at location. If no location is supplied a random
 * one will be chosen.
 * The Energy will not be added if the location is outside these bounds
 * x > 1 && x < w - 2 && y > 1 && y < h - 2
 * @param {Number} x optional x location.
 * @param {Number} y optional y location.
 * @return {Energy} the added energy or null.
 */
function addEnergy(x, y) {
  // random positon
  if(!x && !y) {
    var tile = getEmptyTile();

    if(!tile) {
      return null;
    }

    return addEntity(new Energy(), tile.x, tile.y);
  }

  // supplied positon
  return addEntity(new Energy(), x, y);
}

/**
 * Add n random energies. Caps n to 50.
 * @param {Number} n the number of energies.
 */
function addRandomEnergies(n) {
  if(n > 50) n = 50;

  for (var i = 0; i < n; i++) {
    addEnergy();
  };
}

/**
 * Show a message in the game.
 * todo: implementation
 * @param {String} message the message string.
 */
function showMessage(message) {
  console.log(message);
}

/**
 * Play a sound.
 * todo: implementation
 * @param {String} name optional sound name.
 */
function playSound(name) {
  name = name || 'random';
  console.log('play "' + name + '" sound');
}

/**
 * Reset the maze. Call before creating a new maze if one already exist.
 * Does not need to be used on first load, ie the page has loaded and no
 * maze has been created yet.
 */
function resetMaze() {
  resetKeys();
  tiles = [];
  entities = [];
  player = null;  
  turn = 1;
  steps = 0;
  score = 0;
  energy = 0;
  mazeWidth = 0;
  mazeHeight = 0;
}

/**
 * Create an empty maze surrounded by walls.
 * @param {Number} width the width of the maze in tiles.
 * @param {Number} height the height of the maze in tiles.
 */
function createEmptyMaze(width, height) {
  // supplied or existing or default
  mazeWidth = width || mazeWidth || 16;
  mazeHeight = height || mazeHeight || 8;

  tiles = [mazeWidth];

  for (var x = 0; x < mazeWidth; x++) {
    tiles[x] = [mazeHeight];
    for (var y = 0; y < mazeHeight; y++) {
      var type = 'floor';

      if (x == 0 || x == mazeWidth - 1 || y == 0 || y == mazeHeight - 1) {
        type = 'wall';
      }

      tiles[x][y] = {
        x: x,
        y: y,
        type: type
      };
    }
  }
}

/**
 * Create a random maze surrounded by walls.
 * Player will be put at bottom left. Goal at top right.
 * Adds random monsters, energies, walls. 
 * @param {Number} width the width of the maze in tiles.
 * @param {Number} height the height of the maze in tiles.
 */
function createRandomMaze(w, h) {
  createEmptyMaze(w, h);
  
  for (var i = 0; i < Math.floor(mazeWidth * mazeHeight / 15); i++) {
    addWall();
  };

  for (var i = 0; i < Math.floor(mazeWidth * mazeHeight / 20); i++) {
    addEnergy();
  };

  for (var i = 0; i < Math.floor(mazeWidth * mazeHeight / 30); i++) {
    addMonster();
  };

  addPlayer();
  addGoal();
}

/**
 * Set a custom event handler for when a player hits any entity 
 * (includes walls).
 * By default, the custom event handler function will not entirely replace 
 * the exiting collision processing, as the player will still expect to damage 
 * monsters and pickup energies etc. To stop the expected collision behavior 
 * with monsters, energies, goals and walls return 'true' from the
 * event handler. 
 * The event function receives one paramater, the object being hit.
 * @param {Function} fn the collsion event function.
 * @return {Boolean} true cancels the normal processing of collision events
 */
// actually sets the collisionEventHook so that the collisionEvent 
// functionality is not overriden.
// was implemented this way rather than wrapping the prototype outside of the 
// api so that the api was simpler to use by content creators.
function setPlayerHitObjectEventHandler(fn) {
  Player.prototype.collisionHook = fn;
}

/**
 * Set and replace the event handler for when a player hits a monster.
 * The event function receives one paramater, the monster being hit.
 * @param {Function} fn the collsion event function.
 */
function setPlayerHitMonsterEventHandler(fn) {
  Player.prototype.monsterCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player hits a energy.
 * The event function receives one paramater, the energy being hit.
 * @param {Function} fn the collsion event function.
 */
function setPlayerHitEnergyEventHandler(fn) {
  Player.prototype.energyCollisionEvent = fn;
}

/**
 * Set and replace the event handler for when a player takes a step.
 * @param {Function} fn the collsion event function.
 */
function setPlayerStepTakenEventHandler(fn) {
  Player.prototype.stepEvent = fn;
}

// return the count of entities of a given type 
function getEntitiesOfTypeCount(type) {
  var count = 0;

  for (var i = 0; i < entities.length; i++) {
    if(entities[i].type == type) {
      count++;
    }
  }

  return count;
}

/**
 * Get the number of monsters in the maze.
 * @return {Number} the number of monsters in the maze.
 */
function getMonsterCount() {
  return getEntitiesOfTypeCount('monster');
}

/**
 * Get the number of energies in the maze.
 * @return {Number} the number of energies in the maze.
 */
function getEnergyCount() {
  return getEntitiesOfTypeCount('energy');
}

/**
 * Get the number of goals in the maze.
 * @return {Number} the number of goals in the maze.
 */
function getGoalCount() {
  return getEntitiesOfTypeCount('goal');
}

/**
 * Get the number of inner wall in the maze. Does not count boundary walls.
 * @return {Number} the number of goals in the maze.
 */
function getWallCount() {
  var count = 0;
  
  for (var x = 1; x < mazeWidth - 1; x++) {
    for (var y = 1; y < mazeHeight - 1; y++) {
      if (tiles[x][y].type == 'wall') {
        count++;
      } 
    }
  }

  return count;
}

/**
 * Start the game with an existing canvas identified by the ID.
 * @param {String} canvasID the ID for the canvas to use.
 */
function startFromCanvas(canvasID) {
  canvas = document.getElementById(canvasID);
  context = canvas.getContext('2d');
  resizeCanvas();
  bindKeyEvents();
  tickBrowser();
}

/**
 * Start the game in a container oject identified by the ID. 
 * @param {String} containerID the ID for the container to inser a canvas into.
 */
function startFromContainer(containerID) {
  canvas = document.createElement('canvas');
  context = canvas.getContext('2d');
  var container = document.getElementById(containerID);
  container.appendChild(canvas);
  resizeCanvas();
  bindKeyEvents();
  tickBrowser();
}


/*
 * Entity.
 */
function Entity() {}

// Entity properties

// display name
Entity.prototype.name = '';
// player, monster, energy
Entity.prototype.type = '';
// set to true to remove entity
Entity.prototype.remove = false;
// health
Entity.prototype.energy = 0;
// the amount of energy it rewards
Entity.prototype.reward = 0;
// the amount of energy it takes
Entity.prototype.damage = 0;
// x, y location in the maze
Entity.prototype.x = 0;
Entity.prototype.y = 0;

// Entity private

// called by maze
Entity.prototype.update = function(delta) {}

// called by maze
Entity.prototype.render = function() {
  context.fillStyle = this.color;
  context.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
}

// Entity public

/*
 * Set name.
 * @param {String} name.
 */
Entity.prototype.setName = function(name) {
  this.name = name;
}

/*
 * Get name.
 * @return {String} name.
 */
Entity.prototype.getName = function() {
  return this.name;
}

/*
 * Try to move up. 
 * If can move will call moveUpEvent.
 * If wall collision will call wallCollisionEvent.
 * if entity collision will call collisionEvent.
 */
Entity.prototype.moveUp = function() {
  debug(this.type + ' trying to move up');

  // wall collision
  if(this.y-1 >= 0 && tiles[this.x][this.y-1].type == 'wall') {
    this.collisionEvent(tiles[this.x][this.y-1]);
  }
  // not wall
  else {
    // entity collision
    if(tiles[this.x][this.y-1].entity) {
      this.collisionEvent(tiles[this.x][this.y-1].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x][this.y-1].entity = this;
      this.y--;
      this.stepEvent();
    }
  }
}

/*
 * Attempt to move down. 
 * Can't move through walls.
 * Can trigger Entity collision callback. 
 */
Entity.prototype.moveDown = function() {
  debug(this.type + ' trying to move down');

  // wall collision
  if(this.y+1 < mazeHeight && tiles[this.x][this.y+1].type == 'wall') {
    this.collisionEvent(tiles[this.x][this.y+1]);
  }
  else {
    // entity collision
    if(tiles[this.x][this.y + 1].entity) {
      this.collisionEvent(tiles[this.x][this.y + 1].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x][this.y + 1].entity = this;
      this.y++;
      this.stepEvent();
    }
  }
}

/*
 * Attempt to move left. 
 * Can't move through walls.
 * Can trigger Entity collision callback. 
 */
Entity.prototype.moveleft = function() {
  debug(this.type + ' trying to move left');

  // wall collision
  if(this.x-1 >= 0 && tiles[this.x-1][this.y].type == 'wall') {
    this.collisionEvent(tiles[this.x-1][this.y]);
  }
  else {
    // entity collision
    if(tiles[this.x-1][this.y].entity) {
      this.collisionEvent(tiles[this.x-1][this.y].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x - 1][this.y].entity = this;
      this.x--;
      this.stepEvent();
    }
  }
}

/*
 * Attempt to move right. 
 * Can't move through walls.
 * Can trigger Entity collision callback. 
 */
Entity.prototype.moveRight = function() {
  debug(this.type + ' trying to move right');

  // wall collision
  if(this.x+1 < mazeWidth && tiles[this.x+1][this.y].type == 'wall') {
    this.collisionEvent(tiles[this.x+1][this.y]);
  }
  else {
    // entity collision
    if(tiles[this.x+1][this.y].entity) {
      this.collisionEvent(tiles[this.x+1][this.y].entity);
    }
    // not wall, not entity, is other tile type
    else {
      tiles[this.x][this.y].entity = null;
      tiles[this.x + 1][this.y].entity = this;
      this.x++;
      this.stepEvent();
    }
  }
}

/*
 * Provides the ability to hook into the collision event without replacing it.
 */
Entity.prototype.collisionHook = function(object) {
  debug('collision hook');
}

/*
 * General callback for collision with entity callback. 
 * Will check entity type and call type callbacks.
 * @param {Entity} object the entity collides with.
 */
Entity.prototype.collisionEvent = function(object) {  

  // if returns true then cancel further collision processing
  if(this.collisionHook(object)) {
    return;
  }
  
  if(object.type == 'wall') {
    this.wallCollisionEvent(object);
  }
  else if(object.type == 'player') {
    this.playerCollisionEvent(object);
  }
  else if(object.type == 'monster') {
    this.monsterCollisionEvent(object);
  }
  else if(object.type == 'energy') {
    this.energyCollisionEvent(object);
  }
  else if(object.type == 'goal') {
    this.goalCollisionEvent(object);
  }
}

/*
 * Callback for collision with wall. 
 * @param {Tile} tile the entity collides with.
 */
Entity.prototype.wallCollisionEvent = function(tile) {
  debug(this.type + ' collision will wall (' + tile.x + ',' + tile.y + ')');
}

/*
 * Callback for collision with player. 
 * @param {Player} the other entity in the collision.
 */
Entity.prototype.playerCollisionEvent = function(player) {
  debug(this.type + ' collision will player (' + player.x + ',' + player.y + ')');
}

/*
 * Callback for collision with monster. 
 * @param {Monster} the other entity in the collision.
 */
Entity.prototype.monsterCollisionEvent = function(monster) {
  debug(this.type + ' collision will monster (' + monster.x + ',' + monster.y + ')');
}

/*
 * Callback for collision with energy. 
 * @param {Energy} the other entity in the collision.
 */
Entity.prototype.energyCollisionEvent = function(energy) {
  debug(this.type + ' collision will energy (' + energy.x + ',' + energy.y + ')');
}

/*
 * Collision callback with goal. 
 * @param {Goal} the other entity in the collision.
 */
Entity.prototype.goalCollisionEvent = function(goal) {
  debug(this.type + ' collision will goal (' + goal.x + ',' + goal.y + ')');
}

/*
 * Removed callback. 
 * Set entity.remove = true to trigger.
 */
Entity.prototype.removed = function() {
  debug(this.type + ' removed');
}


/*
 * Player.
 * @class
 */
function Player() {
  // super
  Entity.call(this);
}

Player.prototype = Object.create(Entity.prototype);

// Player properties

Player.prototype.energy = 20;
Player.prototype.damage = 1;
Player.prototype.type = 'player';
Player.prototype.color = '#3374D0';

// Player private

// called by update
Player.prototype.update = function(delta) {
  var input = true;

  if (keyPressed('LEFT') || keyPressed('A')) {
    this.moveleft();
  } 
  else if (keyPressed('RIGHT') || keyPressed('D')) {
    this.moveRight();
  }
  else if (keyPressed('UP') || keyPressed('W')) {
    this.moveUp();
  } 
  else if (keyPressed('DOWN') || keyPressed('S')) {
    this.moveDown();
  }
  else {
    input = false;
  }

  // if(input) {
  //   this.nextTurn();
  // }
}

// Player public

/*
 * Callback for collision with energy. 
 * @param {Energy} the other entity in the collision.
 */
Player.prototype.energyCollisionEvent = function(energy) {
  Entity.prototype.energyCollisionEvent.call(this, energy);

  // remove self off tile
  tiles[this.x][this.y].entity = null;

  // update location
  this.x = energy.x;
  this.y = energy.y;

  // add energy reward
  this.energy += energy.reward;

  // move self to energy tile
  tiles[this.x][this.y].entity = this;

  // flag energy for removal
  energy.remove = true;
}

/*
 * Callback for collision with monster. 
 * @param {Monster} the other entity in the collision.
 */
Player.prototype.monsterCollisionEvent = function(monster) {
  Entity.prototype.monsterCollisionEvent.call(this, monster);
  debug(this.type + ' hits ' + monster.type + ' for ' + this.damage + ' damage');
  
  monster.energy -= this.damage;

  if(monster.energy <= 0) {
    monster.energy = 0;
    monster.remove = true;
  }
}

/*
 * Callback for collision with goal. 
 * @param {Goal} the other entity in the collision.
 */
Player.prototype.goalCollisionEvent = function(goal) {
  Entity.prototype.goalCollisionEvent.call(this, goal);
  debug(this.type + ' has found an exit');
}

/*
 * Event that is called when the player moves to a tile.
 */
Player.prototype.stepEvent = function(object) { 
  steps++;
}


/*
 * Monster.
 * @class
 */
function Monster() {
  // super
  Entity.call(this);
}

Monster.prototype = Object.create(Entity.prototype);

// Monster properties

Monster.prototype.turn = 1;
Monster.prototype.energy = 2;
Monster.prototype.damage = 1;
Monster.prototype.type = 'monster';
Monster.prototype.color = '#FF4A1E';


/*
 * Energy.
 * @class
 */
function Energy() {
  // super
  Entity.call(this);
}

Energy.prototype = Object.create(Entity.prototype);

// Energy properties

Energy.prototype.reward = 5;
Energy.prototype.type = 'energy';
Energy.prototype.color = '#EEDC2D';


/*
 * Goal.
 * @class
 */
function Goal() {
  // super
  Entity.call(this);
}

Goal.prototype = Object.create(Entity.prototype);

// Goal properties

Goal.prototype.type = 'goal';
Goal.prototype.color = '#2BF369';
