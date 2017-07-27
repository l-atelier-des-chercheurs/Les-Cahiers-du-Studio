var express = require("express");
var http = require('http');
var https = require('https');
var fs = require('fs');
var io = require('socket.io');
var path = require('path');
var dev = require('./bin/dev-log');

// var localtunnel = require('localtunnel');
// var ngrok = require('ngrok');

const
  config = require('./config.json'),
  local = require('./local')
;

module.exports = function(electronApp) {
  dev.logverbose('Starting server 1');

  var app = express();
  // works without asking for a certificate
  const privateKey  = fs.readFileSync(path.join(__dirname, 'ssl', 'file.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'file.crt'), 'utf8');
  const options = { key: privateKey, cert: certificate };

  if( config.protocol === 'http')
    var server = http.createServer(app);
  else if( config.protocol === 'https')
    var server = https.createServer(options, app);

  var io = require('socket.io').listen(server);
  dev.logverbose('Starting server 2');

  var sockets = require('./sockets');
  dev.logverbose('Starting server 2');
  var expressSettings = require('./express-settings');
  dev.logverbose('Starting server 2');
  var router = require('./router');
  dev.logverbose('Starting server 2');

  var m = sockets.init(app, io, electronApp);

  expressSettings(app, express);
  router(app, io, m);

  server.listen(app.get("port"), function() {
    dev.log(`Server up and running. Go to ${config.protocol}://${config.host}:${config.port}`);
    dev.log(` `);
    process.on('unhandledRejection', function(reason, p) {
      dev.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    });
  });
}
