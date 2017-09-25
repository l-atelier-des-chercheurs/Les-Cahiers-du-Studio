<template>
  <div>
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
      class="dropzone margin-right-small margin-bottom-small"
    >
      <input type="hidden">
    </Dropzone>

    <div class="dropzone_overlay">
    </div>
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
          dictDefaultMessage : 'Envoyer un média',
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
  created: function() {
    document.addEventListener('dragover', this.enhanceDropzone);
    document.addEventListener('dragleave', this.unenhanceDropzone);
  },
  destroyed: function() {
    document.removeEventListener('dragover', this.enhanceDropzone);
    document.removeEventListener('dragleave', this.unenhanceDropzone);
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
                <div class="dz-size"><span data-dz-size></span></div>
                <div class="dz-filename"><span data-dz-name></span></div>
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



.vue-dropzone.vue-dropzone {
  width: 100vw;
  font-family: inherit;

  min-width: 150px;
  max-width: 300px;
  min-height: 100px;
  max-height: 250px;

  margin:0;
  padding: 1em;

  overflow-y: scroll;

  transition: all .4s ease-out;

  &.is--bigger {
    max-width: 50vw;
    max-height:50vh;
  }

  .dz-message {
    display: block !important;
    border: 3px dashed #89898c;
    margin: 0px 0;
    padding: 25px;
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
    margin: 0.5em 0;
    background-color: fade-out(#89898c, 0.80) !important;

    .dz-details {
        position: relative;
        opacity: 1;
        height: auto;
        width: auto;
        min-width: 0;
        background-color: transparent;
        padding: 0;
        color: black;


      .dz-size {
          margin-bottom: 0;
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
