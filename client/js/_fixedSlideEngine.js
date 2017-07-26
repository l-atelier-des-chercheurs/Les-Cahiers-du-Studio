var setFixedForSlides = (function() {


  // Detect request animation frame
  var scroll = window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               function(callback){ window.setTimeout(callback, 1000/60); };

  var isRunning = false;
  // this means 3 slides will stay pinned at once before the last one gets hidden
  var slideLifetime = 3;
  var slidesData = [];
  var $slides;

  function fixThisSlide(s) {
    if(!s.isFixed) {
      s.el.classList.add('is--pinned');
      s.isFixed = true;
      return true;
    }
    return false;
  }

  function unfixThisSlide(s) {
    if(s.isFixed) {
      s.el.classList.remove('is--pinned');
      s.isFixed = false;
      return true;
    }
    return false;
  }

  function farThisSlide(s) {
    if(!s.isFar) {
      s.el.classList.add('is--far');
      s.isFar = true;
    }
  }
  function unfarThisSlide(s) {
    if(s.isFar) {
      s.el.classList.remove('is--far');
      s.isFar = false;
    }
  }

  function getSlidesPositions() {
    for (i =0; i<$slides.length; i++){
      slidesData[i] = { el: $slides[i] };
      slidesData[i].bounds = slidesData[i].el.getBoundingClientRect();
      slidesData[i].bounds.offsetTop = slidesData[i].bounds.top + window.pageYOffset;
    }
  }

  var lastPosition = -1;

  function loop(){
    if (lastPosition === window.pageYOffset) {
        scroll(loop);
        return false;
    } else {

      var scrollSpeed = window.pageYOffset - lastPosition;
      lastPosition = window.pageYOffset;

      // position actuelle du scroll + vitesse actuelle = position anticipée à l'instant suivant
      var nextFrameScrollPos = window.pageYOffset + scrollSpeed;
      var slideUnderScrollPosIdx = slidesData.length;

      // trouver la première slide qui est au-dessous de la ligne de scroll
      for (i=0; i<slidesData.length; i++){
        if( slidesData[i].bounds.offsetTop > nextFrameScrollPos) {
          slideUnderScrollPosIdx = i;
          break;
        }
      }

      // pour toutes les slides, leur donner le bon statut en fonction de leur position avant/après slideUnderScrollPosIdx
      for (i=0; i<slidesData.length; i++){
        // si la slide est avant la limite
        if(i < slideUnderScrollPosIdx) {
          fixThisSlide(slidesData[i]);
          // si en plus elle est loin, la passer en far
          if(i < slideUnderScrollPosIdx-slideLifetime) {
            farThisSlide(slidesData[i]);
          // sinon, enlever le far (pour le scroll vers le haut
          } else {
            unfarThisSlide(slidesData[i]);
          }
        } else {
          // si elle est à l'index ou après
          unfixThisSlide(slidesData[i]);
          unfarThisSlide(slidesData[i]);
        }
      }

      if(isRunning) {
        scroll(loop);
      }
    }

  }

  return {
    init : function($s) {
      if($s === undefined) {
        return;
      }
      $slides = $s;
      getSlidesPositions();
      isRunning = true;
      loop();
    },
    stop : function() {
      isRunning = false;
    },
    update: function($slides) {
      if(isRunning) {
        getSlidesPositions();
        // force update of fixed elements
        lastPosition = window.pageYOffset - 10;
      }
    },
  };
})();
