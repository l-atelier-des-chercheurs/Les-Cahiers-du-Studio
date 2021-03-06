<template>
  <div class="m_accessController">
    <!-- editing_limited_to : {{ editing_limited_to }}<br />
    viewing_limited_to : {{ viewing_limited_to }}<br />
    password : {{ password }}<br />
    can_see_folder : {{ can_see_folder }}<br />
    can_edit_folder : {{ can_edit_folder }}<br /> -->
    <div class="m_metaField" v-if="!!_editing_limited_to && context === 'full'">
      <div>{{ $t("who_can_edit") }}</div>
      <div class="">
        <span>{{ $t(_editing_limited_to) }}</span>
      </div>
    </div>

    <div class="m_metaField" v-if="!!_viewing_limited_to && context === 'full'">
      <div>{{ $t("consultation") }}</div>
      <div>{{ $t("visible_to_all") }}</div>
    </div>

    <small
      v-if="_editing_limited_to === 'nobody'"
      v-html="$t('archived_explanation')"
    />
    <!-- 
          <div
            class="m_metaField"
            v-if="
              can_see_folder &&
              project.password === 'has_pass' &&
              project.editing_limited_to !== 'only_authors'
            "
          >
            <label>{{ $t("protected_by_pass") }}</label>
          </div> -->

    <div
      class="m_metaField"
      v-if="
        !can_edit_folder &&
        editing_limited_to === 'only_authors' &&
        viewing_limited_to !== 'everybody' &&
        context !== 'full'
      "
    >
      <div>{{ $t("only_authors_can_open") }}</div>
    </div>
    <div
      class="m_metaField"
      v-else-if="
        !can_edit_folder &&
        editing_limited_to === 'with_password' &&
        viewing_limited_to !== 'everybody' &&
        context !== 'full'
      "
    >
      <div>{{ $t("only_password_can_open") }}</div>
    </div>

    <template v-if="!can_edit_folder && editing_limited_to === 'only_authors'">
      <div
        class="text-centered"
        v-if="
          context === 'full' ||
          (viewing_limited_to !== 'everybody' && context !== 'full')
        "
      >
        <button
          v-if="!$root.current_author && viewing_limited_to === 'everybody'"
          type="button"
          class="buttonLink"
          style
          @click.stop="$root.showAuthorsListModal = true"
        >
          {{ $t("login_to_edit_project") }}
        </button>

        <button
          v-else-if="
            !$root.current_author && viewing_limited_to !== 'everybody'
          "
          type="button"
          class="buttonLink"
          style
          @click.stop="$root.showAuthorsListModal = true"
        >
          {{ $t("login_to_access_project") }}
        </button>

        <button
          v-else
          type="button"
          class="buttonLink"
          style
          @click.stop="requestAccessToProject"
        >
          {{ $t("ask_to_be_added_to_authors") }}
        </button>
      </div>
    </template>

    <button
      v-if="
        !can_see_folder &&
        password === 'has_pass' &&
        editing_limited_to !== 'only_authors'
      "
      type="button"
      class="buttonLink _open_pwd_input"
      :class="{ 'is--active': showInputPasswordField }"
      style
      @click.stop="showInputPasswordField = !showInputPasswordField"
    >
      {{ $t("password_required_to_open") }}
    </button>

    <button
      v-if="
        !can_edit_folder &&
        password === 'has_pass' &&
        editing_limited_to !== 'only_authors' &&
        context === 'full'
      "
      type="button"
      class="buttonLink _open_pwd_input"
      :class="{ 'is--active': showInputPasswordField }"
      style
      @click.stop="showInputPasswordField = !showInputPasswordField"
    >
      {{ $t("password_required_to_edit") }}
    </button>

    <div class="padding-verysmall _pwd_input" v-if="showInputPasswordField">
      <div class="margin-bottom-small">
        <label>{{ $t("password") }}</label>
        <input
          type="password"
          ref="passwordField"
          @keydown.enter.prevent="submitPassword"
          required
          autofocus
          placeholder="…"
        />
      </div>

      <button
        type="button"
        class="button button-greenthin"
        @click.stop="submitPassword"
      >
        {{ $t("send") }}
      </button>
    </div>

    <div
      v-if="
        can_edit_folder &&
        folderPassword() &&
        context === 'full' &&
        (!editing_limited_to || editing_limited_to === 'with_password')
      "
      class="m_metaField"
    >
      <div
        class="cursor-pointer"
        @click="showCurrentPassword = !showCurrentPassword"
        v-html="!showCurrentPassword ? $t('show_password') : $t('hide')"
      />
      <div v-if="showCurrentPassword && can_see_folder">
        {{ folderPassword() }}
      </div>
    </div>

    <button
      v-if="
        can_see_folder &&
        can_edit_folder &&
        folderPassword() &&
        context === 'full' &&
        (!editing_limited_to || editing_limited_to === 'with_password')
      "
      type="button"
      class="_button_forgetpassword"
      @click="forgetPassword"
    >
      {{ $t("forget_password_and_close") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    folder: {
      type: Object,
    },
    context: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  components: {},
  data() {
    return {
      showInputPasswordField: false,
      showCurrentPassword: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    can_see_project() {
      if (!this.can_see_folder && this.context === "full") {
        // cas d’un mdp qui a été ajouté ou changé
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.password_added_or_changed_to_this_project")
          );

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.enter_password_to_reopen"));

        this.$emit("closeFolder");
      }
    },
    showInputPasswordField: function () {
      if (this.showInputPasswordField) {
        this.$nextTick(() => {
          this.$refs.passwordField.focus();
        });
      }
    },
  },
  computed: {
    slugFolderName() {
      return this.folder.slugFolderName;
    },
    editing_limited_to() {
      return this.folder.editing_limited_to;
    },
    viewing_limited_to() {
      return this.folder.viewing_limited_to;
    },
    password() {
      return this.folder.password;
    },
    can_see_folder() {
      return this.$root.canSeeFolder({
        type: this.type,
        slugFolderName: this.slugFolderName,
      });
    },
    can_edit_folder() {
      return this.$root.canEditFolder({
        type: this.type,
        slugFolderName: this.slugFolderName,
      });
    },
    _editing_limited_to() {
      if (!!this.editing_limited_to) return this.editing_limited_to;
      else return false;
    },
    _viewing_limited_to() {
      if (!!this.viewing_limited_to) return this.viewing_limited_to;
      else return "";
    },
  },
  methods: {
    submitPassword() {
      console.log("METHODS • Project: submitPassword");

      this.$auth.updateFoldersPasswords({
        [this.type]: {
          [this.slugFolderName]: this.$refs.passwordField.value,
        },
      });

      this.$socketio.sendAuth();

      // check if password matches or not
      this.$eventHub.$once("socketio.authentificated", () => {
        const has_passworded_folder = window.state.list_authorized_folders.filter(
          (f) =>
            f.type === this.type &&
            f.allowed_slugFolderNames.includes(this.slugFolderName)
        );

        if (has_passworded_folder.length === 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.wrong_password"));
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        } else {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t("notifications.password_is_valid"));
          this.showInputPasswordField = false;
          this.$emit("openFolder");
          // to force refresh computed project_password prop
          this.$forceUpdate();
        }
      });
    },
    requestAccessToProject() {
      const current_author = this.$root.current_author;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error("Fonctionnalité en cours d’intégration…");

      // TODO : send request to be added to folder
      // === creating a channel restricted to all the existing authors + current

      this.$eventHub.$emit("requestToBeAddedToAuthors", {
        type: "projects",
        slugFolderName: this.slugFolderName,
      });
    },
    forgetPassword() {
      this.$auth.removeFolderPassword({
        type: this.type,
        slugFolderName: this.slugFolderName,
      });
      this.$socketio.sendAuth();
      this.$emit("closeFolder");
    },

    folderPassword() {
      if (this.password !== "has_pass") return false;

      return this.$root.getFolderPassword({
        type: this.type,
        slugFolderName: this.slugFolderName,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_metaField:last-of-type {
  // margin-bottom: 0;
}
._pwd_input,
._open_pwd_input {
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.4);
}

.m_accessController {
  display: block;
  height: auto;
}

button {
  z-index: 1;
}

.m_metaField {
  position: relative;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;

  // color: @c-noir;
  // border-bottom: 1px dashed @c-border;
  border-radius: 2px;
  text-align: left;

  margin-bottom: var(--spacing-verysmall);

  > *:first-child {
    margin-right: var(--spacing-verysmall);
    text-transform: uppercase;
  }

  > *:nth-child(2) {
    text-transform: initial;
    font-weight: 400;
  }
  &:last-child {
    // margin-bottom: 0;
  }

  button {
    min-height: 0;
    padding: 0;
    color: inherit;
    background-color: transparent;
  }
}
</style>
