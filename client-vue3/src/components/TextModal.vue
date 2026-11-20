<template>
  <!-- a text, from the + button: a plain field, to focus on writing (on
  phones too). Formatting comes later, in the media's window (Quill). The
  parent creates it: it emits "submit" with the text as HTML, then sets
  is_creating / error as props. The draft is the parent's (v-model), kept
  if the window is closed by mistake. -->
  <BaseModal
    :disabled="!has_text || is_creating"
    :busy="is_creating"
    :progress="upload_progress"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #header>{{ $t("add_text") }}</template>

    <div class="m_modal--field">
      <label for="text_content">{{ $t("text") }}</label>
      <textarea
        id="text_content"
        class="m_textModal--input"
        :value="modelValue"
        rows="10"
        :placeholder="$t('text_placeholder')"
        autofocus
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter.meta.exact.prevent="submit"
        @keydown.enter.ctrl.exact.prevent="submit"
      />
      <small>{{ $t("text_instructions") }}</small>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("add") }}</template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";

// as Quill writes it (TextEditor.vue): a paragraph per line, an empty
// paragraph per empty line
function toHTML(text) {
  const escape = (line) =>
    line
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => `<p>${escape(line) || "<br>"}</p>`)
    .join("");
}

export default {
  components: { BaseModal },
  props: {
    modelValue: { type: String, default: "" },
    is_creating: { type: Boolean, default: false },
    // 0 to 1 while sent, if known (BaseModal's spinner)
    upload_progress: { type: Number, default: null },
    error: { type: String, default: "" },
  },
  emits: ["close", "submit", "update:modelValue"],
  computed: {
    has_text() {
      return !!this.modelValue.trim();
    },
  },
  methods: {
    submit() {
      if (this.has_text && !this.is_creating)
        this.$emit("submit", toHTML(this.modelValue));
    },
  },
};
</script>

<style lang="scss" scoped>
// 16px at least: iOS zooms in on smaller fields
.m_textModal--input {
  min-height: 12rem;
  font-size: max(1rem, 16px);
  line-height: 1.5;
  resize: vertical;
}
</style>
