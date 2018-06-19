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
        <div>
          {{ $t('keyboard_shortcuts_instructions') }}
        </div>
      </div>
      <div class="margin-bottom-small">
        <table>
          <thead>
            <tr>
              <th style="width: 50px">
                Key
              </th>
              <th>
                Marker color
              </th>
              <th></th>
            </tr>
          </thead>
          <transition-group
            tag="tbody"
            name="list-complete"
          >
            <tr v-for="(ks, index) in new_keyboard_shortcuts" :key="index">
              <td>
                <input type="text" v-model="ks.key" />
              </td>
              <td>
                <select v-model="ks.marker_color">
                  <option v-for="mediaColor in $root.state.structure.media.color.options" :key="mediaColor">
                    {{ mediaColor }}
                  </option>
                </select>
              </td>
              <td>
                <button type="button" class="button-small padding-small margin-none bg-transparent" @click="removeShortcut(index)">
                  {{ $t('remove') }}
                </button>
              </td>  
            </tr>          
            <tr :key="'create'">
              <td colspan=3 >
                <button type="button" class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent" @click="appendShortcut">
                  {{ $t('create') }}
                </button>
              </td>
            </tr>
          </transition-group>
        </table>

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
