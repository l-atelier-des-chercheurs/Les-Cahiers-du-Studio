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
            studio-théâtre <i>vitry</i> <br>› <i>Les Cahiers du Studio</i>
          </div>
        </div>
        <div class="text-formatting flex-size-3/5 flex-collapse-on-mobile padding-small padding-vert-medium">
          <vue-markdown
            :html=true
            :source="presentationText"
          ></vue-markdown>
        </div>
      </div>
    </header>


    <section class="flex-wrap flex-vertically-start limited-width padding-vert-medium">
      <div class="m_home--filtres flex-size-2/5 flex-collapse-on-mobile padding-sides-medium margin-vert-large">
        <div class="border border-top-dashed">
          <p class="margin-vert-medium" v-html="$t('more_information')">
          </p>
        </div>

        <div class="border border-top-dashed">
          <div class="margin-vert-medium">
            <label class="margin-none text-cap with-bullet">
              {{ $t('sort_by') }}
            </label>
            <div class="margin-sides-negative-small">
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'alph', sort.field = 'name'">
                {{ $t('name') }}
              </button>
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'created'">
                {{ $t('created_date') }}
              </button>
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'start'">
                {{ $t('start_date') }}
              </button>
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.type = 'date', sort.field = 'end'">
                {{ $t('end_date') }}
              </button>
            </div>
          </div>

          <div class="margin-vert-small">
            <label class="margin-none text-cap with-bullet">
              {{ $t('in_the_order') }}
            </label>
            <div class="margin-sides-negative-small">
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'ascending'">
                {{ $t('ascending') }}
              </button>
              <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall" @click="sort.order = 'descending'">
                {{ $t('descending') }}
              </button>
            </div>
          </div>
        </div>
        <div class="border border-top-dashed">
          <div class="margin-vert-medium" style="max-width: 200px">
            <label v-html="$t('lang:')"></label>
            <select v-model="currentLang">
              <option v-for="(name, code) in $root.lang.available" :value="code">
                {{ name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
      </CreateFolder>

      <div class="m_home--folders flex-size-3/5 flex-collapse-on-mobile margin-vert-large flex-wrap flex-vertically-start">
        <button class="m_home--folders--card margin-small button-inline" @click="showCreateFolderModal = true">

          <span class="c-gris margin-medium">
            {{ $t('create_a_folder') }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="46.99" height="46.99" viewBox="0 0 46.99 46.99">
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
import VueMarkdown from 'vue-markdown'

export default {
  props: ['presentation_md'],
  components: {
    CreateFolder,
    Folder,
    VueMarkdown
  },
  data () {
    return {
      showCreateFolderModal: false,
      sort: {
        type: 'date',
        field: 'created',
        order: 'descending'
      },
      currentLang: this.$root.lang.current
    }
  },
  watch: {
    'currentLang': function() {
      this.$root.updateLocalLang(this.currentLang);
    },
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
    },
    presentationText() {

      if(this.presentation_md.hasOwnProperty(this.currentLang)) {
        return this.presentation_md[this.currentLang];
      } else if(this.presentation_md.hasOwnProperty('content')) {
        return this.presentation_md['content'];
      }

      return this.presentation_md;
    }
  }
}
</script>
<style>
</style>