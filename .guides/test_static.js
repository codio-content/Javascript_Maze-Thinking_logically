
function indexOfCommand(val, j) {
  j = j || 0;
  j = j < 0 ? 0 : j;
    
  for(var i = j; i < _commands.length; i++) {
    if(_commands[i][0] == val) return i; 
  }
  
  return -1;
}

function command(val, j) {
  j = j || 0;

  for(var i = j; i < _commands.length; i++) {
    if(_commands[i][0] == val) return _commands[i]; 
  }
  
  return null;
}

window.testMode = true;
_commands = [];

$(document).ready(function() {
  window.addEventListener('codio-button-custom', function (env) {
    window.testComplete = false;
    window.testEnv = env;
    codio.setButtonValue(env.id, codio.BUTTON_STATE.PROGRESS, 'Checking');
    
    $.getScript(window.location.origin + '/.guides/tests/' + env.cmd + '.js')
    .done(function (script, status) {      
      console.log('done: test_static.js');
    })
    .fail(function (jqxhr, settings, exception) {
      console.log(exception);
      codio.setButtonValue(window.testEnv.id, codio.BUTTON_STATE.INVALID, exception.message); 
    }); 
  });
});
