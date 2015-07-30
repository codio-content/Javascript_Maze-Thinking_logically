
var fs = require('fs');

var maze = false;
var player = false;
var monsterCount = false;

function createRandomMaze() {
  maze = true;  
}

function createEmptyMaze() {
  maze = true;  
}

function addRandomMonsters(count) {
  monsterCount = count;
}

function addPlayer() {
  player = true;
}

// todo export blockly-gen as a node module

try {
  var data = fs.readFileSync('/home/codio/workspace/public/content/blockly/commands-3-b/blockly-gen.js', 'utf8');
  eval(data);

  if(maze && monsterCount == 3 && player) {
    process.stdout.write('Well done!');  
    process.exit(0);
  }

}
catch(e) {
  
}

process.stdout.write('Not quite right, try again!');  
process.exit(1);
