
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

function addRandomMonsters() {
  monsterCount++;
}

function addRandomEnergies() {
  energyCount++;
}

function addRandomWalls() {
  wallCount++;
}

// todo export blockly-gen as a node module

try {
  var data = fs.readFileSync('/home/codio/workspace/public/content/blockly/commands-5-b/blockly-gen.js', 'utf8');
  eval(data);

  if(maze && player && goal && monsterCount == 2 && energyCount == 2 && wallCount == 3) {
    process.stdout.write('Well done!');  
    process.exit(0);
  }

}
catch(e) {
  
}

process.stdout.write('Not quite right, try again!');  
process.exit(1);
