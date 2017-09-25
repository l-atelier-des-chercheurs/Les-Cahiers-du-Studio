<template>
  <div class="container text_labeur m_listview">

    <div class="row">
      <div class="col-md-offset-5 col-md-8">
        <h1 class="">
          liste des temps
        </h1>
        <p>
          La liste ci-dessous contient tous les temps capturés. Certains d’entre eux sont publics et tous leurs contenus peuvent être consultés. Vous pouvez également y contribuer, soit en <span class="c_bleu">#</span>ajoutant<span class="c_bleu">#</span> des médias, soit en en <span class="c_bleu">#</span>annotant<span class="c_bleu">#</span> d’autres. Les dossiers protégés par mot de passe sont par contre uniquement consultables.
        </p>

        <div class="input-single">
          <button type="button" class="button margin-left-none" @click="showCreateFolderModal = true">
            Créer un dossier
          </button>
        </div>

        <hr>

        <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
        </CreateFolder>
      </div>
    </div>

    <div class="row">
      <div class="col-md-7">
        <label>Organiser par&nbsp;:</label>
        <div class="input-group">
          <button type="button" class="" @click="sort.type = 'alph', sort.field = 'name'">
            nom
          </button>
          <button type="button" @click="sort.type = 'date', sort.field = 'created'">
            date de création
          </button>
          <button type="button" class="" @click="sort.type = 'date', sort.field = 'start'">
            date de début
          </button>
          <button type="button" class="" @click="sort.type = 'date', sort.field = 'end'">
            date de fin
          </button>
        </div>
      </div>
      <div class="col-md-7">
        <label>dans l’ordre&nbsp;</label>
        <div class="input-group">
          <button type="button" class="" @click="sort.order = 'ascending'">
            croissant
          </button>
          <button type="button" class="" @click="sort.order = 'descending'">
            décroissant
          </button>
        </div>
      </div>
    </div>

    <div class="row card_folder_container">
      <transition-group name="folder-list" tag="div">
        <div
          v-for="(sortedFolder, index) in sortedFoldersSlug"
          :key="sortedFolder.slugFolderName"
          class="card_folder"
        >
          <Folder
            :slugFolderName="sortedFolder.slugFolderName"
            :folder="$root.store.folders[sortedFolder.slugFolderName]"
          >
          </Folder>
        </div>
      </transition-group>
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
      },
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
<style>
</style>