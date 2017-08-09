const
  dev = require('./dev-log'),
  file = require('./file')
;

module.exports = (function() {

  // This var stores all session ID and the folder they are authorized to edit
  let users_auth = {};

  const API = {
    setAuthenticate   : (sessionId, admin_access) => { return setAuthenticate(sessionId, admin_access); },
    filterFolders     : (sid, foldersData) => { return filterFolders(sid, foldersData); },
    filterMedias      : (sessionId, slugFolderName, mediasData) => { return filterMedias(sessionId, slugFolderName, mediasData); }
  };

  function setAuthenticate(sessionId, admin_access) {
    return new Promise(function(resolve, reject) {

      // get all folders slugs and passwords
      file.getFolder().then(foldersData => {
        // compare with data we received
        for(let slugFolderName in admin_access) {
          // if the slug match, and the hashed password matches as well
          if(foldersData[slugFolderName] !== undefined &&
          admin_access[slugFolderName] === foldersData[slugFolderName].password) {
            // add a key "sessionId" in users_auth and push slugFolderName as a value
            if(!users_auth.hasOwnProperty(sessionId)) {
              users_auth[sessionId] = [];
            }
            users_auth[sessionId].push(slugFolderName);
          }
        }

        dev.log(`Authentificated a new user ${sessionId}, can edit ${users_auth[sessionId].join()}`);
        resolve();
      }, function(err, p) {
        dev.error(`Failed to get folder data: ${err}`);
        reject(err);
      });
    });
  }

  function filterFolders(sessionId, foldersData) {
    dev.logverbose(`Filtering folders data for ${sessionId}.`);
    for (let slugFolderName in foldersData) {
      // find if sessionID has this folder
      if(users_auth[sessionId] !== undefined && users_auth[sessionId].indexOf(slugFolderName) >= 0) {
        dev.logverbose(`For ${sessionId}, admin access authorized for ${slugFolderName}.`);
        foldersData[slugFolderName].authorized = true;
      } else {
        dev.logverbose(`For ${sessionId}, admin access refused for ${slugFolderName}.`);
        foldersData[slugFolderName].authorized = false;
      }
    }
    return foldersData;
  }

  function filterMedias(sessionId, slugFolderName, mediasData) {
    dev.logverbose(`Filtering medias data for ${sessionId}.`);

    if(users_auth[sessionId] !== undefined && users_auth[sessionId].indexOf(slugFolderName) >= 0) {
      // if is admin, do nothing
    } else {
      // is public user (remove all non-public medias)
      for(let slugMediaName in mediasData) {
        dev.logverbose(`Meta : ${JSON.stringify(mediasData[slugMediaName], null, 4)}`);
        if(!mediasData[slugMediaName].hasOwnProperty('public') ||
        !(mediasData[slugMediaName].public === true || mediasData[slugMediaName].public == 'true')) {
          dev.logverbose(`Removing media ${slugMediaName} for public user`);
          delete mediasData[slugMediaName];
        }
      }
    }
    return mediasData;
  }

  return API;
})();
