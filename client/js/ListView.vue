<template>
  <main class="m_home">

    <header class="bg-dark c_blanc font-large">
      <div class="flex-wrap flex-vertically-centered limited-width">
        <div class="flex-size-2/5 flex-collapse-on-mobile padding-small flex-wrap flex-vertically-centered">
          <svg class="stvlogo margin-right-medium" version="1.1"
          	 x="0px" y="0px" width="40.5px" height="26.1px" viewBox="0 0 40.5 26.1" style="enable-background:new 0 0 40.5 26.1;"
          	 xml:space="preserve"
          	 >
            <g>
              	<path class="st0" d="M37.2,7.1c-0.7,6.7-7,16-13.2,16c-1.9,0-3.2-2.5-3.2-6c0-7.8,5.5-11.8,5.5-15.4c0-1-0.7-1.7-1.7-1.7
            		c-1.3,0-2.4,0.5-5,1.9L15,4.3l1.1,2.3L23.1,3c-4,5.7-5.5,10.4-5.5,14.3c0,3.2,1.2,8.8,5.8,8.8c8.4,0,17.1-12.1,17.1-21.3
            		c0-3.3-1.5-4.8-3.6-4.8c-2,0-3.5,1.5-3.5,3.5C33.4,5.8,35.2,7.1,37.2,7.1 M0,21.4c0,2.8,2,4.7,4.6,4.7c2.6,0,4.8-1.9,4.8-4.7
            		c0-2.7-2.1-4.7-4.8-4.7C2,16.6,0,18.7,0,21.4" style="fill:#FFFFFF"/>
            </g>
          </svg>

          <div>
            studio-théâtre <i>vitry</i> › <i>Les Cahiers du studio</i>
          </div>
        </div>
        <div class="flex-size-3/5 flex-collapse-on-mobile padding-small">

          <h2 class="text-ital text-underline">
            Présentation
          </h2>
          <p>
            La liste ci-dessous contient tous les temps capturés dans les Cahiers du Studio. Certains d’entre eux sont publics et tous leurs contenus peuvent être consultés, d’autres sont protégés par mot de passe et seuls les contenus rendus publics par leurs éditeurs sont consultables.
          </p>
        </div>
      </div>
    </header>


    <section class="flex-wrap flex-vertically-start limited-width">

      <div class="m_home--filtres flex-size-2/5 flex-collapse-on-mobile padding-sides-medium margin-vert-verylarge">

        <div class="border border-bottom-dashed border-top-dashed padding-vert-medium">
          <label class="margin-none text-cap with-bullet">
            Organiser par&nbsp;:
          </label>
          <div class="margin-sides-negative-verysmall">
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'alph', sort.field = 'name'">
              nom
            </button>
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'created'">
              date de création
            </button>
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'start'">
              date de début
            </button>
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'end'">
              date de fin
            </button>
          </div>
        </div>
        <div class="border border-bottom-dashed padding-vert-medium">
          <label class="margin-none text-cap with-bullet">
            dans l’ordre&nbsp;
          </label>
          <div class="margin-sides-negative-verysmall">
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'ascending'">
              croissant
            </button>
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'descending'">
              décroissant
            </button>
          </div>
        </div>
      </div>

      <div class="m_home--folders flex-size-3/5 flex-collapse-on-mobile margin-vert-verylarge">
        <div class="m_home--folders--card margin-small">
          <button type="button" class="button margin-left-none" @click="showCreateFolderModal = true">
            Créer un dossier
          </button>
          <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
          </CreateFolder>
        </div>

<!--        <transition-group name="folder-list" tag="div"> -->
          <div
            v-for="(sortedFolder, index) in sortedFoldersSlug"
            :key="sortedFolder.slugFolderName"
            class="m_home--folders--card margin-small"
          >
            <Folder
              :slugFolderName="sortedFolder.slugFolderName"
              :folder="$root.store.folders[sortedFolder.slugFolderName]"
            >
            </Folder>
          </div>
<!--        </transition-group> -->
      </div>

    </section>

  </main>
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