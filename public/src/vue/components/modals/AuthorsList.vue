<template>
  <Modal
    ref="modal"
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    :prevent_close="prevent_close"
    :is_loading="is_loading"
  >
    <template slot="header">
      <span class>{{ $t("authors_list") }}</span>
    </template>

    <template slot="preview">
      <div class>
        <div class="margin-sides-medium margin-vert-small">
          <div
            v-if="
              $root.state.local_options.force_login && !$root.current_author
            "
          >
            <strong>{{ $t("login_to_access") }}</strong>
          </div>

          <small>{{
            $t("when_logged_as_author_content_will_be_tagged")
          }}</small>
          <button
            v-if="!show_detail"
            type="button"
            class="buttonLink margin-left-none padding-left-none"
            @click="show_detail = !show_detail"
          >
            + {{ $t("more_informations") }}
          </button>
          <div>
            <small v-if="show_detail">{{
              $t("more_informations_on_authors")
            }}</small>
          </div>
        </div>
        <transition-group tag="div" class="m_authorsList" name="list-complete">
          <div class :key="'createAuthor'">
            <div class="m_authorsList--createAuthor">
              <button
                type="button"
                @click="openCreateAuthorPanel = true"
                v-if="openCreateAuthorPanel == false"
                class="m_authorsList--createAuthor--createButton bg-bleumarine"
              >
                {{ $t("create_an_author") }}
              </button>
              <CreateAuthor
                v-else
                @close="openCreateAuthorPanel = false"
                :read_only="read_only"
              />
            </div>
          </div>

          <template v-if="Object.keys(sortedAuthors).length > 0">
            <template v-for="author in sortedAuthors">
              <Author
                :author="author"
                :key="author.slugFolderName"
                @close="$emit('close')"
              />
            </template>
          </template>
        </transition-group>
      </div>
    </template>
  </Modal>
</template>
<script>
import Author from "./../subcomponents/Author.vue";
import CreateAuthor from "./../subcomponents/CreateAuthor.vue";

export default {
  props: {
    authors: {
      type: Object,
      default: {},
    },
    prevent_close: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Author,
    CreateAuthor,
  },
  data() {
    return {
      openCreateAuthorPanel: false,
      editAuthorSlug: false,
      show_detail: false,
      is_loading: false,
    };
  },

  created() {},
  mounted() {
    this.is_loading = true;
    this.$socketio.listFolders({ type: "authors" });
    this.$eventHub.$once("socketio.authors.folders_listed", () => {
      this.is_loading = false;
    });
  },
  beforeDestroy() {},

  watch: {},
  computed: {
    sortedAuthors: function () {
      return Object.values(this.authors).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss">
.m_authorsList {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  margin: calc(var(--spacing) / 2);

  > * {
    // .margin-sides-small;
    // .margin-small;
    flex: 0 0 240px;
    min-height: 200px;
    // max-width: 160px;
  }

  .m_authorsList--createAuthor,
  .m_authorsList--editAuthor {
    padding: calc(var(--spacing) / 2);
    margin: calc(var(--spacing) / 2);

    position: relative;
    border: 4px dashed var(--color-bleu_vif);
    background-color: #fff;
    // border: 4px solid @c-gris_clair;
    border-radius: var(--size-buttonradius);
    font-size: var(--font-size-small);
    line-height: var(--line-height-small);

    display: flex;
    flex-flow: none;
    align-items: center;
    justify-content: center;
    max-width: none;

    .m_authorsList--createAuthor--createButton {
      max-height: none;
      display: block;
      border: none;
      padding-left: calc(var(--spacing) / 4);
      padding-right: calc(var(--spacing) / 4);

      // .bg-gris_tresclair;
    }

    > form {
      width: 265px;
    }
  }
}
</style>
