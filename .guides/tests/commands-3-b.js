
$.getScript(window.location.origin + '/public/content/blockly/' + window.testEnv.cmd + '/blockly-gen.js')
.done(function (script, status) {      
  console.log(_commands);
  
  if(getMonsterCount() == 3 && 
     player) {
    
    codio.setButtonValue(window.testEnv.id, codio.BUTTON_STATE.SUCCESS, 'Well done!');
  }
  else {
    codio.setButtonValue(window.testEnv.id, codio.BUTTON_STATE.FAILURE, 'Not quite right, try again!');
  }
})
.fail(function (jqxhr, settings, exception) {
  console.log(exception);
  codio.setButtonValue(window.testEnv.id, codio.BUTTON_STATE.INVALID, exception.message); 
});
