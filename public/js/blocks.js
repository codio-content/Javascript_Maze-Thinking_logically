
document.addEventListener('DOMContentLoaded', function() {

  Blockly.Blocks['test'] = {
    init: function() {
      this.setColour(10);
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      var input = this.appendDummyInput();
      input.appendField('Test');
    }
  };
  Blockly.JavaScript['test'] = function(block) {
    var code = 'test();\n';
    return code;
  };
  
});
