// set lang here
var lang = 'fr';



// localize strings
if( lang === 'fr') {
  var localize = {
    "lang" : {
      "chooseCameraResolution" : "Résolution de votre&nbsp;caméra&nbsp;:",
      "audioInputSource" : "Source audio&nbsp;:",
      "audioOutputDestination" : "Destination audio&nbsp;:",
      "videoInputSource" : "Source video&nbsp;:",

      "videoStreamCouldntBeStartedTryChangingRes" : "Le flux vidéo n’a pas pu être démarré.\nEssayez de modifier la résolution dans le panneau de droite.",
      "audioStreamCouldntBeStarted" : "Le flux audio n’a pas pu être démarré.",

      "settings" : "Règlages",

      "openCamera" : "Camera",
      "closeCamera" : "Fermer"
    }
  };
} else if( lang === 'en') {
  var localize = {
    "lang" : {
      "chooseCameraResolution" : "Choose camera's resolution:",
      "audioInputSource" : "audio source:",
      "audioOutputDestination" : "audio output:",
      "videoInputSource" : "video source:",

      "settings" : "Settings",

      "openCamera" : "Camera",
      "closeCamera" : "Close"
    }
  };
}

var settings = {

  "codelang" : lang,
  "contentDirname" : "user",
  "metaFileext" : ".txt",
  "confMetafilename" : "meta",

  "metaDateFormat" : "YYYYMMDD_HHmmss",
  "textEncoding" : "UTF-8",
  "textFieldSeparator" : "\n\n----\n\n",
  "deletedPrefix" : "x_",
  "thumbSuffix" : "_thumb",

  "mediaThumbWidth" : 320,
  "mediaThumbHeight" : 240,

  "startingPosX" : 0,
  "startingPosY" : 0,
  "startingWidth" : .50,

  "_comment" : "// see http://regexr.com/3d4t8",
  "regexpMatchFolderNames" : "^([^.]+)$",
  "regexpMatchProjectPreviewNames" : "^(apercu|preview)",
  "regexpGetFileExtension" : "\\.[^.]*$",
  "regexpRemoveFileExtension" : "(.+?)(\\.[^.]*$|$)"

};

// should work in ES6
var settings = Object.assign( localize, settings);

try {
  module.exports = settings;
} catch( err) {

}