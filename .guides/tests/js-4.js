


var fs = require('fs');

var maze = false;
var player = false;
var goal = false;
var monsterCount = 0;
var energyCount = 0;
var wallCount = 0;

function createEmptyMaze() {
  maze = true;  
}

function addPlayer() {
  player = true;
}

function addGoal() {
  goal = true;
}

function addMonster(x, y) {
  if(x == 6 && y == 5) {
    monsterCount++;
  }
}

function addEnergy(x, y) {
  if(x == 5 && y == 3) {
    energyCount++;
  }
  
  if(x == 7 && y == 4) {
    energyCount++;
  }
}

function addWall(x, y) {
  if(x == 2 && y == 2) {
    wallCount++;
  }
}

// todo export blockly-gen as a node module

try {
  var data = fs.readFileSync('/home/codio/workspace/public/content/js/js-4.js', 'utf8');
  eval(data);

  if(maze && player && goal && monsterCount == 1 && energyCount == 2 && wallCount == 1) {
    process.stdout.write('Well done!');  
    process.exit(0);
  }

}
catch(e) {
  
}

process.stdout.write('Not quite right, try again!');  
process.exit(1);
