<template>
  <main class="m_home">
    <header class="bg-noir c-blanc font-large padding-vert-medium">
      <div class="flex-wrap flex-vertically-centered limited-width">
        <div
          class="flex-size-2/5 flex-collapse-on-mobile padding-sides-medium padding-vert-medium flex-wrap flex-vertically-centered"
        >
          <svg
            class="stvlogo margin-right-medium"
            version="1.1"
            x="0px"
            y="0px"
            width="40.5px"
            height="26.1px"
            viewBox="0 0 40.5 26.1"
            style="enable-background: new 0 0 40.5 26.1"
            xml:space="preserve"
          >
            <g>
              <path
                class="st0"
                d="M37.2,7.1c-0.7,6.7-7,16-13.2,16c-1.9,0-3.2-2.5-3.2-6c0-7.8,5.5-11.8,5.5-15.4c0-1-0.7-1.7-1.7-1.7
            		c-1.3,0-2.4,0.5-5,1.9L15,4.3l1.1,2.3L23.1,3c-4,5.7-5.5,10.4-5.5,14.3c0,3.2,1.2,8.8,5.8,8.8c8.4,0,17.1-12.1,17.1-21.3
            		c0-3.3-1.5-4.8-3.6-4.8c-2,0-3.5,1.5-3.5,3.5C33.4,5.8,35.2,7.1,37.2,7.1 M0,21.4c0,2.8,2,4.7,4.6,4.7c2.6,0,4.8-1.9,4.8-4.7
            		c0-2.7-2.1-4.7-4.8-4.7C2,16.6,0,18.7,0,21.4"
                style="fill: #ffffff"
              />
            </g>
          </svg>

          <div>
            ›
            <i>Les Cahiers du Studio</i>
            <br />
            <small>v{{ $root.state.appVersion }}</small>
          </div>
        </div>
        <div
          class="text-formatting flex-size-3/5 flex-collapse-on-mobile padding-small padding-vert-small"
        >
          <div class="_langSelector" style="">
            <!-- <label v-html="$t('lang:')"></label> -->
            <select v-model="currentLang">
              <option
                v-for="(name, code) in $root.lang.available"
                :value="code"
                :key="code"
              >
                {{ name }}
              </option>
            </select>
          </div>

          <VueMarkdown :html="true" :source="presentationText" />

          <div class="border border-top-dashed">
            <p class="margin-vert-medium" v-html="$t('more_information')"></p>
          </div>
        </div>
      </div>
    </header>

    <div
      class="m_connectionStatus"
      v-if="!$root.state.connected && $root.state.mode !== 'export_web'"
    >
      {{ $t("notifications.connection_lost") }}
      {{ $t("notifications.contents_wont_be_editable") }}
    </div>

    <section
      class="flex-wrap flex-vertically-start limited-width padding-vert-medium"
    >
      <div
        class="m_home--filtres flex-size-2/5 flex-collapse-on-mobile padding-sides-medium margin-vert-large"
      >
        <div class="_openAuthorModal">
          <button
            type="button"
            @click="$root.showAuthorsListModal = true"
            :content="$t('login')"
            v-tippy="{
              placement: 'bottom',
              delay: [600, 0],
            }"
          >
            <template v-if="$root.current_author">
              <div
                class="m_topbar--center--authors--portrait"
                v-if="
                  $root.current_author.hasOwnProperty('preview') &&
                  $root.current_author.preview.length !== ''
                "
              >
                <img
                  :src="urlToPortrait($root.current_author.preview)"
                  width="100"
                  height="100"
                  draggable="false"
                />
              </div>
              <div class="m_topbar--center--authors--name">
                {{ $root.current_author.name }}
              </div>
            </template>
            <template v-else>
              <div class="font-medium">{{ $t("login") }}</div>
            </template>
          </button>
        </div>
      </div>

      <CreateFolder
        v-if="showCreateFolderModal"
        @close="showCreateFolderModal = false"
        :read_only="read_only"
      ></CreateFolder>

      <div class="flex-size-3/5 flex-collapse-on-mobile">
        <div class="" v-if="false">
          <div class="margin-vert-medium">
            <label class="margin-none text-cap with-bullet">{{
              $t("sort_by")
            }}</label>
            <div class="margin-sides-negative-small">
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="(sort.type = 'alph'), (sort.field = 'name')"
                :class="{ 'is--active': sort.field === 'name' }"
              >
                {{ $t("name") }}
              </button>
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="(sort.type = 'date'), (sort.field = 'created')"
                :class="{ 'is--active': sort.field === 'created' }"
              >
                {{ $t("created_date") }}
              </button>
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="(sort.type = 'date'), (sort.field = 'start')"
                :class="{ 'is--active': sort.field === 'start' }"
              >
                {{ $t("start_date") }}
              </button>
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="(sort.type = 'date'), (sort.field = 'end')"
                :class="{ 'is--active': sort.field === 'end' }"
              >
                {{ $t("end_date") }}
              </button>
            </div>
          </div>

          <div class="margin-vert-small">
            <label class="margin-none text-cap with-bullet">{{
              $t("in_the_order")
            }}</label>
            <div class="margin-sides-negative-small">
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="sort.order = 'ascending'"
                :class="{ 'is--active': sort.order === 'ascending' }"
              >
                {{ $t("ascending") }}
              </button>
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall"
                @click="sort.order = 'descending'"
                :class="{ 'is--active': sort.order === 'descending' }"
              >
                {{ $t("descending") }}
              </button>
            </div>
          </div>
        </div>
        <div
          class="margin-sides-small padding-bottom-small border border-bottom-dashed"
        >
          <div class="flex-wrap flex-space-between">
            <div>{{ $t("list_of_folders") }}</div>
            <div class="_searchButton">
              <button
                type="button"
                @click="show_search = !show_search"
                :class="{ 'is--active': show_search }"
              >
                <svg
                  class="svg-icon"
                  viewBox="0 0 20 20"
                  width="1em"
                  height="1em"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    d="M12.323,2.398c-0.741-0.312-1.523-0.472-2.319-0.472c-2.394,0-4.544,1.423-5.476,3.625C3.907,7.013,3.896,8.629,4.49,10.102c0.528,1.304,1.494,2.333,2.72,2.99L5.467,17.33c-0.113,0.273,0.018,0.59,0.292,0.703c0.068,0.027,0.137,0.041,0.206,0.041c0.211,0,0.412-0.127,0.498-0.334l1.74-4.23c0.583,0.186,1.18,0.309,1.795,0.309c2.394,0,4.544-1.424,5.478-3.629C16.755,7.173,15.342,3.68,12.323,2.398z M14.488,9.77c-0.769,1.807-2.529,2.975-4.49,2.975c-0.651,0-1.291-0.131-1.897-0.387c-0.002-0.004-0.002-0.004-0.002-0.004c-0.003,0-0.003,0-0.003,0s0,0,0,0c-1.195-0.508-2.121-1.452-2.607-2.656c-0.489-1.205-0.477-2.53,0.03-3.727c0.764-1.805,2.525-2.969,4.487-2.969c0.651,0,1.292,0.129,1.898,0.386C14.374,4.438,15.533,7.3,14.488,9.77z"
                  ></path>
                </svg>
                {{ $t("search_among_timeline") }}
              </button>
            </div>
          </div>
          <div
            v-if="show_search || debounce_search_folder_name.length > 0"
            class="rounded _searchField"
          >
            <div>{{ $t("folder_name_to_find") }}</div>

            <div class="input-group">
              <input type="text" class v-model="debounce_search_folder_name" />
              <span
                class="input-addon"
                v-if="debounce_search_folder_name.length > 0"
              >
                <button
                  type="button"
                  :disabled="debounce_search_folder_name.length === 0"
                  @click="debounce_search_folder_name = ''"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
        <transition-group
          tag="div"
          name="list-complete"
          class="flex-wrap flex-vertically-start m_home--folders margin-vert-small"
        >
          <button
            class="m_home--folders--card m_home--folders--card_createButton margin-small button-inline"
            @click="showCreateFolderModal = true"
            :disabled="read_only"
            :key="'createButton'"
          >
            <span class="margin-small">{{ $t("create_a_folder") }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="46.99"
              height="46.99"
              viewBox="0 0 46.99 46.99"
            >
              <circle
                cx="23.5"
                cy="23.5"
                r="23"
                transform="translate(-9.73 23.5) rotate(-45)"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="23.5"
                y1="8.86"
                x2="23.5"
                y2="38.13"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="8.86"
                y1="23.5"
                x2="38.13"
                y2="23.5"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
            </svg>
          </button>

          <template v-if="sortedFoldersSlug !== 'no-folders'">
            <div
              class="m_home--folders--card margin-small"
              v-for="sortedFolder in sortedFoldersSlug"
              :key="sortedFolder.slugFolderName"
            >
              <Folder
                :slugFolderName="sortedFolder.slugFolderName"
                :folder="folders[sortedFolder.slugFolderName]"
                :read_only="read_only"
                :sort_field="sort.field"
              ></Folder>
            </div>
          </template>
        </transition-group>
      </div>
    </section>
  </main>
</template>
<script>
import Folder from "./components/Folder.vue";
import CreateFolder from "./components/modals/CreateFolder.vue";
import VueMarkdown from "vue-markdown";

export default {
  props: {
    presentationMD: Object,
    read_only: Boolean,
    folders: Object,
  },
  components: {
    CreateFolder,
    Folder,
    VueMarkdown,
  },
  data() {
    return {
      showCreateFolderModal: false,
      show_search: false,

      sort: {
        type: "date",
        field: "created",
        order: "descending",
      },
      currentLang: this.$root.lang.current,

      debounce_search_folder_name: this.$root.settings.folder_filter.name,
      debounce_search_folder_name_function: undefined,
    };
  },
  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
    folders: function () {},
    debounce_search_folder_name: function () {
      if (this.debounce_search_folder_name_function)
        clearTimeout(this.debounce_search_folder_name_function);
      this.debounce_search_folder_name_function = setTimeout(() => {
        this.$root.settings.folder_filter.name = this.debounce_search_folder_name;
      }, 340);
    },
  },
  computed: {
    sortedFoldersSlug: function () {
      if (this.folders.message === "no-folders") {
        return "has-no-folders";
      }

      var sortable = [];

      for (let folder of Object.values(this.folders)) {
        let orderBy;
        if (this.sort.type === "date") {
          orderBy = +this.$moment(
            folder[this.sort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (this.sort.type === "alph") {
          orderBy = folder[this.sort.field];
        }
        if (Number.isNaN(orderBy)) {
          orderBy = 0;
        }

        if (this.$root.settings.folder_filter.name !== "") {
          if (
            !folder.name
              .toLowerCase()
              .includes(this.$root.settings.folder_filter.name.toLowerCase())
          )
            continue;
        }

        debugger;

        sortable.push({ slugFolderName: folder.slugFolderName, orderBy });
      }
      let sortedSortable = sortable.sort(function (a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === "string" && typeof b.orderBy === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.sort.order === "descending") {
        sortedSortable.reverse();
      }

      return sortedSortable;
    },
    presentationText: function () {
      if (this.presentationMD.hasOwnProperty(this.currentLang)) {
        return this.presentationMD[this.currentLang];
      } else if (this.presentationMD.hasOwnProperty("content")) {
        return this.presentationMD["content"];
      }

      return this.presentationMD;
    },
  },
};
</script>
<style scoped lang="scss">
._langSelector {
  // position: absolute;
  // right: 0;
  max-width: 150px;
  color: var(--color-noir);
  // margin: var(--spacing);
}
._searchButton {
  flex: 0 0 auto;

  button {
    display: flex;
    flex-flow: row nowrap;
    svg {
      width: 1em;
      height: 1em;
    }
  }
}
._searchField {
  // background-color: var(--color-noir);
  // color: white;
  padding: calc(var(--spacing) / 4);
  max-width: 320px;
  margin: 0 auto;
  margin-right: 0;

  .input-group {
    margin-bottom: 0;
  }
}
</style>
