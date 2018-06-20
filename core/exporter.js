const path = require('path'),
  fs = require('fs-extra');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api');

module.exports = (function() {
  return {
    copyWebsiteContent: ({ html, foldersData }) => {
      return new Promise(function(resolve, reject) {
        // create cache folder that we will need to copy the content
        const slugFolderName = Object.keys(foldersData)[0];
        const mediasToExport = foldersData[slugFolderName].medias;

        let cacheFolderName =
          api.getCurrentDate() +
          slugFolderName +
          '-' +
          (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 2);

        let cachePath = path.join(
          global.tempStorage,
          settings.cacheDirname,
          cacheFolderName
        );

        fs.mkdirp(
          cachePath,
          function() {
            let tasks = [];
            // Générer le html a partir du pug au render, avec une variable qui contient tous les médias.
            tasks.push(
              new Promise((resolve, reject) => {
                let indexCacheFilepath = path.join(cachePath, 'index.html');
                api
                  .storeData(indexCacheFilepath, html, 'create')
                  .then(function(meta) {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to store HTML for export.`);
                    reject(err);
                  });
              })
            );

            // Copier les dépendances : bundle.js dans un sous dossier.
            tasks.push(
              new Promise((resolve, reject) => {
                let productionFolder = path.join(
                  global.appRoot,
                  'public',
                  'dist'
                );
                let productionFolderInCache = path.join(cachePath, 'dist');
                fs.copy(productionFolder, productionFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy production JS and CSS files.`);
                    reject(err);
                  });
              })
            );

            // Copier les dépendances : font dans un sous dossier.
            tasks.push(
              new Promise((resolve, reject) => {
                let fontFolder = path.join(global.appRoot, 'public', 'fonts');
                let fontFolderInCache = path.join(cachePath, 'fonts');
                fs.copy(fontFolder, fontFolderInCache)
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    dev.error(`Failed to copy font files.`);
                    reject(err);
                  });
              })
            );

            // récupère toutes les thumbs, les copie dans le cache
            // Copie le dossier _thumbs/slugFolderName vers cache/_thumbs/slugFolderName

            Object.keys(mediasToExport).forEach(slugMediaName => {
              const thumbs = mediasToExport[slugMediaName].thumbs;

              if (typeof thumbs === 'object' && thumbs.length > 0) {
                tasks.push(
                  new Promise((resolve, reject) => {
                    thumbs.map(t => {
                      let tpath = t.path;

                      fs.copy(
                        api.getFolderPath(tpath),
                        path.join(cachePath, tpath)
                      )
                        .then(() => {
                          resolve();
                        })
                        .catch(err => {
                          dev.error(`Failed to copy thumbs.`);
                          reject(err);
                        });
                    });
                  })
                );
              }

              // Copier tous les médias dans un dossier.
              tasks.push(
                new Promise((resolve, reject) => {
                  const pathToMedia = path.join(slugFolderName, slugMediaName);

                  fs.copy(
                    api.getFolderPath(pathToMedia),
                    path.join(cachePath, pathToMedia)
                  )
                    .then(() => {
                      resolve();
                    })
                    .catch(err => {
                      dev.error(`Failed to copy medias files.`);
                      reject(err);
                    });
                })
              );
            });

            Promise.all(tasks).then(d_array => {
              dev.log('Created complete archive of site.');
              resolve(cachePath);
            });
          },
          function(err, p) {
            dev.error(`Failed to create cache folder: ${err}`);
            reject(err);
          }
        );
      });
    }
  };
})();
