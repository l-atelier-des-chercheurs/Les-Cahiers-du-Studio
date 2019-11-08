// var share = require('./sharedb-server');
// var ShareDB_logger = require('sharedb-logger');
var ShareDB = require('sharedb');
ShareDB.types.register(require('rich-text').type);

const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const uuid = require('uuid');
const url = require('url');

const dev = require('./dev-log'),
  file = require('./file');

module.exports = function(server) {
  dev.log(`server-realtime_text_collaboration • init`);
  // Share DB
  const backend = new ShareDB();
  const connection = backend.connect();
  // var sharedb_logger = new ShareDB_logger(backend);

  backend.use('connect', (req, next) => {
    dev.logfunction(`server-realtime_text_collaboration • sharedb: connect`);
    next();
  });

  backend.use('op', (req, next) => {
    dev.logfunction(`server-realtime_text_collaboration • sharedb: op`);
    next();
  });

  backend.use('readSnapshots', (req, next) => {
    dev.logfunction(
      `server-realtime_text_collaboration • sharedb: readSnapshots`
    );
    // Create the document if it hasn't been already

    const collection = req.collection;
    const query = req.snapshots[0].id || 'default';

    dev.logverbose(
      `server-realtime_text_collaboration • sharedb: readSnapshots / getting doc for ${collection} and query ${query}`
    );

    next();
  });

  backend.use('afterSubmit', (req, next) => {
    dev.logverbose(`server-realtime_text_collaboration • sharedb: afterSubmit`);
    // const snapshots = req.backend.db.docs[req.collection][req.id];
    // connection.fetchSnapshot(req.collection, req.id, (err, snapshot) => {
    //   const html_render = quillRender(snapshot.data.ops);
    //   console.log(html_render);
    // });
    // dev.logverbose(`-> snapshot = ${JSON.stringify(snapshot_as_delta)}`);
    next();
  });

  dev.log(`server-realtime_text_collaboration • ws init`);
  const sharewss = new WebSocket.Server({ noServer: true });
  sharewss.on('connection', (client, req) => {
    dev.logfunction(
      `server-realtime_text_collaboration • sharewss new client connection`
    );

    client.id = uuid();
    client.isAlive = true;

    // "?type=projects&slugFolderName=publi&metaFileName=text-20181228_122605-shl.md.txt"
    // const requested_querystring = req.url.substring(8);
    // const requested_textmedia_infos = new url.URLSearchParams(
    //   requested_querystring
    // );
    // const textmedia_infos = {
    //   type: requested_textmedia_infos.get('type'),
    //   slugFolderName: requested_textmedia_infos.get('slugFolderName'),
    //   metaFileName: requested_textmedia_infos.get('metaFileName'),
    //   field: requested_textmedia_infos.get('field')
    // };

    // dev.logverbose(
    //   `server-realtime_text_collaboration • sharewss: a new client ${client.id} connected with querystring ${requested_querystring}`
    // );

    // if (!!textmedia_infos.metaFileName) {
    //   // get content
    //   const sharedoc = connection.get('field', requested_querystring);

    //   if (sharedoc.data == null) {
    //     dev.logverbose(
    //       `server-realtime_text_collaboration • sharedb: wss connection / no doc`
    //     );
    //     sharedoc.create('<p>Plop</p>', 'rich-text');
    //   }
    // } else if (!!textmedia_infos.field) {
    //   const sharedoc = connection.get('textMedias', requested_querystring);
    //   if (sharedoc.data == null) {
    //     dev.logverbose(
    //       `server-realtime_text_collaboration • sharedb: wss connection / no doc`
    //     );
    //     sharedoc.create('<p>Plip</p>', 'rich-text');
    //   }
    // }

    // dev.logverbose(
    //   `—> requested textMedias ${JSON.stringify(textmedia_infos, null, 4)}`
    // );

    // if (sharedoc.data == null) {
    //   // parse requested_resource from search params
    //   file
    //     .readMediaList({
    //       type: textmedia_infos.type,
    //       medias_list: [
    //         {
    //           slugFolderName: textmedia_infos.slugFolderName,
    //           metaFileName: textmedia_infos.metaFileName
    //         }
    //       ]
    //     })
    //     .then(mediaData => {
    //       dev.logverbose(
    //         `server-realtime_text_collaboration • sharewss: got base text media`
    //       );

    //       const text_content = Object.values(
    //         Object.values(mediaData)[0].medias
    //       )[0].content;
    //       let rendered_text = quillRender([{ insert: text_content }]);

    //       dev.logverbose(
    //         `server-realtime_text_collaboration • sharewss: now inserting = ${rendered_text}`
    //       );

    //       // and add this parsed content to that doc
    //       sharedoc.create(rendered_text, 'rich-text', function(err) {
    //         if (err) return dev.error(err);

    //         dev.logverbose(
    //           `server-realtime_text_collaboration • sharewss: doc created`
    //         );

    //         var stream = new WebSocketJSONStream(ws);
    //         share.listen(stream);

    //         sharedoc.on('op', ops => {
    //           dev.logverbose(
    //             `server-realtime_text_collaboration • sharewss: new op for requested_querystring = ${requested_querystring}`
    //           );
    //         });
    //       });
    //     });
    // }

    backend.listen(new WebSocketJSONStream(client));

    client.on('message', function(data, flags) {
      dev.logverbose(
        `server-realtime_text_collaboration • sharewss: message for ${client.id}`
      );
    });

    client.on('pong', function(data, flags) {
      // dev.logverbose(
      //   `server-realtime_text_collaboration • sharewss: pong received for ${client.id}`
      // );
      client.isAlive = true;
    });

    client.on('message', function() {});

    client.on('error', function(error) {
      dev.error(
        `server-realtime_text_collaboration • sharewss: client connection errored for ${client.id} with error = ${error}`
      );
    });
  });

  server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/sharedb') {
      sharewss.handleUpgrade(request, socket, head, function done(ws) {
        sharewss.emit('connection', ws, request);
      });
    }
  });

  setInterval(function() {
    sharewss.clients.forEach(function(client) {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.ping();
      // dev.logverbose(
      //   `server-realtime_text_collaboration • sharewss: ping sent for ${client.id}`
      // );
    });
  }, 5000);

  // // Sockets Ping, Keep Alive
};
