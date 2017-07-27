const path = require('path'),
	moment = require('moment'),
  parsedown = require('dodoc-parsedown'),
  fs = require('fs-extra'),
  slugg = require('slugg'),
  os = require('os')
;

const
  local  = require('../local'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {
    getCurrentDate              : (f = local.settings().metaDateFormat)  => { return getCurrentDate(f) },
    findFirstFilenameNotTaken   : (path, fileName) => { return findFirstFilenameNotTaken(path, fileName) },
    getCurrentDate              : (format = local.settings().metaDateFormat) => { return getCurrentDate(format); },
    storeData                   : (mpath, d, e) => { return storeData( mpath, d, e); },
    parseData                   : (d) => { return parseData(d); },
    eventAndContent             : (sendEvent, objectJson) =>     { return eventAndContent(sendEvent, objectJson) },
    sendEventWithContent        : (sendEvent, objectContent, io, socket) => { return sendEventWithContent(sendEvent, objectContent, io, socket) },
    getLocalIP                  : () => { return getLocalIP() }
  }

  function getCurrentDate(f) {
    return moment().format(f);
  }

  // check whether fileName (such as "hello-world.mp4") already exists in the folder
  function findFirstFilenameNotTaken(path, fileName) {
    return new Promise(function(resolve, reject) {
      // let's find the extension if it exists
      var fileExtension = new RegExp( local.settings().regexpGetFileExtension, 'i').exec( fileName)[0];
      var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec( fileName)[1];
      fileNameWithoutExtension = slugg(fileNameWithoutExtension);
      dev.logverbose("Looking for existing file with name : " + fileNameWithoutExtension + " in path: " + path);
      try {
        var newFileName = fileNameWithoutExtension + fileExtension;
        var newMetaFileName = fileNameWithoutExtension + local.settings().metaFileext;
        var index = 0;
        var newPathToFile = path.join(path, newFileName);
        var newPathToMeta = path.join(path, newMetaFileName);
        dev.logverbose( "2. about to look for existing files.");
        // check si le nom du fichier et le nom du fichier méta sont déjà pris
        while( (!fs.accessSync( newPathToFile, fs.F_OK) && !fs.accessSync( newPathToMeta, fs.F_OK))){
          dev.logverbose("- - following path is already taken : newPathToFile = " + newPathToFile + " or newPathToMeta = " + newPathToMeta);
          index++;

          newFileName = fileNameWithoutExtension + "-" + index + fileExtension;
          newMetaFileName = fileNameWithoutExtension + "-" + index + local.settings().metaFileext;
          newPathToFile = path.join(path, newFileName);
          newPathToMeta = path.join(path, newMetaFileName);
        }
      } catch(err) {

      }
      dev.logverbose( "3. this filename is not taken : " + newFileName);
      resolve(newFileName);
    });
  }

  function parseData(d) {
    	dev.logverbose("Will parse data");
    	var parsed = parsedown.parse(d);
    	return parsed;
  }

  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — storeData');
      var textd = textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
  	    if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
    });
  }

  function getCurrentDate(f) {
    return moment().format(f);
  }

  function eventAndContent(sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent(sendEvent, objectContent, io, socket) {
    var eventAndContentJson = eventAndContent( sendEvent, objectContent);
    dev.logpackets("eventAndContentJson ", JSON.stringify(eventAndContentJson, null, 4));
    if(socket)
      // content sent only to one user
      socket.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    else
      // content broadcasted to all connected users
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    dev.logpackets("packet sent");
  }

  // from http://stackoverflow.com/a/8440736
  function getLocalIP() {
    return new Promise(function(resolve, reject) {
      var ifaces = os.networkInterfaces();
      var networkInfo = {};
      Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' === iface.family && iface.internal === false) {
            networkInfo[ifname] = iface.address;
          }
        });
      });
      resolve(networkInfo);
    });
  }

  return API;
})();