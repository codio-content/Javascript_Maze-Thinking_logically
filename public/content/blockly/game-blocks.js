
//
// Create Random Maze
//
Blockly.Blocks['create_random'] = {
  init: function() {
    this.setColour(20);
    this.appendDummyInput()
      .appendField("Create Random Maze");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['create_random'] = function(block) {
  var code = 'createRandomMaze()\n';
  return code;
};

//
// Create Empty Maze
//
Blockly.Blocks['create_empty'] = {
  init: function() {
    this.setColour(20);
    this.appendDummyInput()
      .appendField("Create Empty Maze");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['create_empty'] = function(block) {
  var code = 'createEmptyMaze()\n';
  return code;
};  

//
// Add Monster
//  
Blockly.Blocks['add_monster'] = {
  init: function() {
    this.setColour(20);      
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("Add Random Monsters");
    this.setPreviousStatement(true);
    this.setNextStatement(true);    
    this.setTooltip('');
  }
};  
Blockly.JavaScript['add_monster'] = function(block) {
  var value = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ADDITION) || '0' 
  console.log('Valuex:' + value)
  console.log(typeof value)
  console.log('asdasd') 
  if (value=='0')
    var code = 'addRandomMonsters(1)\n';
  else
    var code = 'addRandomMonsters(' + value + ')\n';
  return code;
};  

// 
// Add Monster @ (X,Y)
// 
Blockly.Blocks['add_monster_parms'] = {
  init: function() {
    this.setColour(20);
    this.appendDummyInput()
        .appendField("Add Monster")
        .appendField("X")
        .appendField(new Blockly.FieldTextInput(""), "xCoord")
        .appendField("Y")
        .appendField(new Blockly.FieldTextInput(""), "yCoord");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['add_monster_parms'] = function(block) {
  var text_xcoord = block.getFieldValue('xCoord');
  var text_ycoord = block.getFieldValue('yCoord');
  if (text_xcoord.trim() == '' || text_xcoord.trim == '0' || text_ycoord.trim == '' || text_ycoord.trim == '0') {
    var code = 'addRandomMonsters(1)\n';    
  }
  else {
    var code = 'addMonster(' + text_xcoord + ', ' + text_ycoord + ')\n';    
  }
  return code;
};


//
// Add Player
//
Blockly.Blocks['create_player'] = {
  init: function() {
    this.setColour(20);
    this.appendDummyInput()
      .appendField("Add Player");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['create_player'] = function(block) {
  var code = 'addPlayer()\n';
  return code;
}; 
   
//
// Add Random Energy
//  
Blockly.Blocks['add_energy'] = {
  init: function() {
    this.setColour(20);      
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("Add Random Energy");
    this.setPreviousStatement(true);
    this.setNextStatement(true);    
    this.setTooltip('');
  }
};  
Blockly.JavaScript['add_energy'] = function(block) {
  var value = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ADDITION) || '0'  
  console.log('Value:' + value) 
  var code = 'addRandomEnergies(' + value + ')\n';
  return code;
};  

// 
// Add Energy @ (X,Y)
// 
Blockly.Blocks['add_energy_parms'] = {
  init: function() {
    this.setColour(20);
    this.appendDummyInput()
        .appendField("Add Energy")
        .appendField("X")
        .appendField(new Blockly.FieldTextInput(""), "xCoord")
        .appendField("Y")
        .appendField(new Blockly.FieldTextInput(""), "yCoord");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['add_energy_parms'] = function(block) {
  var text_xcoord = block.getFieldValue('xCoord');
  var text_ycoord = block.getFieldValue('yCoord');
  if (text_xcoord.trim() == '' || text_xcoord.trim == '0' || text_ycoord.trim == '' || text_ycoord.trim == '0') {
    var code = 'addRandomEnergies(1)\n';    
  }
  else {
    var code = 'addEnergy(' + text_xcoord + ', ' + text_ycoord + ')\n';    
  }
  return code;
};

// 
// Add Wall @ (X,Y)
// 
Blockly.Blocks['add_wall_parms'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(20);
    this.appendDummyInput()
        .appendField("Add Wall")
        .appendField("X")
        .appendField(new Blockly.FieldTextInput(""), "xCoord")
        .appendField("Y")
        .appendField(new Blockly.FieldTextInput(""), "yCoord");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};
Blockly.JavaScript['add_wall_parms'] = function(block) {
  var text_xcoord = block.getFieldValue('xCoord');
  var text_ycoord = block.getFieldValue('yCoord');
  if (text_xcoord.trim() == '' || text_xcoord.trim == '0' || text_ycoord.trim == '' || text_ycoord.trim == '0') {
    var code = 'addRandomWalls(1)\n';    
  }
  else {
    var code = 'addWall(' + text_xcoord + ', ' + text_ycoord + ')\n';    
  }
  return code;
};





