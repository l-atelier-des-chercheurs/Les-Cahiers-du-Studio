var express = require('express');
var http = require('http');
// var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

var dev = require('./bin/dev-log');

// var localtunnel = require('localtunnel');
// var ngrok = require('ngrok');

const
  config = require('./config.json'),
  sockets = require('./sockets'),
  router = require('./router')
;

module.exports = function(electronApp) {
  dev.logverbose('Starting server 1');

  var app = express();

/*
  // only for HTTPS, works without asking for a certificate
  const privateKey  = fs.readFileSync(path.join(__dirname, 'ssl', 'file.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'file.crt'), 'utf8');
  const options = { key: privateKey, cert: certificate };
*/


  let server = http.createServer(app);
  var io = require('socket.io').listen(server);
  dev.logverbose('Starting server 2');

  var m = sockets.init(app, io, electronApp);

  {
    dev.logverbose('Starting express-settings');

    app.set('port', global.appInfos.port); //Server's port number
    app.set('views', path.join(__dirname, 'views')); //Specify the views folder
    app.set('view engine', config.templateEngine); //View engine is Jade

    app.use(express.static(global.pathToUserContent));
    app.use(express.static(path.join(__dirname, 'client')));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.locals.pretty = true;
  }

  router(app, io, m);

  server.listen(app.get('port'), () => {
    dev.log(`Server up and running. Go to ${config.protocol}://${config.host}:${global.appInfos.port}`);
    dev.log(` `);
  });
};
