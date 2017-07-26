

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


socket.on('listAllSlides', onListAllSlides);
socket.on('updateOneSlide', onUpdateOneSlide);




/***
  ---
***/

jQuery(document).ready(function($) {
  init();
});

var resizeTimer;

$(window).on('resize', function(e) {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    console.log('event: resize end');
    repositionSlides($('.slides-list .slide'));
  }, 250);
});

function init(){

  socket.emit('listSlides', { "slugConfName" : app.slugConfName});
  setDragEvents();
  setWebcamEvents();

  window.slideSize = { "width" : window.innerHeight, "height" : window.innerHeight * 0.5625 };

}


function setWebcamEvents() {
  currentStream.init();
  $('.js--openCloseCamera').on('click', function() {
    toggleWebcamPopover();
  });

  document.body.onkeydown = function(e){
    if(e.keyCode === 32){
      toggleWebcamPopover();
      e.preventDefault();
      return false;
    }
  }
}

function toggleWebcamPopover() {
  $('.js--popover_cameraFeed').toggleClass('is--open');

  if( $('.js--popover_cameraFeed').hasClass('is--open')) {
    $('body').addClass('is--unscrollable');
    currentStream.startCameraFeed();
  } else {
    $('body').removeClass('is--unscrollable');
    currentStream.stopAllFeeds();
  }
}

function setDragEvents() {

  $(window).on('dragover',function(e){
    $(".drop-files-container").addClass('is--visible');
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  $(".drop-files-container").on("drop", function(e) {
    e.preventDefault();
    $(".drop-files-container").removeClass('is--visible');

    // code adapted from https://coligo.io/building-ajax-file-uploader-with-node/
    if( e.originalEvent.dataTransfer.files.length >= 0) {
      var files = e.originalEvent.dataTransfer.files;
      var formData = new FormData();
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        // add the files to formData object for the data payload
        formData.append('uploads[]', file, file.name);
      }
      uploadFormData(formData);
    }
    if(typeof e.originalEvent.dataTransfer.getData('text') === 'string' && e.originalEvent.dataTransfer.getData('text').length > 0) {
      var formData = new FormData();
      formData.append('iframe[]', e.originalEvent.dataTransfer.getData('text'));
      uploadFormData(formData);
    }
  })
  .on('dragleave',function(e){
    $(".drop-files-container").removeClass('is--visible');
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

}


// executed on page load or media update (with diff checking)
function onListAllSlides(d) {
  console.log('Listing all slides');

  // create slides for dom
  var $allNewSlides = $();
  d.forEach(function(s) {
    $allNewSlides = $allNewSlides.add(listOneSlide(s));
  });

  // adding new slides to dom
  var firstSlidePosY;
  $allNewSlides.each(function(i) {
    var $mediaItem = $(this);
    $('.slides-list').append($mediaItem);
    initInteractForSlide({
      'slide' : $mediaItem.find('.js--interactevents')[0],
      'preserveRatio' : $mediaItem.data('preserveRatio')
    });
    if(i === 0) {
      firstSlidePosY = $mediaItem.offset().top;
    }
  });

  // init all slides content position according to their own data
  $allNewSlides.each(function(i) {
    updateSlideContentPosition($(this));
  });

  // init all slides position and scroll effect
  $allSlides = $('.slides-list .slide');
  setFixedForSlides.init($allSlides);

  // if we just sent a few medias/websites
  if( $('.js--popover_upload').hasClass('is--open')){
    $('.js--popover_upload').removeClass('is--open');
    $('html,body').animate(
      {scrollTop: firstSlidePosY},
      900,
      $.easing.easeInOutQuint
    );
  }
}


function onUpdateOneSlide(d) {

  // find the slide in
  var $thisSlide = $allSlides.filter(function() {
    return $(this).data('name') === d.name;
  });

  $thisSlide.data(d);

  updateSlideContentPosition( $thisSlide);
}



function repositionSlides($s) {
  $s.each(function(i) {
    updateSlideContentPosition($(this));
  });
  setFixedForSlides.update();
}

function listOneSlide(d) {
  console.log('Listing one slide');

  // Check if it has a name (ie. a media name associated with a metaName
  // Missing medias only have a metaName like 1-mymedia
  if(d.name === undefined) {
    popup.displayMessage('Le média suivant n’a pas été trouvé&nbsp;: <br><strong>' + d.metaName + '</strong>');
    return;
  }

  var ext = d.name.split('.').pop();
  var isUrl = false;
  if(d.name.toLowerCase().indexOf('http://') !== -1 || d.name.toLowerCase().indexOf('https://') !== -1) {
      isUrl = true;
  }
  var mediaItem;
  d.preserveRatio = true;

  var $existingSlide = $('.slides-list .slide').filter(function() {
    return $(this).attr('data-filename') === d.metaName;
  });
  if( $existingSlide.length > 0) {
    console.log('Slide already exists');
    return;
  }

  if( isUrl ) {
    mediaItem = $(".js--templates > .js--iframeSlide").clone(false);
    mediaItem
      .find( 'iframe')
        .attr('data-src', d.name)
      .end()
      .find('.pageUrl')
        .text(d.name)
      .end()
      .find('.js--startIframe')
        .on('click', function() {
            var ifr = mediaItem.find('iframe');
            if(ifr.attr('src') === undefined) {
              ifr.attr('src', ifr.attr('data-src'));
              $(this).addClass('is--active');
              mediaItem.find('.slide--item_iframe').addClass('is--iframeOn');
            } else {
              ifr.removeAttr('src');
              $(this).removeClass('is--active');
              mediaItem.find('.slide--item_iframe').removeClass('is--iframeOn');
            }
        })
      .end()
      .find('.js--openInBrowser')
        .attr('href', d.name)
      .end()
      ;
    d.preserveRatio = false;
  }

  else if(ext == 'jpg' || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "JPG" || ext == "tiff"){
    mediaItem = $(".js--templates > .js--imageSlide").clone(false);
    mediaItem
      .find( 'img')
        .attr('src', d.name)
      .end()
  }

  else if(ext == 'mp4' || ext == "avi" || ext == "ogg" || ext == "webm"){
    mediaItem = $(".js--templates > .js--videoSlide").clone(false);
    mediaItem
      .find('source')
        .attr('src', d.name)
      .end()
    if(d.poster !== undefined)
      mediaItem
        .find('video')
          .attr('poster', d.poster)
          .attr('preload', 'none')
        .end()
        ;
  }
  // if extension is some unknown format, let's bail out
  else{
    return;
  }

  mediaItem
    .attr('data-fileName', d.metaName)
    .data(d)
    ;
  return mediaItem;
}


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
//         $popoverUpload.html('Upload et rechargement de la conférence…');
      // let's wait a bit that the media has been added before we ask for a refreshed list of medias
      setTimeout(function() { socket.emit('listSlides', { "slugConfName" : app.slugConfName}); }, 500)
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

/***************************************************************************
                  Slide content position and size logic
***************************************************************************/

function updateSlideContentPosition($s) {

  var d = $s.data();

  var dwidth = parseFloat(d.width);
  var dratio = parseFloat(d.ratio);
  var dheight = parseFloat(d.height);
  var dposX = parseFloat(d.posX);
  var dposY = parseFloat(d.posY);

  var pxWidth = dwidth * window.innerWidth;

  var pxHeight;
  if(isNaN(dheight))
    pxHeight = pxWidth * dratio;
  else {
    pxHeight = dheight * 0.5625 * window.innerWidth;
  }
  var posX = dposX * window.innerWidth;
  var posY = dposY * window.innerHeight;

  return $s
    .attr('data-fileName', d.metaName)
    .find('.slide--item')
        .css({
          'transform': 'translate(' + parseInt(posX) + 'px, ' + parseInt(posY) + 'px)',
          'width': parseInt(pxWidth),
          'height': parseInt(pxHeight),
          'display':'block'
        })
        .attr('data-x', parseInt(posX))
        .attr('data-y', parseInt(posY))
    .end()
    ;


}




/***************************************************************************
                  Interactjs logic (dragging slides objects, etc.)
***************************************************************************/

function initInteractForSlide(s) {
  // target elements with the "draggable" class
  interact(s.slide)
    .draggable({
      inertia: true,
      snap: {
/*
        targets: [
          interact.createSnapGrid({ x: 30, y: 30 })
        ],
        range: Infinity,
        relativePoints: [ { x: 0, y: 0 } ]
*/
      },
      // keep the element within the area of it's parent
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: true, left: false, bottom: false, right: true }
      },

      // call this function on every dragmove event
      onmove: function(event) {
        $(s.slide.parentElement).addClass('is--dragged');
        var x = (parseFloat(s.slide.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(s.slide.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        s.slide.style.webkitTransform =
        s.slide.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        s.slide.setAttribute('data-x', x);
        s.slide.setAttribute('data-y', y);
      },
      // call this function on every dragend event
      onend: function (event) {
        $(s.slide.parentElement).removeClass('is--dragged');
        updateMediaPosition();
      },
    })
    .resizable({
      preserveAspectRatio: s.preserveRatio,
      edges: { left: true, right: true, bottom: true, top: true },
      restrict: {
          restriction: {
          },
      },
    })
    .on('resizemove', function (event) {
      $(s.slide.parentElement).addClass('is--resized');
      var x = (parseFloat(s.slide.getAttribute('data-x')) || 0),
          y = (parseFloat(s.slide.getAttribute('data-y')) || 0);

      // update the element's style
      var rectWidth = event.rect.width > 100 ? event.rect.width : 100;
      var rectHeight = event.rect.height > 100 ? event.rect.height : 100;

      s.slide.style.width  = rectWidth + 'px';
      s.slide.style.height = rectHeight + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      s.slide.style.webkitTransform = s.slide.style.transform =
          'translate(' + x + 'px,' + y + 'px)';

      s.slide.setAttribute('data-x', x);
      s.slide.setAttribute('data-y', y);
//       s.slide.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
    })
    .on('resizeend', function (event) {
      $(s.slide.parentElement).removeClass('is--resized');
      updateMediaSize();
      updateMediaPosition();
    })
    .on('doubletap', function() {
      var baseWidth = app.settings.startingWidth * window.innerWidth;
      s.slide.style.width  = baseWidth + 'px';
      updateMediaSize();
    })
    ;


  function updateMediaPosition() {
    var x = (parseFloat(s.slide.getAttribute('data-x')) || 0),
        y = (parseFloat(s.slide.getAttribute('data-y')) || 0);

    var relativeX = x / window.innerWidth;
    var relativeY = y / window.innerHeight;

    var mediaPos = {
      'mediaName' : s.slide.parentElement.getAttribute('data-filename'),
      'slugConfName' : app.slugConfName,
      'posX' : relativeX,
      'posY' : relativeY
    }
    socket.emit('mediaNewPos', mediaPos);
  }

  function updateMediaSize() {
    var w = s.slide.offsetWidth;
    var h = s.slide.offsetHeight;
    var relativeW = w / s.slide.parentElement.offsetWidth;
    var relativeH = h / s.slide.parentElement.offsetHeight;
    var mediaSize = {
      'mediaName' : s.slide.parentElement.getAttribute('data-filename'),
      'slugConfName' : app.slugConfName,
      'width' : relativeW,
    }
    // ajouter la height si pas de ratio
    if(!s.preserveRatio)
      mediaSize.height = relativeH;

    socket.emit('mediaNewSize', mediaSize);
    return;
  }
}



