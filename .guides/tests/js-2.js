
$.getScript(window.location.origin + '/public/content/js/' + window.testEnv.cmd + '.js')
.done(function (script, status) {
  console.log(_commands);
  
  if(indexOfCommand('createEmptyMaze') > -1 && indexOfCommand('addRandomMonsters') > -1 && command('addRandomMonsters')[1] == 3) {    
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
