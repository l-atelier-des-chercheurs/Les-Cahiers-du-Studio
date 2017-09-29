const
  sharp = require('sharp'),
  path = require('path'),
  fs = require('fs-extra'),
  ffmpegstatic = require('ffmpeg-static'),
  ffprobestatic = require('ffprobe-static'),
  ffmpeg = require('fluent-ffmpeg'),
  exifReader = require('exif-reader')
;

const
  local  = require('../local'),
  dev = require('./dev-log'),
  api = require('./api')
;

ffmpeg.setFfmpegPath(ffmpegstatic.path);
ffmpeg.setFfprobePath(ffprobestatic.path);

module.exports = (function() {

  const API = {
    makeMediaThumbs   : (slugFolderName, slugMediaName, meta) => makeMediaThumbs(slugFolderName, slugMediaName, meta),
    getEXIFData       : (mediaPath) => getEXIFData(mediaPath),
    getMediaDuration  : (mediaPath) => getMediaDuration(mediaPath),
    getMediaRatio     : (mediaPath) => getMediaRatio(mediaPath),
  };

  // this function is used both when creating a media and everything media are listed.
  // this way, if thumbs are deleted or moved while the app is running, they will be recreated next time they are required
  function makeMediaThumbs(slugFolderName, slugMediaName, meta) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`THUMBS — makeMediaThumbs — Making thumbs for media with meta: ${JSON.stringify(meta, null, 4)}`);

      let thumbFolderPath = path.join(local.settings().thumbFolderName, slugFolderName);
      let mediaPath = path.join(api.getFolderPath(slugFolderName), slugMediaName);

      // let’s make sure that our thumb folder exists first
      fs.mkdirp(api.getFolderPath(thumbFolderPath), function (err) {
        if (err) { reject(err); }

        // regroup all thumbs promises so they can happen as fast as possible
        let makeThumbs = [];

        if(meta.type === 'image') {
          let thumbResolutions = [50,200,600,1800];
          thumbResolutions.forEach((thumbRes) => {
            let makeThumb = new Promise((resolve, reject) => {
              _makeImageThumb(mediaPath, thumbFolderPath, slugMediaName, thumbRes).then((thumbPath) => {
                let thumbMeta = {
                  path: thumbPath,
                  size: thumbRes
                };
                resolve(thumbMeta);
              })
              .catch(err => {
                resolve();
              });
            });
            makeThumbs.push(makeThumb);
          });
        }

        if(meta.type === 'video') {
          ffmpeg(mediaPath)
            // setup event handlers
            .on('end', function(files) {
              dev.logverbose(`Screenshots were saved : ${JSON.stringify(files,null,4)}`);
/*
              let thumbMeta = {
                path: thumbPath,
                size: thumbRes
              };
              resolve(thumbMeta);
*/
            })
            .on('error', function(err) {
              dev.error(`An error happened: ${err.message}`);
              reject(err.message);
            })
            .screenshots({
              count: 1,
              timemarks: ['00:00:00'],
              filename: `${slugMediaName}.%s.jpeg`,
              folder: api.getFolderPath(thumbFolderPath)
            });
        }

        Promise.all(makeThumbs).then((thumbData) => {
          resolve(thumbData);
        });
      });
    });
  }

  function getEXIFData(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`THUMBS — readEXIFData — for: ${mediaPath}`);

      sharp(mediaPath)
        .metadata()
        .then(metadata => {
          if(typeof metadata === 'undefined') {
            reject();
          }

          dev.logverbose(`Gotten metadata.`);
          let ts = _extractImageTimestamp(metadata);
          dev.logverbose(`TS is ${ts}`);

          let mediaRatio;
          mediaRatio = metadata.height / metadata.width;
          if(metadata.orientation && (metadata.orientation === 8 || metadata.orientation === 6)) {
            dev.log(`Media is portrait. Inverting ratio`);
            mediaRatio = 1/mediaRatio;
          }
          resolve({ ts, mediaRatio });
        })
        .catch(err => reject());
    });
  }

  // from https://github.com/pchaussalet/photo_triage/blob/61f5d53d697c3db102e91ad7f674f61c72f4c4bf/lib/maintenance.js
  function _extractImageTimestamp(metadata) {
    let timestamp;
    if (metadata.exif) {
      var parsedMetadata = exifReader(metadata.exif);
      if (parsedMetadata) {
        if (parsedMetadata.exif && (parsedMetadata.exif.DateTimeOriginal || parsedMetadata.exif.DateTimeDigitized)) {
          var exif = parsedMetadata.exif;
          if (exif.DateTimeOriginal) {
            timestamp = exif.DateTimeOriginal.getTime();
          } else {
            timestamp = exif.DateTimeDigitized.getTime();
          }
        } else {
          if (parsedMetadata.image && parsedMetadata.image.ModifyDate) {
            timestamp = parsedMetadata.image.ModifyDate.getTime();
          }
        }
      }
    }
    return timestamp !== undefined ? timestamp : false;
  }

  function _makeImageThumb(mediaPath, thumbFolderPath, slugMediaName, thumbRes) {
    return new Promise(function(resolve, reject) {
//       dev.logverbose(`Looking for an image thumb for ${mediaPath} and resolution = ${thumbRes}`);

      let thumbName = `${slugMediaName}.${thumbRes}.jpeg`;
      let thumbPath = path.join(thumbFolderPath, thumbName);
      let fullThumbPath = api.getFolderPath(thumbPath);

      // check first if it exists, resolve if it does
      fs.access(fullThumbPath, fs.F_OK, function(err) {
        // if userDir folder doesn't exist yet at destination
        if(err) {
          sharp(mediaPath)
            .rotate()
            .resize(thumbRes, thumbRes)
            .max()
            .withoutEnlargement()
            .withMetadata()
            .toFormat('jpeg', {
              quality: local.settings().mediaThumbQuality
            })
            .toFile(fullThumbPath)
            .then(function() {
              resolve(thumbPath);
            })
            .catch(err => reject());

        } else {
          resolve(thumbPath);
        }
      });
    });
  }

  function getMediaDuration(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`START: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath,function(err, metadata) {
        dev.log(`PROBE DATA : ${JSON.stringify(metadata, null, 4)}`);
        resolve(metadata.format.duration);
      });
    });
  }

  function getMediaRatio(mediaPath) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`START: ${mediaPath}`);
      ffmpeg.ffprobe(mediaPath,function(err, metadata) {
        if(err) { reject(); }
        if(metadata.streams !== undefined && typeof Array.isArray(metadata.streams)) {
          if(metadata.streams[0].height !== undefined && metadata.streams[0].width !== undefined) {
            let ratio = metadata.streams[0].height / metadata.streams[0].width;
            resolve(ratio);
          }
        }
        reject();
      });
    });
  }

  return API;
})();
