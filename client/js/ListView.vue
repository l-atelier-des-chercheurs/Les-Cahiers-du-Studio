<template>
  <main class="m_home">

    <header class="bg-noir c-blanc font-large padding-vert-medium">
      <div class="flex-wrap flex-vertically-centered limited-width">
        <div class="flex-size-2/5 flex-collapse-on-mobile padding-sides-medium padding-vert-medium flex-wrap flex-vertically-centered">
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
            studio-théâtre <i>vitry</i> <br>› <i>Les Cahiers du studio</i>
          </div>
        </div>
        <div class="flex-size-3/5 flex-collapse-on-mobile padding-small padding-vert-medium">

          <h2 class="text-ital text-underline">
            Présentation
          </h2>
          <p>
            Les Cahiers du Studio est une application de capture, d’annotation et de publication de médias (photos, textes, vidéos, sons) conçu en particulier pour les temps de résidence dans un lieu de création Théâtrale.
          </p>
          <p>La liste ci-dessous contient tous les temps capturés dans les Cahiers du Studio. Certains d’entre eux sont publics et tous leurs contenus peuvent être consultés, d’autres sont protégés par mot de passe et seuls les contenus rendus publics par les éditeurs sont consultables.
          </p>
          <p>
            Vous pouvez retrouver la documentation de cette application
            <a href="https://paper.dropbox.com/doc/Les-Cahiers-du-Studio-PvgkN59Zb2i9nAApZOIZz#:uid=389501177464251596585301&h2=Information-sur-le-stockage-de" class="js--openInBrowser" target="_blank">
              ici
            </a>
          </p>
        </div>
      </div>
    </header>


    <section class="flex-wrap flex-vertically-start limited-width padding-vert-medium">

      <div class="m_home--filtres flex-size-2/5 flex-collapse-on-mobile padding-sides-medium margin-vert-large">

        <div class="border border-bottom-dashed border-top-dashed padding-vert-medium">
          <label class="margin-none text-cap with-bullet">
            Organiser par&nbsp;:
          </label>
          <div class="margin-sides-negative-small">
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
          <div class="margin-sides-negative-small">
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'ascending'">
              croissant
            </button>
            <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'descending'">
              décroissant
            </button>
          </div>
        </div>
      </div>

      <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
      </CreateFolder>

      <div class="m_home--folders flex-size-3/5 flex-collapse-on-mobile margin-vert-large">
        <button class="m_home--folders--card margin-small button-inline" @click="showCreateFolderModal = true">

          <span class="c-gris margin-medium">
            Créer un dossier
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="46.99" height="46.99" viewBox="0 0 46.99 46.99">
            <title>Fichier 6</title>
            <g id="Calque_2" data-name="Calque 2">
              <g id="Nav">
                <g style="opacity: 0.30000000000000004">
                  <circle cx="23.5" cy="23.5" r="23" transform="translate(-9.73 23.5) rotate(-45)" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                  <line x1="23.5" y1="8.86" x2="23.5" y2="38.13" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                  <line x1="8.86" y1="23.5" x2="38.13" y2="23.5" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                </g>
              </g>
            </g>
          </svg>

        </button>

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