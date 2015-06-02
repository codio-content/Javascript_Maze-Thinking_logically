
var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var contentRoutes = require('./routes/content');
var testRoutes = require('./routes/tests');

var port = 9500;
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || port);
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader("Expires", new Date(Date.now()).toUTCString());
    next();
});
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'public')));


app.use('/', contentRoutes);
app.use('/tests/', testRoutes);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  console.log(err);
  
  if (err.status && err.status === 404) {
    res.send('404');
  }
});


var server = http.createServer(app);

server.listen(app.get('port'), function() {
  console.log('listening on port ' + app.get('port'));
});
