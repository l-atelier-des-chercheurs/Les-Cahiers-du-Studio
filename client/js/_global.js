// context vars sent by Node via router.js to footer.jade namespaced with app
// var currentFolder = app.currentFolder;

// utils fct globals

var popup = (function() {
  var $popup;

  function setCloseButton($popupTextDiv) {
    $popupTextDiv
      .find('.js--closePopup')
        .on('click', function() {
          $(this)
            .closest('.js--textContent')
              .fadeOut(300, function() { $(this).remove(); })
            .end()
            ;
        })
      .end()
      ;
  }

  function createNewMessage(msg) {
    var $popupTextDiv = $('<div class="module--popup--textContent js--textContent"><p>' + msg + '</p><button class="module--popup--closePopup js--closePopup">x</button></div>');

    $popup
      .append($popupTextDiv)
      .show()
      ;
    setCloseButton($popupTextDiv);
  }

  return {
    init : function($p) {
      console.log('-- popup : init');
      if($p.length !== 1) { return; }
      $popup = $p;
    },
    displayMessage : function(msg) {
      console.log('-- popup : showing new popup msg');
      createNewMessage(msg);
    },
  };

})();

popup.init($('.js--popup'));

$.extend($.easing,
{
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) { return c/2*t*t*t*t*t + b; }
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});


$('body').on('click', '.js--openInBrowser', function() {
  if(require('electron') !== undefined) {
    var shell = require('electron').shell;
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});
