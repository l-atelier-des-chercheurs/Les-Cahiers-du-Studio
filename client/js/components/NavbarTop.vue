<template>
  <div class="navbar">
    <nav class="navbar_top">
      <div class="wrapper">
        <div class="bloccontainer">
          <button class="menu_icon" @click="$emit('toggleSidebar')">
            <svg class="svg-icon" viewBox="0 0 20 20">
            		<path fill="none" d="M3.314,4.8h13.372c0.41,0,0.743-0.333,0.743-0.743c0-0.41-0.333-0.743-0.743-0.743H3.314
       c-0.41,0-0.743,0.333-0.743,0.743C2.571,4.467,2.904,4.8,3.314,4.8z M16.686,15.2H3.314c-0.41,0-0.743,0.333-0.743,0.743 s0.333,0.743,0.743,0.743h13.372c0.41,0,0.743-0.333,0.743-0.743S17.096,15.2,16.686,15.2z M16.686,9.257H3.314
       c-0.41,0-0.743,0.333-0.743,0.743s0.333,0.743,0.743,0.743h13.372c0.41,0,0.743-0.333,0.743-0.743S17.096,9.257,16.686,9.257z"></path>
        			</svg>
          </button>

          <ol class="breadcrumb">
            <li>
              <a href="/" @click.prevent="$root.closeFolder()">
                studio-théâtre.<i>vitry</i>
              </a>
            </li>
            <li v-if="typeof folder !== 'undefined'">
              <template>{{ folder.name }}</template>
              <span v-if="folder.authorized">
                <button type="button" class="button_small" @click="showEditFolderModal = true">
                  Éditer
                </button>
              </span>
            </li>
            <li v-if="typeof currentDay !== 'undefined'">
              {{ getCurrentDay }}
            </li>
          </ol>
        </div>
      </div>
    </nav>

    <EditFolder
      v-if="showEditFolderModal"
      :folder="folder"
      :slugFolderName="slugFolderName"
      @close="showEditFolderModal = false"
    >
    </EditFolder>

  </div>
</div>
</template>
<script>
import EditFolder from './modals/EditFolder.vue';
import moment from 'moment';

export default {
  props: ['folder', 'slugFolderName', 'currentDay'],
  components: {
    EditFolder
  },
  data () {
    return {
      showEditFolderModal: false
    }
  },
  computed: {
    getCurrentDay: function() {
      return moment(this.currentDay).format('DD/MM/YYYY');
    }


  }
}
</script>
<style scoped lang="less">


</style>