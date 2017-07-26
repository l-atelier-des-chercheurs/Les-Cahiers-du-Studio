
/***************************************************************************
                  Camera feed logic (from https://github.com/sarahgarcin/dodoc)
***************************************************************************/


var currentStream = (function() {
  // using https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
  // to select audio/video source
  var $videoPopover, $settingsPane, $settingsButton, videoElement, videoStream, audioStream, audioInputSelect, audioOutputSelect, videoSelect, selectors, videoResSwitches, recordVideoFeed, recordAudioFeed, userSelectedVideoDevice, userSelectedAudioDevice, userSelectedRes, currentFeedsSource;


  function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    var values = selectors.map(function(select) {
      return select.value;
    });
    selectors.forEach(function(select) {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });
    var previousVideoDeviceId = store.get(userSelectedVideoDevice);
    var previousAudioDeviceId = store.get(userSelectedAudioDevice);

    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      var deviceId = deviceInfo.deviceId;
      var option = document.createElement('option');
      option.value = deviceId;
      if( deviceId === previousVideoDeviceId || deviceId === previousAudioDeviceId) {
        option.selected = true;
      }
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
        audioInputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
        audioOutputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        videoSelect.appendChild(option);
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
    selectors.forEach(function(select, selectorIndex) {
      if (Array.prototype.slice.call(select.childNodes).some(function(n) {
        return n.value === values[selectorIndex];
      })) {
        select.value = values[selectorIndex];
      }
    });

  }

  function getVideoResFromRadio() {
    for (index=0; index < videoResSwitches.length; index++) {
      if (videoResSwitches[index].checked) {
        return videoResSwitches[index].dataset;
      }
    }
  }
  function setVideoResFromLocalstorage() {
    console.log( userSelectedRes);
    var getPreviousSessionRes = store.get(userSelectedRes);
    if(getPreviousSessionRes !== undefined) {
      for (index=0; index < videoResSwitches.length; index++) {
        if( getPreviousSessionRes.width === videoResSwitches[index].dataset.width && getPreviousSessionRes.height === videoResSwitches[index].dataset.height) {
          videoResSwitches[index].checked = true;
        } else {
          videoResSwitches[index].checked = false;
        }
      }
    }
  }

  // Attach audio output device to video element using device/sink ID.
  function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
      element.setSinkId(sinkId)
      .then(function() {
        console.log('Success, audio output device attached: ' + sinkId);
      })
      .catch(function(error) {
        var errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = 'You need to use HTTPS for selecting audio output ' +
              'device: ' + error;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
    } else {
      console.warn('Browser does not support output device selection.');
    }
  }

  function changeAudioDestination() {
    var audioDestination = audioOutputSelect.value;
    attachSinkId(videoElement, audioDestination);
  }

  function setSources() {

    console.log( 'setting new sources for audio and video feeds');
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;

    // set source in localstorage for next time
    store.set(userSelectedVideoDevice, videoSource);
    store.set(userSelectedAudioDevice, audioSource);

    var requestedVideoRes = getVideoResFromRadio();
    store.set(userSelectedRes, requestedVideoRes);

    currentFeedsSource = {
      audio: {
        optional: [ audioSource ? {sourceId: audioSource} : undefined ],
      },
      video: {
        optional: [ videoSource ? {sourceId: videoSource} : undefined],
        mandatory: {
          minWidth: requestedVideoRes.width,
          minHeight: requestedVideoRes.height
        }
      }
    };

    // restart the feed if the videoElement is playing
    if(!videoElement.paused) {
      currentStream.startCameraFeed();
    }
  }

  function getCameraFeed() {
    return new Promise(function(resolve, reject) {
      console.log( 'Getting camera feed');

      if( currentFeedsSource === undefined || currentFeedsSource.video === undefined) {
        reject('Camera not yet ready');
      }
      navigator.getUserMedia(
        {
          video: currentFeedsSource.video,
          audio: false
        },
        function (stream) {
          resolve( stream);
        },
        function(err) {
          alert( app.settings.lang.videoStreamCouldntBeStartedTryChangingRes + '\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  function getAudioFeed() {
    return new Promise(function(resolve, reject) {

      if( currentFeedsSource === undefined || currentFeedsSource.audio === undefined) {
        reject('audio devices not yet ready');
      }

      console.log( 'Getting audio feed');

      navigator.getUserMedia(
        {
          video: false,
          audio: currentFeedsSource.audio
        },
        function (stream) {
          resolve(stream);
        },
        function(err) {
          alert( dodoc.lang.audioStreamCouldntBeStarted + '\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  // déclaration des fonctions accessibles de l'extérieur ici
  return {

    init : function() {

      $videoPopover = $('.js--popover_cameraFeed');
      $settingsPane = $('.js--popover_cameraFeed_settingsPane');
      $settingsButton = $('.js--toggleCameraSettings');
      videoElement = document.querySelector('.js--videoFeed');
      audioInputSelect = document.querySelector('.js--audioSource');
      audioOutputSelect = document.querySelector('.js--audioOutput');
      videoSelect = document.querySelector('.js--videoSource');
      selectors = [audioInputSelect, audioOutputSelect, videoSelect];
      videoResSwitches = document.querySelector('.js--resolutionSelector').videoRes;
      userSelectedVideoDevice = 'selectedVideoDeviceId';
      userSelectedAudioDevice = 'selectedAudioDeviceId';
      userSelectedRes = 'selectedVideoRes';


      $settingsButton.click(function() {
        $(document).trigger('toggle_settings_pane');
      });

      $(document)
        .on( 'toggle_settings_pane', function() {
          // si le menu des réglages est masqué en bas de page
          if( $settingsPane.offset().top >= $(window).innerHeight() - 50) {

            $($videoPopover).animate(
              {scrollTop: $settingsPane.outerHeight()},
              600,
              $.easing.easeInOutQuint
            );
          } else {
            $($videoPopover).animate(
              {scrollTop: 0},
              600,
              $.easing.easeInOutQuint
            );          }

        })
        ;

      setVideoResFromLocalstorage();

      if( store.get(userSelectedVideoDevice) === undefined) {
        $(document).trigger('open_settings_pane');
      }

      return new Promise(function(resolve, reject) {
        navigator.mediaDevices.enumerateDevices()
          .then(function(deviceInfos) {
            gotDevices(deviceInfos);
            setSources();
            audioInputSelect.onchange = setSources;
            audioOutputSelect.onchange = changeAudioDestination;
            videoSelect.onchange = setSources;
            $(videoResSwitches).change(setSources);
            resolve();
          }, function(err) {
            reject('Failed to init stream : ' + err);
          });
      });
    },

    getVideoFrame : function() {
      return videoElement;
    },

    stopAllFeeds : function() {
      if( !videoElement.paused) {
        videoElement.pause();
      }

      if(videoStream) {
        videoStream.getTracks().forEach(function(track) {
          track.stop();
        });
      }
      if(audioStream) {
        audioStream.getTracks().forEach(function(track) {
          track.stop();
        });
      }
    },

    startCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        currentStream.stopAllFeeds();
        getCameraFeed()
          .then( function( stream) {
            videoStream = stream;
            if (navigator.mozGetUserMedia) {
              videoElement.mozSrcObject = stream;
            } else {
              var vendorURL = window.URL || window.webkitURL;
              videoElement.src = vendorURL.createObjectURL(stream);
            }
            videoElement.play();
            resolve();
          }, function(err) {
            console.log( ' failed to start camera feed: ' + err);
            reject('failed to start camera feed');
          });
      });
    },

    startRecordCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        getCameraFeed()
          .then( function( stream) {
            var requestedVideoRes = getVideoResFromRadio();
            recordVideoFeed = new RecordRTC(stream, {
              type: 'video',
              canvas: { width: requestedVideoRes.width, height: requestedVideoRes.height },
            });
            recordVideoFeed.startRecording();
            resolve();
          }, function(err) {
            console.log( ' failed to start camera feed: ' + err);
            reject();
          });

      });
    },

    stopRecordCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        if( recordVideoFeed !== undefined) {
          recordVideoFeed.stopRecording(function() {
            recordVideoFeed.getDataURL(function(videoDataURL) {
              resolve( videoDataURL);
            });
          });
        }
      });
    },

    getAudioStream : function() {
      return;
    },

    startAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        currentStream.stopAllFeeds();
        getAudioFeed()
          .then( function( stream) {
            audioStream = stream;
            resolve( stream);
          }, function() {
            console.log( ' failed to get audio feed');
            reject();
          })
          ;
      });
    },

    startRecordAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        getAudioFeed()
          .then( function( stream) {
            recordAudioFeed = new RecordRTC(stream, {
              type: 'audio'
            });
            recordAudioFeed.startRecording();
            resolve();
          }, function() {
            console.log( ' failed to start audio recording');
            reject();
          })
          ;
      });
    },

    stopRecordAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        if( recordAudioFeed !== undefined) {
          recordAudioFeed.stopRecording(function(url) {
            recordAudioFeed.getDataURL(function(audioDataURL) {
      //             type: recordVideo.getBlob().type || 'video/webm',
              // send instruction to record video
              resolve( audioDataURL);
            });
          });
        }
      });
    },
  };
})();
