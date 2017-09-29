<template>
  <div>
    <div class="m_addMedia">
      <button type="button" class="button margin-bottom-small button_addText" @click="addText">
        Ajouter du texte
      </button>
      <button type="button" class="button margin-bottom-small button_addMarker" @click="addMarker">
        Ajouter un marqueur
      </button>

      <FileUpload
        :slugFolderName="slugFolderName">
      </FileUpload>
    </div>

  </div>
</template>
<script>
import FileUpload from './FileUpload.vue';

export default {
  props: ['slugFolderName'],
  components: {
    FileUpload
  },
  mounted: function() {
    document.addEventListener('keyup', this.boitierPressed);
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.boitierPressed);
  },
  methods: {
    addText() {
      this.$root.createTextMedia({
        slugFolderName: this.slugFolderName,
        type: 'text'
      });
      window.dispatchEvent( new Event('timeline.scrolltoend') );
    },
    addMarker() {
      this.$root.createTextMedia({
        slugFolderName: this.slugFolderName,
        type: 'marker',
        color: 'red',
        collapsed: true
      });
      window.dispatchEvent( new Event('timeline.scrolltoend') );
    },
    boitierPressed(e) {
      // if there is a modal opened, let’s not do something
      if(this.$root.settings.has_modal_opened === true) {
        return;
      }

      var key = e.key;

      if( key === 'w' || key === 'z') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'blue',
          collapsed: true
        });
        window.dispatchEvent( new Event('timeline.scrolltoend') );
      } else
      if( key === 's') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'red',
          collapsed: true
        });
        window.dispatchEvent( new Event('timeline.scrolltoend') );
      } else
      if( key === 'a' || key === 'q') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'green',
          collapsed: true
        });
        window.dispatchEvent( new Event('timeline.scrolltoend') );
      }
    },
  }
}
</script>
<style>

</style>