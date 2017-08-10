<template>
  <div id="app">
    <h1 class="margin-small">
      Documentation platform
    </h1>

    <button type="button" class="button margin-small" @click="showCreateFolderModal = !showCreateFolderModal">
      Create Folder
    </button>
    <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
    </CreateFolder>

    <div class="margin-small">
      <h4 class="">order by</h4>
      <div class="input-group clearfix">
        <button type="button" class="" @click="sort.type = 'date', sort.field = 'created'">
          by creation date
        </button>
        <button type="button" class="" @click="sort.type = 'date', sort.field = 'start'">
          by start date
        </button>
        <button type="button" class="" @click="sort.type = 'alph', sort.field = 'name'">
          by name
        </button>
      </div>
      <div class="input-group clearfix">
        <button type="button" class="" @click="sort.order = 'ascending'">
          ascending
        </button>
        <button type="button" class="" @click="sort.order = 'descending'">
          descending
        </button>
      </div>
    </div>

    <hr>

    <Folder v-for="sortedFolder in sortedFoldersSlug" :key="sortedFolder.slugFolderName" :slugFolderName="sortedFolder.slugFolderName" :folder="$root.store.folders[sortedFolder.slugFolderName]">
    </Folder>

    <hr>

    <BottomFooter>
    </BottomFooter>
  </div>
</template>

<script>
import FileUpload from './components/FileUpload.vue';
import Folder from './components/Folder.vue';
import CreateFolder from './components/modals/CreateFolder.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    FileUpload,
    Folder,
    CreateFolder,
    BottomFooter
  },
  data () {
    return {
      showCreateFolderModal: false,
      sort: {
        type: 'date',
        field: 'created',
        order: 'descending'
      }
    }
  },
  computed: {
    sortedFoldersSlug() {
      var sortable = [];
      for (let slugFolderName in this.$root.store.folders) {
        let orderBy;

        if (this.sort.type ==='date') {
          orderBy = + new Date(this.$root.store.folders[slugFolderName][this.sort.field]);
        } else if (this.sort.type ==='alph') {
          orderBy = this.$root.store.folders[slugFolderName][this.sort.field];
        }

        sortable.push({ slugFolderName: slugFolderName, orderBy: orderBy });
      }
      let sortedSortable = sortable.sort(function(a, b) {
          return a.orderBy - b.orderBy;
      });
      if(this.sort.order === 'descending') {
        sortedSortable.reverse();
      }
      return sortedSortable;
    }
  },
  methods: {
    getURLToApp(ninfos) {
      return `https://${ninfos}:8080`;
    }
  },
  watch: {
    sort: function() {

    }
  }
}
</script>

<style>
</style>
