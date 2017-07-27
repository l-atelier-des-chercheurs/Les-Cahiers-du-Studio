<template>


</template>

<script>

/*
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
*/

export default {
  name: 'roomSize'






}
</script>

<style>
</style>