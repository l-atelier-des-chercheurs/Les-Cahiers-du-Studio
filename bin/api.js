const
  path = require('path'),
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
    getFolderPath       : (slugFolderName = '') => getFolderPath(slugFolderName),

    findFirstFilenameNotTaken   : (thisPath, fileName) => findFirstFilenameNotTaken(thisPath, fileName),
    getCurrentDate              : (format = local.settings().metaDateFormat) => getCurrentDate(format),
    convertDate                 : (date, format = local.settings().metaDateFormat) => convertDate(date, format),
    parseUTCDate                : (date) => parseUTCDate(date),
    parseDate                   : (date, format = local.settings().metaDateFormat) => parseDate(date, format),
    storeData                   : (mpath, d, e) => storeData( mpath, d, e),
    parseData                   : (d) => parseData(d),
    eventAndContent             : (sendEvent, objectJson) => eventAndContent(sendEvent, objectJson),
    sendEventWithContent        : (sendEvent, objectContent, io, socket) => sendEventWithContent(sendEvent, objectContent, io, socket),
    getLocalIP                  : () => getLocalIP(),
    slug                        : (term) => slug(term)
  };

  function getCurrentDate(f) {
    return moment().format(f);
  }

  function convertDate(date, f) {
    return moment(date).format(f);
  }
  function parseUTCDate(date) {
    return moment.utc(date);
  }

  function parseDate(date, f) {
    if(moment(date, f, true).isValid()) {
      return moment(date, f).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '';
    }
  }

  // check whether media (such as 'hello-world.mp4') already exists in the folder
  function findFirstFilenameNotTaken(thisPath, fileName) {
    return new Promise(function(resolve, reject) {
      // let's find the extension if it exists
      var fileExtension = new RegExp(local.settings().regexpGetFileExtension, 'i').exec(fileName)[0];
      // remove extension
      var fileNameWithoutExtension = new RegExp(local.settings().regexpRemoveFileExtension, 'i').exec(fileName)[1];
      // slug the rest of the name
      fileNameWithoutExtension = slug(fileNameWithoutExtension);

      let newFileName = `${fileNameWithoutExtension}${fileExtension}`;
      let newMetaFileName = `${newFileName}${local.settings().metaFileext}`;
      let newPathToFile = path.join(thisPath, newFileName);
      let newPathToMeta = path.join(thisPath, newMetaFileName);
      let index = 0;

      dev.logverbose(`2. about to look for existing files.`);
      try {
        // OPTIMIZATION : make an array of filenames instead, and use that as the condition
        while((!fs.accessSync(newPathToFile, fs.F_OK) && !fs.accessSync(newPathToMeta, fs.F_OK))){
          dev.logverbose(`- - following path is already taken : newPathToFile = ${newPathToFile} or newPathToMeta = ${newPathToMeta}`);
          index++;
          newFileName = `${fileNameWithoutExtension}-${index}${fileExtension}`;
          newMetaFileName = `${newFileName}${local.settings().metaFileext}`;
          newPathToFile = path.join(thisPath, newFileName);
          newPathToMeta = path.join(thisPath, newMetaFileName);
        }
      } catch(err) {
        // no file of this name has been found
      }
      dev.logverbose(`3. this filename is not taken : ${newFileName}`);
      resolve(newFileName);
    });
  }

  function parseData(d) {
    	dev.logverbose(`Will parse data`);
    	var parsed = parsedown.parse(d);
    	return parsed;
  }

  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — storeData');
      var textd = parsedown.textify(d);
      if( e === 'create') {
        fs.appendFile( mpath, textd, function(err) {
          if(err){ reject( err); }
          resolve(parseData(textd));
        });
      }
  	    if( e === 'update') {
        fs.writeFile( mpath, textd, function(err) {
          if(err){ reject( err); }
          resolve(parseData(textd));
        });
      }
    });
  }

  function eventAndContent(sendEvent, objectJson) {
    var eventContentJSON =
    {
      socketevent: sendEvent,
      content: objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent(sendEvent, objectContent, io, socket) {
    var eventAndContentJson = eventAndContent(sendEvent, objectContent);
    if(socket) {
      // content sent only to one user
      dev.logpackets(`eventAndContentJson for user ${socket.id} = ${JSON.stringify(eventAndContentJson, null, 4)}`);
      socket.emit( eventAndContentJson['socketevent'], eventAndContentJson['content']);
    } else {
      // content broadcasted to all connected users
      dev.logpackets(`eventAndContentJson for all users = ${JSON.stringify(eventAndContentJson, null, 4)}`);
      io.sockets.emit( eventAndContentJson['socketevent'], eventAndContentJson['content']);
    }
    dev.logpackets('packet sent');
  }

  // from http://stackoverflow.com/a/8440736
  function getLocalIP() {
    return new Promise(function(resolve, reject) {
      var ifaces = os.networkInterfaces();
      var networkInfo = {};
      Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' === iface.family && iface.internal === false) {
            networkInfo[ifname] = iface.address;
          }
        });
      });
      resolve(networkInfo);
    });
  }

  function slug(term) {
    return slugg(term);
  }

  return API;
})();