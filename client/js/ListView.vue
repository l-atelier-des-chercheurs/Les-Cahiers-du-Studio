<template>
  <div class="text_labeur m_listview">

    <div class="row">
      <div class="col-md-offset-4 col-md-9">
        <h1 class="">
          liste des temps
        </h1>
      </div>
    </div>

    <div class="row">
      <div class="col-md-offset-5 col-md-8">
        <p>
          La liste ci-dessous contient tous les temps capturés.
        </p>

        <button type="button" class="button margin-left-none" @click="showCreateFolderModal = true">
          Créer un dossier
        </button>

        <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
        </CreateFolder>

        <div class="row">
          <div class="input-group col-md-7">
            <h4 class="">order by</h4>
            <button type="button" @click="sort.type = 'date', sort.field = 'created'">
              creation date
            </button>
            <button type="button" class="" @click="sort.type = 'date', sort.field = 'start'">
              start date
            </button>
            <button type="button" class="" @click="sort.type = 'alph', sort.field = 'name'">
              name
            </button>
          </div>

          <div class="input-group col-md-7">
            <h4 class="">in</h4>
            <button type="button" class="" @click="sort.order = 'ascending'">
              ascending
            </button>
            <button type="button" class="" @click="sort.order = 'descending'">
              descending
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-3" v-for="sortedFolder in sortedFoldersSlug">
        <Folder
          :key="sortedFolder.slugFolderName"
          :slugFolderName="sortedFolder.slugFolderName"
          :folder="$root.store.folders[sortedFolder.slugFolderName]"
        >
        </Folder>
      </div>
    </div>
  </div>
</template>
<script>
import Folder from './components/Folder.vue';
import CreateFolder from './components/modals/CreateFolder.vue';

export default {
  name: 'app',
  components: {
    CreateFolder,
    Folder
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
  }
}
</script>
