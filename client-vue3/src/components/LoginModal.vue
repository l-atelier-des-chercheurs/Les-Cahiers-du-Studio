<template>
  <BaseModal
    :disabled="!path_to_author || !password || is_submitting"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #header>{{ $t("login") }}</template>

    <p v-if="!authors && !error" class="m_modal--field font-small">
      {{ $t("loading") }}
    </p>
    <template v-else-if="authors">
      <div class="m_modal--field">
        <label for="login_author">{{ $t("author") }}</label>
        <select id="login_author" v-model="path_to_author" required>
          <option value="" disabled>{{ $t("choose_author") }}</option>
          <option
            v-for="author in authors"
            :key="author.$path"
            :value="author.$path"
          >
            {{ author.name || author.$path.split("/").pop() }}
          </option>
        </select>
      </div>

      <div class="m_modal--field">
        <label for="login_password">{{ $t("password") }}</label>
        <input
          id="login_password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
    </template>

    <!-- only the accounts that exist: none can be made from here -->
    <p class="m_modal--field">
      <small>{{ $t("no_account_creation") }}</small>
    </p>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("login") }}</template>
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
      this.error = this.$t("error_with_code", {
        code: err.code || err.message,
      });
    }
  },
  methods: {
    ...mapActions(useSessionStore, ["login"]),
    async submit() {
      if (!this.path_to_author || !this.password || this.is_submitting) return;
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
