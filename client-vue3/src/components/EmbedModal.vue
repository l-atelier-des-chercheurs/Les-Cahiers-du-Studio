<template>
  <BaseModal
    :disabled="!url || is_creating"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #header>{{ $t("add_embed") }}</template>

    <div class="m_modal--field">
      <label for="embed_url">{{ $t("url") }}</label>
      <input
        id="embed_url"
        v-model.trim="url"
        type="url"
        required
        placeholder="https://"
        autofocus
      />
      <small>{{ $t("embed_instructions") }}</small>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("add") }}</template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";

// Asks for the URL of an embed. The parent creates the media:
// it emits "submit" with the URL, then sets is_creating / error as props.
export default {
  components: { BaseModal },
  props: {
    is_creating: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  emits: ["close", "submit"],
  data() {
    return {
      url: "",
    };
  },
  methods: {
    submit() {
      if (!this.url || this.is_creating) return;
      this.$emit("submit", this.url);
    },
  },
};
</script>
