<template>
  <div class="m_addMedias">
    <button
      type="button"
      class="button button-round button-round-small margin-bottom-small bg-noir c-blanc button_addText"
      @click="createTextMedia"
      :disabled="read_only"
    >
      T
    </button>
    <button
      type="button"
      class="button button-round button-round-small margin-bottom-small bg-noir c-blanc button_addMarker"
      @click="createMarkerMedia"
      :disabled="read_only"
    >
      •
    </button>

    <div ref="input_file_fields" v-for="field in input_file_fields" :key="field.value">
      <label :for="`add_${field.key}`">
        {{ field.label }}
      </label>
      <input 
        type="file" 
        multiple 
        :id="`add_${field.key}`" 
        :name="field.key" 
        @change="updateInputFiles($event)"
        :accept="field.accept"
        :capture="field.capture"
      >
    </div>

    <UploadFile
      v-if="selected_files.length > 0"
      @close="selected_files = []"
      :read_only="read_only"
      :slugFolderName="slugFolderName"
      :type="'folders'"
      :selected_files="selected_files"
    />

  </div>
</template>
<script>
import UploadFile from './modals/UploadFile.vue';

export default {
  props: {
    slugFolderName: String,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    UploadFile
  },
  data() {
    return {
      showImportModal: false,

      selected_files: [],
      
      input_file_fields: [
        {
          key: 'files',
          label: 'Files',
          accept: '',
          capture: false
        },
        {
          key: 'images',
          label: 'Images',
          accept: 'image/*',
          capture: true
        },
        {
          key: 'videos',
          label: 'Vidéos',
          accept: 'video/*',
          capture: true
        },
        {
          key: 'audios',
          label: 'Audios',
          accept: 'audio/*',
          capture: true
        }
      ]
    };
  },
  mounted: function() {
    document.addEventListener('keyup', this.boitierPressed);
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.boitierPressed);
  },
  watch: {
    file: function() {}
  },
  methods: {
    createTextMedia() {
      if (window.state.dev_mode === 'debug') {
        console.log('METHODS • AddMediaButton: createTextMedia');
      }
      this.$eventHub.$on('socketio.media_created_or_updated', this.newTextMediaCreated);
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: 'folders',
        additionalMeta: {
          type: 'text'
        }
      });
      // TODO : scroll to current date
      // this.$eventHub.$emit('timeline.scrollToToday');
    },
    newTextMediaCreated(mdata) {
      if (this.$root.justCreatedMediaID === mdata.id) {
        this.$eventHub.$off('socketio.media_created_or_updated', this.newTextMediaCreated);
        this.$root.justCreatedMediaID = false;
        this.$nextTick(() => {
          this.$eventHub.$emit('timeline.openMediaModal', mdata.metaFileName);
        });
      }
    },
    createMarkerMedia() {
      if (window.state.dev_mode === 'debug') {
        console.log('METHODS • AddMediaButton: createMarkerMedia');
      }
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: 'folders',
        additionalMeta: {
          type: 'marker',
          color: 'red',
          collapsed: true
        }
      });
      // TODO aswell
      // this.$eventHub.$emit('timeline.scrollToToday');
    },
    boitierPressed(event) {
      if (window.state.dev_mode === 'debug') {
        console.log('METHODS • AddMediaButton: boitierPressed');
      }
      
      // if there is a modal opened, let’s not do something
      if (this.$root.settings.has_modal_opened === true) {
        return;
      }

      if (event.target.tagName.toLowerCase() === 'input' 
        || event.target.tagName.toLowerCase() === 'textarea'
        || event.target.className.includes('ql-editor')
      ) {
        return;
      }  

      var key = event.key;

      this.$root.settings.keyboard_shortcuts.forEach((k) => {
        if(k.key === key && k.marker_color !== '') {
          this.$root.createTextMedia({
            slugFolderName: this.slugFolderName,
            type: 'folders',
            additionalMeta: {
              type: 'marker',
              color: k.marker_color,
              collapsed: true
            }
          });
          this.$eventHub.$emit('timeline.scrollToToday');
        }
      });
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • UploadFile / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files); 
      $event.target.type = '';
      $event.target.type = 'file';

    }
  }
};
</script>
<style lang="less" scoped>
.m_addMedias {
  position: fixed;
  bottom: 0;
  right: 0;

  width: 200px;
  height: 400px;

  background-color: rgba(255,255,255,.7);
  // color: var(--color-blanc);



}
</style>