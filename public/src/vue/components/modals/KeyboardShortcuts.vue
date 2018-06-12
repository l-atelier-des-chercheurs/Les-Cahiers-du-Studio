<template>
  <Modal
    @close="$emit('close')"
    @submit="updateShortcuts"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('keyboard_shortcuts') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        <div>Associez ici l’appui sur des touches du clavier (ou d’un boîtier do•doc) à la création de markers colorés à ce moment précis dans la timeline :</div>
      </div>
      <div class="margin-bottom-small">
        <div class="input-group" v-for="(ks, index) in new_keyboard_shortcuts" :key="ks.keys">
          <input type="text" v-model="ks.key" />
          <select v-model="ks.marker_color">
            <option v-for="mediaColor in $root.state.structure.media.color.options" :key="mediaColor">
              {{ mediaColor }}
            </option>
          </select>
          <button type="button" class="button-small padding-small margin-none bg-transparent" @click="removeShortcut(index)">
            Supprimer
          </button>
        </div>
        <button type="button" class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent" @click="appendShortcut">
          Ajouter
        </button>
      </div>
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import alertify from 'alertify.js';

export default {
  props: {
    read_only: Boolean,
    keyboard_shortcuts: Array
  },
  components: {
    Modal
  },
  data() {
    return {
      new_keyboard_shortcuts: this.$root.getKeyboardShortcuts()
    };
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    appendShortcut: function() {
      console.log('METHODS • KeyboardShortcuts: appendShortcut');
      this.new_keyboard_shortcuts.push(
        { 
          key: '', 
          marker_color: '' 
        }
      );
    },
    removeShortcut: function(index) {
      this.new_keyboard_shortcuts.splice(index, 1);
    },
    updateShortcuts: function() {
      console.log('METHODS • KeyboardShortcuts: updateShortcuts');
      this.$root.updateKeyboardShortcuts(this.new_keyboard_shortcuts);
      this.$emit('close');
    }
  }
};
</script>
<style>

</style>
