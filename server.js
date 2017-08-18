var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var dev = require('./bin/dev-log');

// var localtunnel = require('localtunnel');
// var ngrok = require('ngrok');

const
  config = require('./config.json')
;

module.exports = function(electronApp) {
  dev.logverbose('Starting server 1');

  var app = express();
  // works without asking for a certificate
  const privateKey  = fs.readFileSync(path.join(__dirname, 'ssl', 'file.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'file.crt'), 'utf8');
  const options = { key: privateKey, cert: certificate };


  let server = https.createServer(options, app);
  var io = require('socket.io').listen(server);
  dev.logverbose('Starting server 2');

  var sockets = require('./sockets');
  var expressSettings = require('./express-settings');
  var router = require('./router');

  var m = sockets.init(app, io, electronApp);

  expressSettings(app, express);
  router(app, io, m);

  server.listen(app.get('port'), () => {
    dev.log(`Server up and running. Go to ${config.protocol}://${config.host}:${config.port}`);
    dev.log(` `);
    process.on('unhandledRejection', (reason, p) => {
      dev.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
    });
  });
};
