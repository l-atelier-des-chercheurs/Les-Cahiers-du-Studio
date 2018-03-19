const path = require('path'),
  moment = require('moment'),
  parsedown = require('dodoc-parsedown'),
  fs = require('fs-extra'),
  slugg = require('slugg'),
  os = require('os'),
  writeFileAtomic = require('write-file-atomic');

const settings = require('../settings.json'),
  dev = require('./dev-log');

module.exports = (function() {
  const API = {
    getFolderPath: (slugFolderName = '') => getFolderPath(slugFolderName),
    findFirstFilenameNotTaken: (thisPath, fileName) =>
      findFirstFilenameNotTaken(thisPath, fileName),
    getCurrentDate: (format = settings.metaDateFormat) =>
      getCurrentDate(format),
    convertDate: (date, format = settings.metaDateFormat) =>
      convertDate(date, format),
    parseUTCDate: date => parseUTCDate(date),
    parseDate: (date, format = settings.metaDateFormat) =>
      parseDate(date, format),
    storeData: (mpath, d, e) => storeData(mpath, d, e),
    parseData: d => parseData(d),
    eventAndContent: (sendEvent, objectJson) =>
      eventAndContent(sendEvent, objectJson),
    sendEventWithContent: (sendEvent, objectContent, io, socket) =>
      sendEventWithContent(sendEvent, objectContent, io, socket),
    getLocalIP: () => getLocalIP(),
    slug: term => slug(term),
    clip: (value, min, max) => clip(value, min, max)
  };

  function _getUserPath() {
    return global.pathToUserContent;
  }

  function getFolderPath(slugFolderName = '') {
    return path.join(_getUserPath(), slugFolderName);
  }

  function getCurrentDate(f) {
    return moment().format(f);
  }

  function convertDate(date, f) {
    if (moment(date).isValid()) return moment(date).format(f);
    else return '';
  }
  function parseUTCDate(date) {
    return moment.utc(date);
  }

  function parseDate(date, f) {
    if (moment(date, f, true).isValid()) {
      return moment(date, f).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '';
    }
  }

  // check whether media (such as 'hello-world.mp4') already exists in the folder
  function findFirstFilenameNotTaken(thisPath, fileName) {
    return new Promise(function(resolve, reject) {
      // let's find the extension if it exists
      var fileExtension = new RegExp(settings.regexpGetFileExtension, 'i').exec(
        fileName
      )[0];
      // remove extension
      var fileNameWithoutExtension = new RegExp(
        settings.regexpRemoveFileExtension,
        'i'
      ).exec(fileName)[1];
      // slug the rest of the name
      fileNameWithoutExtension = slug(fileNameWithoutExtension);

      let newFileName = `${fileNameWithoutExtension}${fileExtension}`;
      let newMetaFileName = `${newFileName}${settings.metaFileext}`;
      let newPathToFile = path.join(thisPath, newFileName);
      let newPathToMeta = path.join(thisPath, newMetaFileName);
      let index = 0;

      dev.logverbose(`2. about to look for existing files.`);
      try {
        // OPTIMIZATION : make an array of filenames instead, and use that as the condition
        while (
          !fs.accessSync(newPathToFile, fs.F_OK) &&
          !fs.accessSync(newPathToMeta, fs.F_OK)
        ) {
          dev.logverbose(
            `- - following path is already taken : newPathToFile = ${newPathToFile} or newPathToMeta = ${newPathToMeta}`
          );
          index++;
          newFileName = `${fileNameWithoutExtension}-${index}${fileExtension}`;
          newMetaFileName = `${newFileName}${settings.metaFileext}`;
          newPathToFile = path.join(thisPath, newFileName);
          newPathToMeta = path.join(thisPath, newMetaFileName);
        }
      } catch (err) {
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

  function storeData(mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — storeData at path ${mpath}`);
      //       dev.logfunction(`with content ${d}`);
      if (typeof d === 'object') {
        d = parsedown.textify(d);
      }
      writeFileAtomic(mpath, d, err => {
        if (err) {
          reject(err);
        }
        resolve(parseData(d));
      });
    });
  }

  function eventAndContent(sendEvent, objectJson) {
    var eventContentJSON = {
      socketevent: sendEvent,
      content: objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent(sendEvent, objectContent, io, socket) {
    let eventAndContentJson = eventAndContent(sendEvent, objectContent);
    let eventAndContentJson_string = JSON.stringify(
      eventAndContentJson,
      null,
      4
    );
    if (socket) {
      // content sent only to one user
      dev.logpackets(
        `eventAndContentJson for user ${
          socket.id
        } = ${eventAndContentJson_string}`
      );
      socket.emit(
        eventAndContentJson['socketevent'],
        eventAndContentJson['content']
      );
    } else {
      // content broadcasted to all connected users
      dev.logpackets(
        `eventAndContentJson for all users = ${eventAndContentJson_string}`
      );
      io.sockets.emit(
        eventAndContentJson['socketevent'],
        eventAndContentJson['content']
      );
    }
    dev.logpackets(
      `eventAndContentJson — packet sent, string length: ${
        eventAndContentJson_string.length
      }`
    );
  }

  // from http://stackoverflow.com/a/8440736
  function getLocalIP() {
    return new Promise(function(resolve, reject) {
      var ifaces = os.networkInterfaces();
      var networkInfo = {};
      Object.keys(ifaces).forEach(function(ifname) {
        ifaces[ifname].forEach(function(iface) {
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

  function clip(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  return API;
})();
