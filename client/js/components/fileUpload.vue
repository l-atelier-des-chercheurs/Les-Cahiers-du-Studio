<template>
  <div class="dropzone">
    <Dropzone
      :id="uniqueDropzoneID"
      ref="dropzone"
      :url="uriToUploadMedia"
      v-on:vdropzone-success="showSuccess"
      v-on:vdropzone-sending="addMeta"
      :preview-template="template"
      :use-custom-dropzone-options=true
      :dropzone-options="customOptionsObject"
      :maxFileSizeInMB="1024"
      :maxNumberOfFiles="50"
    >
      <input type="hidden">
<!--
      <div class="dropzone_overlay" ref="dropzoneoverlay">
      </div>
-->
    </Dropzone>

  </div>
</template>
<script>
import Dropzone from 'vue2-dropzone';
import alertify from 'alertify.js';

export default {
  props: ['slugFolderName'],
  components: {
    Dropzone
  },
  data(){
    return {
      customOptionsObject: {
        language: {
          dictDefaultMessage : '+',
          dictCancelUpload : 'Annuler l’upload',
          dictRemoveFile: 'Masquer'
        }
      }
    }
  },
  computed: {
    uniqueDropzoneID: function() {
      return 'myVueDropzone_' + Math.ceil((Math.random() * 1000));
    },
    uriToUploadMedia: function() {
      return this.slugFolderName + '/file-upload';
    },
  },
  mounted: function() {
    document.addEventListener('dragover', this.enhanceDropzone);
    $(this.$refs.dropzoneoverlay)
      .on('dragleave', this.unenhanceDropzone)
      .on('drop', this.unenhanceDropzone)
      ;
  },
  destroyed: function() {
    document.removeEventListener('dragover', this.enhanceDropzone);
  },
  methods: {
    enhanceDropzone: function(evt) {
      $(this.$refs.dropzone.$el).addClass('is--bigger');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    },
    unenhanceDropzone: function(evt) {
      $(this.$refs.dropzone.$el).removeClass('is--bigger');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    },
    showSuccess: function (file) {
      alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log('Le fichier a été envoyé.')
        ;
    },
    addMeta: function (file, xhr, formData) {
      // Testing for 'function' is more specific and correct, but doesn't work with Safari 6.x
      if (typeof window.FileReader !== 'function' && typeof window.FileReader !== 'object') {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(`Reading files not supported in this browser. Additional Meta like creation date won’t be sent.`)
          ;
        return;
      }

      let fileCreationDate = file.lastModified;
      let fileName = file.name;
      let objToSend = {
        fileCreationDate
      }
      formData.append(fileName, JSON.stringify(objToSend));
    },
    'template':function() {
        return `
          <div class="dz-preview dz-file-preview">
              <div class="dz-image" style="width: 50px;height: 50px">
                  <img data-dz-thumbnail /></div>
              <div class="dz-details">
                <div class="dz-filename"><span data-dz-name></span></div>
                <div class="dz-size"><span data-dz-size></span></div>
              </div>
              <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
              <div class="dz-error-message"><span data-dz-errormessage></span></div>
              <div class="dz-success-mark"><i class="fa fa-check"></i></div>
              <div class="dz-error-mark"><i class="fa fa-close"></i></div>
          </div>
            `;
    }

  }
}
</script>
<style lang="sass">
.material-icons {
  display: none;
}

.dropzone.dropzone {
  pointer-events:none;
  background-color: transparent;
  min-height: 0;
  border: none;
  padding:0;
}

.vue-dropzone.vue-dropzone {
  font-family: inherit;

  width: 100vw;
  min-width: 150px;
  max-width: 300px;
  min-height: 100px;
  max-height: 40vh;

  margin:0;
  padding: 1em;
  padding-bottom: 2.5em;

  background-color: transparent;
  border: none !important;
  overflow-y: auto;

  transition: all .4s ease-out;

  &.is--bigger {
//     overflow: visible;
    .dz-message {
    }
  }

  &:hover {
    background-color: transparent;
  }

  .dropzone_overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index:10;
    pointer-events: none;
    background-color: #ea0028;
    opacity: 0;
  }
  &.is--bigger .dropzone_overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .dz-message {
    display: flex !important;
    align-items: center;
    justify-content: center;
    background-color: white;
    margin: 0 0 0 auto;
    margin-bottom: 1em;
    padding: 25px;
    padding-top: 28px;
    border: none;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    font-size: 50px;
    pointer-events: auto;
    z-index:100;

    background-color: #ea0028;
    color: white;
  }
  &.is--bigger .dz-message {
  }

  .dz-preview {
    width: 100%;
    min-height: 50px;
    color:  #000;
    background-color: #eee;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    padding: 0.5em;
    margin: 0;
    background-color: #fff !important;
    pointer-events: auto;

    + .dz-preview {
      border-top: 1px solid #eee;
    }

    &:hover .dz-image img {
      filter: unset;
      transform: none;
    }

    .dz-image {
      flex-shrink: 0;
    }

    .dz-details {
      position: relative;
      opacity: 1;
      height: auto;
      width: auto;
      min-width: 0;
      background-color: transparent;
      padding: 0 .5em;
      color: black;

      .dz-size {
          margin-bottom: 0;
          font-size: 1em;
      }
    }

    .dz-remove {
      opacity: 1;
      position: relative;
      padding: 0;
      font-family: inherit;
      text-transform: initial;
      color: black;
      border: none;
      font-weight: normal;
      bottom: 0;
      margin-left: auto;
      margin-right: 0;
    }
  }
}

.vue-dropzone {
/*
    .dz-preview {
        .dz-image {
            border-radius: 1;
            &:hover {
                img {
                    transform: none;
                    -webkit-filter: none;
                }
            }
        }
        .dz-details {
            bottom: 0;
            top: 0;
            color: white;
            background-color: rgba(33, 150, 243, 0.8);
            transition: opacity .2s linear;
            text-align: left;
            .dz-filename span, .dz-size span {
                background-color: transparent;
            }
            .dz-filename:not(:hover) span {
                border: none;
            }
            .dz-filename:hover span {
                background-color: transparent;
                border: none;
            }
        }
        .dz-progress .dz-upload {
            background: #cccccc;
        }
        .dz-remove {
            position: absolute;
            z-index: 30;
            color: white;
            margin-left: 15px;
            padding: 10px;
            top: inherit;
            bottom: 15px;
            border: 2px white solid;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 800;
            letter-spacing: 1.1px;
            opacity: 0;
        }
        &:hover {
            .dz-remove {
                opacity: 1;
            }
        }
        .dz-success-mark, .dz-error-mark {
            margin-left: auto !important;
            margin-top: auto !important;
            width: 100% !important;
            top: 35% !important;
            left: 0;
            i {
                color: white !important;
                font-size: 5rem !important;
            }
        }
    }
*/
}
</style>
