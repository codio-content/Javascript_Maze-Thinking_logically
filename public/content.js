
// define all custom blockly blocks

function defineCustomBlocks() {
  if (!Blockly) {
    if(console) console.log('Blockly is not defined');
  } 
  
  
  Blockly.Blocks['tea_want'] = {
    init: function() {
      this.setColour(10);
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('I want some tea!');
    }
  };
  Blockly.JavaScript['tea_want'] = function(block) {
    var code = 'tea_drink();\n';
    return code;
  };
  

  Blockly.Blocks['tea_check_kettle'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('If the kettle is empty add water');
    }
  };
  Blockly.JavaScript['tea_check_kettle'] = function(block) {
    var code = 'tea_check_kettle();\n';
    return code;
  };
  

  Blockly.Blocks['tea_boil_water'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Boil water');
    }
  };
  Blockly.JavaScript['tea_boil_water'] = function(block) {
    var code = 'tea_boil_water();\n';
    return code;
  };
  
 
  Blockly.Blocks['tea_teabag'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Put tea bag into cup');
    }
  };
  Blockly.JavaScript['tea_teabag'] = function(block) {
    var code = 'tea_teabag();\n';
    return code;
  };

 
  Blockly.Blocks['tea_pour_water'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Pour boiled water into cup');
    }
  };
  Blockly.JavaScript['tea_pour_water'] = function(block) {
    var code = 'tea_pour_water();\n';
    return code;
  };
    
  
  Blockly.Blocks['tea_sugar_variable'] = {
    init: function() {
      this.setColour(50);
      this.appendValueInput("tea_sugar_variable")
          .appendField("How many spoons of sugar to add?");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };
  
  
  Blockly.Blocks['tea_milk'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('If you want milk add some');
    }
  };
  Blockly.JavaScript['tea_milk'] = function(block) {
    var code = 'tea_milk();\n';
    return code;
  };
  

  Blockly.Blocks['tea_drink'] = {
    init: function() {
      this.setColour(125);
      this.setPreviousStatement(true);
      this.setNextStatement(false);
      var input = this.appendDummyInput();
      input.appendField('Drink tea and enjoy!');
    }
  };
  Blockly.JavaScript['tea_drink'] = function(block) {
    var code = 'tea_drink();\n';
    return code;
  };

  
  Blockly.Blocks['tea_time_variable'] = {
    init: function() {
      this.setColour(50);
      this.appendValueInput("tea_time_variable")
          .appendField("How many minutes to wait?");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

    
  Blockly.Blocks['tea_get_cup'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Get a tea cup');
    }
  };
  Blockly.JavaScript['tea_get_cup'] = function(block) {
    var code = 'tea_get_cup();\n';
    return code;
  };

    
  Blockly.Blocks['tea_get_tea_bag'] = {
    init: function() {
      this.setColour(50);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Get a tea bag');
    }
  };
  Blockly.JavaScript['tea_get_tea_bag'] = function(block) {
    var code = 'tea_get_tea_bag();\n';
    return code;
  };
  
}
