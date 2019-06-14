<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
  >
    <template slot="header">
      <span class="text-cap"> {{ $t('writeup') }}</span>
    </template>
    <template slot="preview">
      <div class="padding-sides-small">
        <table class="">
          <thead>
            <tr>
              <th style="">
                {{ $t('name') }}
              </th>
              <th>
                {{ $t('action') }}
              </th>
              <th></th>
            </tr>
          </thead>
          <transition-group
            tag="tbody"
            name="list-complete"
          >
            <tr v-for="w in writeup_medias" :key="w.metaFileName">
              <td>
                {{ w.name }}
              </td>
              <td>
                <button type="button" class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent" @click="openWriteupMedia(w.metaFileName)">
                  {{ $t('open') }}
                </button>
              </td>  
            </tr>          
            <tr :key="'create'">
              <td>
                <input type="text" class="input-xs" ref="nameInput">
              </td>
              <td>
                <button type="button" class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent" 
                  @click="createWriteupMedia"
                >
                  {{ $t('create') }}
                </button>
              </td>
            </tr>
          </transition-group>
        </table>
      </div>

      <!-- <div class="input-group">
        <span class="input-addon input-addon-xs">
          {{ $t('name') }}
        </span>
        <input type="text" class="input-xs" ref="nameInput">
        <button 
          type="button" 
          class="button input-addon-xs" 
          @click="createWriteupMedia"
        >
          {{ $t('create') }}
        </button>
      </div> -->

      <CollaborativeEditor 
        v-if="current_writeup_media_metaFileName"
        v-model="writeupContent"
        :media_metaFileName="current_writeup_media_metaFileName"
        :slugFolderName="slugFolderName"
        :enable_collaboration="true"
        ref="textField"
      />
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import CollaborativeEditor from '../subcomponents/CollaborativeEditor.vue'

export default {
  props: {
    slugFolderName: String,
    medias: Object
  },
  components: {
    Modal,
    CollaborativeEditor
  },
  data() {
    return {
      writeupContent: '',
      current_writeup_media_metaFileName: false
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    'writeupContent': function() {
    }
  },
  computed: {
    writeup_medias() {
      return Object.values(this.medias).filter(m => m.type === "writeup")
    }
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    createWriteupMedia() {
      if (window.state.dev_mode === 'debug') {
        console.log('METHODS • AddMediaButton: createWriteupMedia');
      }

      let name = this.$refs.nameInput.value;
      if(!name) {
        name = this.$t('untitled_document');
      }

      if(this.writeup_medias.filter(w => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.document_name_exists'));  
        return false;        
      }


      // this.$eventHub.$on('socketio.media_created_or_updated', this.newTextMediaCreated);
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: 'folders',
        additionalMeta: {
          name,
          type: 'writeup'
        }
      });
    },
    openWriteupMedia(metaFileName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`METHODS • WriteUp: openWriteupMedia / ${metaFileName}`);
      }

      this.current_writeup_media_metaFileName = metaFileName;
    }
  }
}
</script>
<style>

</style>