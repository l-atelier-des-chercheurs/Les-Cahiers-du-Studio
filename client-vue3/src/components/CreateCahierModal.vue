<template>
  <BaseModal @close="$emit('close')">
    <template #title>{{ $t("create_cahier") }}</template>

    <form class="form" @submit.prevent="create">
      <label class="form__field">
        <span class="form__label">{{ $t("title") }}</span>
        <input
          v-model.trim="title"
          type="text"
          required
          maxlength="200"
          autofocus
        />
      </label>

      <label class="form__check">
        <input v-model="is_private" type="checkbox" />
        <span>{{ $t("private") }}</span>
      </label>
      <p class="form__hint">
        {{ is_private ? $t("private_instructions") : $t("public_instructions") }}
      </p>

      <p v-if="error" class="form__error">{{ error }}</p>

      <div class="form__actions">
        <button type="button" class="button" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="submit"
          class="button button--primary"
          :disabled="!title || is_creating"
        >
          {{ $t("create") }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
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
      this.is_creating = true;
      this.error = "";
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
