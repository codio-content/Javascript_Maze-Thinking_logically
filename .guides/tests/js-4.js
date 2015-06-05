
$.getScript(window.location.origin + '/public/content/js/' + window.testEnv.cmd + '.js')
.done(function (script, status) {
  console.log(_commands);
  
  var iMaze = indexOfCommand('createEmptyMaze');
  
  if(iMaze > -1 && player && getGoalCount() == 1 &&
     tiles[2][2].type == 'wall' &&
     tiles[6][5].type == 'monster' &&
     tiles[5][3].type == 'energy' &&
     tiles[7][4].type == 'energy') {
    
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
