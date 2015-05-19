function loadUserScript(fileName) {
  $.getScript(fileName)
    .done(function(script, textStatus) {
      if (userScriptLoaded) {
        userScriptLoaded()
      }
    })
    .fail(function(jqxhr, settings, exception) {

      $.ajax(fileName, {
        dataType: "text",
        success: function(data) {
          var result = JSHINT(data, {
            asi: true
          });
          var data = JSHINT.data();
          var i, msg
          var lines = []
          for(i = 0, msg = ''; i < data.errors.length; i++) {
            if(!lines[data.errors[i].line]) {
              msg += '<b>Line ' + data.errors[i].line + '</b> : ' + data.errors[i].reason + '<br>'
            }
            lines[data.errors[i].line] = true
            if(i == 2) {
              msg += 'There were more errors, but we\'re stopping there'
              break
            }
          }
          swal({
            title: "Syntax Error",
            text: msg,
            html: true,
            confirmButtonText: "OK"
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          swal('Unable to load the user script file')
          console.log('Unable to load file');
        }
      });

    });
}