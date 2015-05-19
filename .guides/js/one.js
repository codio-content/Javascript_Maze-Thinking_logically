
window.addEventListener('codio-button-custom', function (ev) {
  
  if (codio) {
    codio.setButtonValue(ev.id, codio.BUTTON_STATE.PROGRESS, 'Checking');
    
    $.post(window.location.origin + ':9500/tests/one', 'hello world', function(data) {
      console.log(data);
      codio.setButtonValue(ev.id, codio.BUTTON_STATE.SUCCESS, 'Well done!');
    });
    
  }
});

console.log('.guides/js/one.js loaded');
