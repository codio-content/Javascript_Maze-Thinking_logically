
// tutorial framework 
// supports:
// blockly init
// blockly/code toggling
// 

$(document).ready(function() {     
  initBlockly();      
});

function showBlockly() {
  $('#showBlockly').hide();
  $('#code').hide();
  $('#blocklyDiv').show();
  $('#showCode').show();
}

function showCode() {
  $('#showCode').hide();
  $('#blocklyDiv').hide();
  $('#code').show();
  $('#showBlockly').show();
}

function initBlockly() {
  if(!$('#codeWidget').length) return;
  
  showBlockly();
  // the custom blocks for the unit
  // needst to be globally defined
  defineCustomBlocks(); 
  
  // init blockly
  // defined under #blocklyScript
  // loaded on the server
  var toolbox = $('#toolbox').html();
  Blockly.inject('blocklyDiv', { toolbox: toolbox });

  // init default workspace
  // defined under #blocklyScript
  // loaded on the server
  if($('#workspace').length) {
    var xml = Blockly.Xml.textToDom($('#workspace').html());
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);    
  }

  // allows you to build a workspave with the toolset
  // grab the xml from the console and save on the server
  // to initialise on page load
  if(window.blocklyToXml) {
    $(document).click(function() {
      var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      var xml_text = Blockly.Xml.domToText(xml);
      console.log(xml_text);
    });
  }
  
  // hook up button clicks
  $('#showCode').click(showCode);
  $('#showBlockly').click(showBlockly);
}
