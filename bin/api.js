const path = require('path'),
	moment = require('moment'),
  parsedown = require('woods-parsedown'),
  fs = require('fs-extra')
;

const settings  = require('../settings'),
  dev = require('./dev-log')
;

var api = (function() {

  const API = {
    getContentPath              : (path = '')  => { return getContentPath(path) },
    findFirstFilenameNotTaken   : (confPath, fileName) => { return findFirstFilenameNotTaken(confPath, fileName) },
    getMetaFileOfConf           : (slugConfName) => { return getMetaFileOfConf(slugConfName); },
    readConfMeta                : (slugConfName) => { return readConfMeta(slugConfName); },
    getCurrentDate              : (format = settings.metaDateFormat) => { return getCurrentDate(format); },
    textifyObj                  : (obj) => { return textifyObj(obj); },
    storeData                   : (mpath, d, e) => { return storeData( mpath, d, e); },
    parseData                   : (d) => { return parseData(d); },
  }

  function getContentPath(toPath) {
    return path.join(global.pathToUserContent, toPath);
  }

  // check whether fileName (such as "hello-world.mp4") already exists in the conf folder
  function findFirstFilenameNotTaken(confPath, fileName) {
    return new Promise(function(resolve, reject) {
      // let's find the extension if it exists
      var fileExtension = new RegExp( settings.regexpGetFileExtension, 'i').exec( fileName)[0];
      var fileNameWithoutExtension = new RegExp( settings.regexpRemoveFileExtension, 'i').exec( fileName)[1];
      fileNameWithoutExtension = slugg(fileNameWithoutExtension);
      dev.logverbose("Looking for existing file with name : " + fileNameWithoutExtension + " in confPath : " + confPath);
      try {
        var newFileName = fileNameWithoutExtension + fileExtension;
        var newMetaFileName = fileNameWithoutExtension + settings.metaFileext;
        var index = 0;
        var newPathToFile = path.join(confPath, newFileName);
        var newPathToMeta = path.join(confPath, newMetaFileName);
        dev.logverbose( "2. about to look for existing files.");
        // check si le nom du fichier et le nom du fichier méta sont déjà pris
        while( (!fs.accessSync( newPathToFile, fs.F_OK) && !fs.accessSync( newPathToMeta, fs.F_OK))){
          dev.logverbose("- - following path is already taken : newPathToFile = " + newPathToFile + " or newPathToMeta = " + newPathToMeta);
          index++;

          newFileName = fileNameWithoutExtension + "-" + index + fileExtension;
          newMetaFileName = fileNameWithoutExtension + "-" + index + settings.metaFileext;
          newPathToFile = path.join(confPath, newFileName);
          newPathToMeta = path.join(confPath, newMetaFileName);
        }
      } catch(err) {

      }
      dev.logverbose( "3. this filename is not taken : " + newFileName);
      resolve(newFileName);
    });
  }

  function getMetaFileOfConf(slugConfName) {
    let confPath = api.getContentPath(slugConfName);
    let metaPath = path.join(confPath, settings.confMetafilename+settings.metaFileext);
    return metaPath;
  }

  function readConfMeta(slugConfName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — readConfMeta: " + slugConfName);
      var metaConfPath = api.getMetaFileOfConf(slugConfName);
      var folderData = fs.readFileSync(metaConfPath, settings.textEncoding);
      var folderMetadata = api.parseData(folderData);

      if(folderMetadata.introduction !== undefined) {
        try {
          folderMetadata.introduction = mm.parse(folderMetadata.introduction).content;
        } catch(err){
          console.log('Couldn’t parse conf introduction for conf ' + slugConfName);
        }
      }

      dev.logverbose("conf meta : " + JSON.stringify(folderMetadata));
      resolve(folderMetadata);
    });
  }





  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      console.log('Will store data');
      var textd = textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(api.parseData(textd));
        });
      }
  	    if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(api.parseData(textd));
        });
      }
    });
  }
  function textifyObj( obj) {
    var str = '';
    dev.logverbose( '1. will prepare string for storage');
    for (var prop in obj) {
      var value = obj[prop];
      dev.logverbose('2. prop ? ' + prop + ' and value ? ' + value);
      // if value is a string, it's all good
      // but if it's an array (like it is for medias in publications) we'll need to make it into a string
      if( typeof value === 'array' || typeof value === 'object') {
        dev.logverbose('this is an array');
        value = value.join('\n');
      // check if value contains a delimiter
      } else if( typeof value === 'string' && value.indexOf('\n----\n') >= 0) {
        dev.logverbose( '2. WARNING : found a delimiter in string, replacing it with a backslash');
        // prepend with a space to neutralize it
        value = value.replace('\n----\n', '\n ----\n');
      }
      str += prop + ': ' + value + settings.textFieldSeparator;
  //       dev.logverbose('Current string output : ' + str);
    }
  //     dev.logverbose( '3. textified object : ' + str);
    return str;
  }

  function getCurrentDate(f) {
    return moment().format(f);
  }


  function parseData(d) {
    	dev.logverbose("Will parse data");
    	var parsed = parsedown(d);
    	// if there is a field called slides, this one has to be made into an array
    	if( parsed.hasOwnProperty('slides')) {
      	parsed.slides = parsed.slides.trim();
    	  parsed.slides = parsed.slides.split('\n');
    	  // remove empty items from array
      parsed.slides = parsed.slides.filter(String);
    }
    	return parsed;
  }




  return API;
})();

module.exports = api;