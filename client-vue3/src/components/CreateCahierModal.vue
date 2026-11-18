<template>
  <BaseModal
    :disabled="!title || is_creating"
    @close="$emit('close')"
    @submit="create"
  >
    <template #header>{{ $t("create_cahier") }}</template>

    <div class="m_modal--field">
      <label for="cahier_title">{{ $t("title") }}</label>
      <input
        id="cahier_title"
        v-model.trim="title"
        type="text"
        required
        maxlength="200"
        autofocus
      />
    </div>

    <div class="m_modal--field">
      <label>{{ $t("manage_access") }}</label>
      <div class="m_modal--box">
        <label class="m_modal--check">
          <input v-model="is_private" type="checkbox" />
          {{ $t("private") }}
        </label>
        <small>
          {{
            is_private ? $t("private_instructions") : $t("public_instructions")
          }}
        </small>
      </div>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("create") }}</template>
  </BaseModal>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import { isReservedTitle } from "@/slugs";
import BaseModal from "./BaseModal.vue";

export default {
  components: { BaseModal },
  emits: ["close", "created"],
  data() {
    return {
      title: "",
      is_private: false,
      is_creating: false,
      error: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["token_path"]),
  },
  methods: {
    ...mapActions(useContentStore, ["createFolder"]),
    async create() {
      if (!this.title || this.is_creating) return;
      this.error = "";
      if (isReservedTitle(this.title))
        return (this.error = this.$t("title_reserved"));
      this.is_creating = true;
      try {
        // the list gets the new cahier from the server's folderCreated event
        const path_to_folder = await this.createFolder("cahiers", {
          title: this.title,
          requested_slug: this.title,
          // adc-core makes folders private when $status is missing
          $status: this.is_private ? "private" : "public",
          $admins: [this.token_path],
          $contributors: [],
        });
        this.$emit("created", path_to_folder);
      } catch (err) {
        this.error =
          err.code === "unique_field_taken"
            ? this.$t("title_taken")
            : this.$t("error_with_code", { code: err.code || err.message });
      } finally {
        this.is_creating = false;
      }
    },
  },
};
</script>
