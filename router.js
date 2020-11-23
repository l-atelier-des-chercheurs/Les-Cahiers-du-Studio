const path = require("path"),
  fs = require("fs-extra"),
  formidable = require("formidable"),
  archiver = require("archiver");

const settings = global.settings,
  sockets = require("./core/sockets"),
  dev = require("./core/dev-log"),
  cache = require("./core/cache"),
  api = require("./core/api"),
  file = require("./core/file"),
  exporter = require("./core/exporter"),
  importer = require("./core/importer"),
  auth = require("./core/auth");

module.exports = function (app, io, m) {
  /**
   * routing event
   */
  app.get("/", showIndex);
  app.get("/:slugFolderName", loadFolderOrMedia);
  app.get("/:slugFolderName/media/:metaFileName", loadFolderOrMedia);
  app.get("/export/:type/:slugFolderName", exportFolderWithMedias);
  app.post("/_file-upload/:type/:slugFolderName", postFile);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function (resolve, reject) {
      let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = "Les Cahiers du Studio";
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugFolderName = "";
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.structure = settings.structure;
      pageData.isDebug = dev.isDebug();

      pageData.mode = "live";

      let tasks = [];

      let getPresentation = new Promise((resolve, reject) => {
        file.getPresentation().then((presentationMD) => {
          pageData.presentationMD = presentationMD;
          resolve();
        });
      });
      tasks.push(getPresentation);

      Promise.all(tasks).then(() => {
        resolve(pageData);
      });
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then(
      (pageData) => {
        dev.logpackets(`Rendering index with data `, JSON.stringify(pageData));
        res.render("index", pageData);
      },
      (err) => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolderOrMedia(req, res) {
    let slugFolderName = req.param("slugFolderName");
    let metaFileName = req.param("metaFileName");

    generatePageData(req).then(
      (pageData) => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: "folders", slugFolderName })
          .then(
            (foldersData) => {
              pageData.slugFolderName = slugFolderName;
              foldersData = api.removePasswordFromFoldersMeta(foldersData);
              pageData.folderAndMediaData = foldersData;
              if (metaFileName) {
                pageData.metaFileName = metaFileName;
              }
              res.render("index", pageData);
            },
            (err, p) => {
              dev.error(`Failed to get folder: ${err}`);
              pageData.noticeOfError = "failed_to_find_folder";
              res.render("index", pageData);
            }
          )
          .catch((err) => {
            dev.error("No folder found");
          });
      },
      (err) => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  async function exportFolderWithMedias(req, res) {
    let slugFolderName = req.param("slugFolderName");
    let type = req.param("type");

    let pageData = undefined;
    generatePageData(req)
      .then((_pageData) => (pageData = _pageData))
      .then(() => getChatsAndMediasAttachedToFolder({ slugFolderName }))
      .then((chatsdata) => {
        pageData.chatsAndMediaData = chatsdata;
      })
      .then(() =>
        // get medias for a folder
        file.getFolder({ type, slugFolderName: "123" })
      )
      .catch((err, p) => {
        dev.error(`Failed to get folder: ${err}`);
        pageData.noticeOfError = "failed_to_find_folder";
        res.render("index", pageData);
      })
      .then((foldersData) => {
        if (foldersData === undefined) {
          throw "Missing folder";
          return;
        }

        file
          .getMediaMetaNames({
            type,
            slugFolderName,
          })
          .then((list_metaFileName) => {
            let medias_list = list_metaFileName.map((_metaFileName) => {
              return {
                slugFolderName,
                metaFileName: _metaFileName,
              };
            });
            file
              .readMediaList({ type, medias_list })
              .then((folders_and_medias) => {
                let mediasData = folders_and_medias[slugFolderName].medias;
                if (
                  typeof req.query === "object" &&
                  Object.keys(req.query).length > 0
                ) {
                  Object.keys(mediasData).forEach((slugMediaName) => {
                    const media = mediasData[slugMediaName];

                    if (
                      req.query.hasOwnProperty("only_public") &&
                      req.query["only_public"] === "true"
                    ) {
                      if (
                        !media.hasOwnProperty("public") ||
                        media["public"] === false
                      ) {
                        delete mediasData[slugMediaName];
                      }
                    }
                  });
                }

                // recreate full object
                foldersData[slugFolderName].medias = mediasData;
                pageData.folderAndMediaData = foldersData;
                pageData.export_options = req.query;
                pageData.mode = "export_web";

                let socketid;
                if (
                  Object.keys(req.query).length > 0 &&
                  req.query.hasOwnProperty("socketid")
                ) {
                  socketid = req.query.socketid;
                }

                // sockets.notify({
                //   socketid,
                //   msg: `Creating a copy of this folder.`
                // });

                res.render("index", pageData, (err, html) => {
                  exporter
                    .copyFolderContent({
                      html,
                      folders_and_medias,
                      slugFolderName,
                      type: "folders",
                    })
                    .then(
                      (cachePath) => {
                        var archive = archiver("zip", {
                          zlib: { level: 0 }, //
                        });

                        archive.on("error", function (err) {
                          res.status(500).send({ error: err.message });
                          sockets.notify({
                            socketid,
                            not_localized_string: `Failed to create zip: ${err.message}`,
                          });
                        });

                        function formatBytes(a, b) {
                          if (0 == a) return "0 Bytes";
                          var c = 1024,
                            d = b || 2,
                            e = [
                              "Bytes",
                              "KB",
                              "MB",
                              "GB",
                              "TB",
                              "PB",
                              "EB",
                              "ZB",
                              "YB",
                            ],
                            f = Math.floor(Math.log(a) / Math.log(c));
                          return (
                            parseFloat((a / Math.pow(c, f)).toFixed(d)) +
                            " " +
                            e[f]
                          );
                        }

                        let is_finished = false;
                        let pbytes = 0;
                        let tbytes = false;

                        function informUserOfProgress() {
                          if (is_finished) return;
                          if (tbytes) {
                            sockets.notify({
                              socketid,
                              not_localized_string: `${formatBytes(
                                pbytes
                              )}/${formatBytes(tbytes)}`,
                            });
                          }
                          setTimeout(informUserOfProgress, 1000);
                        }

                        archive.on("progress", function (msg) {
                          pbytes = msg.fs.processedBytes;
                          tbytes = msg.fs.totalBytes;
                        });

                        //on stream closed we can end the request
                        archive.on("end", function () {
                          is_finished = true;
                          console.log(
                            "Archive wrote %d bytes",
                            archive.pointer()
                          );
                          sockets.notify({
                            socketid,
                            not_localized_string: `Archive finished, ${formatBytes(
                              archive.pointer()
                            )}`,
                          });
                        });

                        //set the archive name
                        res.attachment(slugFolderName + ".zip");

                        //this is the streaming magic
                        archive.pipe(res);
                        informUserOfProgress();

                        archive.directory(cachePath, false);

                        archive.finalize();
                      },
                      (err, p) => {
                        dev.error(
                          `Failed while preparing/making a web export: ${err}`
                        );
                      }
                    );
                });
              });
          });
      });
  }

  async function postFile(req, res) {
    let type = req.params.type;
    let slugFolderName = req.params.slugFolderName;

    const isSocketAllowed = await isSocketIDAuthorized({
      socketid: req.query.socketid,
      type,
      slugFolderName,
    }).catch((err) => {
      sockets.notify({
        socketid: req.query.socketid,
        localized_string: `action_not_allowed`,
        not_localized_string: err.message,
        type: "error",
      });
    });
    if (!isSocketAllowed) return false;

    importer
      .handleForm({ req, type, slugFolderName })
      .then(({ msg }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `imported_files_successfully`,
          type: "success",
        });
        res.end(JSON.stringify(msg));
      })
      .catch(({ err }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `action_not_allowed`,
          not_localized_string: err.message,
          type: "error",
        });
        res.end();
      });
  }

  async function isSocketIDAuthorized({ socketid, type, slugFolderName }) {
    let socket;

    if (!socketid) throw "Missing socketid in URL";

    try {
      socket = sockets.io().sockets.connected[socketid];
    } catch (error) {
      throw "Missing sockets server-side.";
    }

    const foldersData = await file.getFolder({ type, slugFolderName });
    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
        }))
    )
      throw "User can’t edit folder";

    return true;
  }

  async function getChatsAndMediasAttachedToFolder({ slugFolderName }) {
    const all_chats = await file.getFolder({ type: "chats", slugFolderName });
    if (!all_chats || typeof all_chats !== "object") return {};

    const chats_attached_to_folder = Object.values(all_chats).filter(
      (c) => c.attached_to_folder === slugFolderName
    );
    if (chats_attached_to_folder.length === 0) return {};

    const getChatsMedias = async ({ slugFolderName }) => {
      const list_metaFileName = await file.getMediaMetaNames({
        type: "chats",
        slugFolderName,
      });

      let medias_list = list_metaFileName.map((_metaFileName) => ({
        slugFolderName,
        metaFileName: _metaFileName,
      }));

      const folders_and_medias = await file.readMediaList({
        type: "chats",
        medias_list,
      });
      return folders_and_medias;
    };

    let chatsdata = {};
    for (const chat of chats_attached_to_folder) {
      const chats_medias = await getChatsMedias({
        slugFolderName: chat.slugFolderName,
      });
      if (
        typeof chats_medias === "object" &&
        Object.values(chats_medias).length &&
        Object.values(chats_medias)[0] &&
        Object.values(chats_medias)[0].medias
      ) {
        chat.medias = Object.values(chats_medias)[0].medias;
        chatsdata[chat.slugFolderName] = chat;
      }
    }
    return chatsdata;
  }
};
