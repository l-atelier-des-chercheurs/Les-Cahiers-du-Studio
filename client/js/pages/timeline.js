

/***************************************************************************
                  Conf logic
***************************************************************************/

/* VARIABLES */
var socket = io.connect();
var zIndex = 0;
var $allSlides = $();

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

function onSocketConnect() {
  sessionId = socket.io.engine.id;
  console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
  console.log('Unable to connect to server', reason);
};

// socket.on('listAllSlides', onListAllSlides);

// listTimelines



/***


***/

var resizeTimer;
$(window).on('resize', function(e) {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    console.log('event: resize end');
    // resize timeout
  }, 250);
});

function init(){
  // lister les médias
}


/***************************************************************************
                  UPLOAD FORM
***************************************************************************/

function uploadFormData(formData) {

  var $popoverUpload = $('.js--popover_upload');
  $popoverUpload.addClass('is--open');

  $.ajax({
    url: './file-upload',
    type: 'POST',
    data: formData,
    datatype: 'json', // expecting JSON to be returned
    processData: false,
    contentType: false,
    success: function(data){
      console.log('upload successful!\n' + data);
    },
    xhr: function() {
      // create an XMLHttpRequest
      var xhr = new XMLHttpRequest();

      // listen to the 'progress' event
      xhr.upload.addEventListener('progress', function(evt) {
        if (evt.lengthComputable) {
          // calculate the percentage of upload completed
          var percentComplete = evt.loaded / evt.total;
          percentComplete = parseInt(percentComplete * 100);

          // update the Bootstrap progress bar with the new percentage
          $popoverUpload.find('.progress-bar').text(percentComplete + '%');
          $popoverUpload.find('.progress-bar').width(percentComplete + '%');
        }
      }, false);
      return xhr;
    }
  });

}

