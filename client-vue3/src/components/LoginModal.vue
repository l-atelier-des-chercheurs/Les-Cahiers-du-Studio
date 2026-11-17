<template>
  <BaseModal @close="$emit('close')">
    <template #title>{{ $t("login") }}</template>

    <p v-if="!authors && !error" class="form__hint">{{ $t("loading") }}</p>
    <form v-else-if="authors" class="form" @submit.prevent="submit">
      <label class="form__field">
        <span class="form__label">{{ $t("author") }}</span>
        <select v-model="path_to_author" required>
          <option value="" disabled>{{ $t("choose_author") }}</option>
          <option
            v-for="author in authors"
            :key="author.$path"
            :value="author.$path"
          >
            {{ author.name || author.$path.split("/").pop() }}
          </option>
        </select>
      </label>

      <label class="form__field">
        <span class="form__label">{{ $t("password") }}</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>

      <p v-if="error" class="form__error">{{ error }}</p>

      <div class="form__actions">
        <button type="button" class="button" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="submit"
          class="button button--primary"
          :disabled="!path_to_author || !password || is_submitting"
        >
          {{ $t("login") }}
        </button>
      </div>
    </form>
    <p v-if="error && !authors" class="form__error">{{ error }}</p>
  </BaseModal>
</template>

<script>
import { mapActions } from "pinia";
import * as api from "@/adc/api";
import { useSessionStore } from "@/stores/session";
import BaseModal from "./BaseModal.vue";

export default {
  components: { BaseModal },
  emits: ["close"],
  data() {
    return {
      authors: undefined,
      path_to_author: "",
      password: "",
      is_submitting: false,
      error: "",
    };
  },
  async created() {
    try {
      const authors = await api.getFolders("authors");
      this.authors = authors.sort((a, b) =>
        String(a.name ?? a.$path).localeCompare(String(b.name ?? b.$path))
      );
    } catch (err) {
      this.error = this.$t("error_with_code", { code: err.code || err.message });
    }
  },
  methods: {
    ...mapActions(useSessionStore, ["login"]),
    async submit() {
      this.is_submitting = true;
      this.error = "";
      try {
        await this.login(this.path_to_author, this.password);
        this.$emit("close");
      } catch (err) {
        this.error = [401, 403].includes(err.status)
          ? this.$t("wrong_password")
          : this.$t("error_with_code", { code: err.code || err.message });
      } finally {
        this.is_submitting = false;
      }
    },
  },
};
</script>
