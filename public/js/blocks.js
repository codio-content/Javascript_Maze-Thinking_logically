
document.addEventListener('DOMContentLoaded', function() {

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
    var code = 'createRandomMaze()';
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
    var code = 'createEmptyMaze()';
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
          .appendField("Add Monster");
      this.setTooltip('');
    }
  };  
  Blockly.JavaScript['add_monster'] = function(block) {
    var value_count   = Blockly.JavaScript.valueToCode(block, 'count', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'addMonster(' + value_count + ')';
    return code;
  };  
   
  
});
