<template>
  <!-- v2's TextEditor.vue: a basic Quill editor, whose content is saved as
  HTML. Quill and its styles load with the first text edited. -->
  <div class="m_textEditor">
    <div ref="editor" />
  </div>
</template>

<script>
import { renderText } from "@/markdown";

// v2's toolbar
const TOOLBAR = [
  [{ header: [false, 1, 2] }],
  ["italic", "underline", "link", "blockquote"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];
const FORMATS = ["italic", "underline", "link", "header", "blockquote", "list"];

export default {
  props: {
    // HTML, or Markdown for the first texts: shown as HTML, saved as HTML
    // once edited
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      // the HTML last emitted: a modelValue from elsewhere (another media,
      // changes discarded) is loaded again
      emitted: undefined,
    };
  },
  watch: {
    modelValue(value) {
      if (value !== this.emitted) this.load(value);
    },
  },
  async mounted() {
    const [{ default: Quill }] = await Promise.all([
      import("quill"),
      import("quill/dist/quill.snow.css"),
    ]);
    if (!this.$refs.editor) return;
    this.quill = new Quill(this.$refs.editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR },
      formats: FORMATS,
      placeholder: this.placeholder,
    });
    this.quill.root.classList.add("markdown");
    this.load(this.modelValue);
    // only the user's changes: loading a text doesn't make it unsaved
    this.quill.on("text-change", (delta, old_delta, source) => {
      if (source !== "user") return;
      this.emitted = this.html();
      this.$emit("update:modelValue", this.emitted);
    });
  },
  beforeUnmount() {
    this.quill?.off("text-change");
  },
  methods: {
    load(value) {
      if (!this.quill) return;
      this.emitted = value;
      const delta = this.quill.clipboard.convert({ html: renderText(value) });
      this.quill.setContents(delta, "silent");
    },
    // real <ul>/<ol>; Quill writes every space as &nbsp;, which wouldn't
    // wrap
    html() {
      if (!this.quill.getText().trim()) return "";
      return this.quill.getSemanticHTML().replaceAll("&nbsp;", " ");
    },
  },
};
</script>

<style lang="scss" scoped>
.m_textEditor {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  min-height: 0;
  background-color: white;
  color: black;

  :deep(.ql-toolbar) {
    flex: 0 0 auto;
    border: none;
    border-bottom: 1px solid var(--c-gris_clair);
  }
  :deep(.ql-container) {
    flex: 1 1 auto;
    min-height: 0;
    border: none;
    font: inherit;
  }
  // as the text is shown (.markdown, assets/main.scss), over Quill's theme
  :deep(.ql-editor) {
    padding: var(--spacing-medium);
    line-height: 1.5;

    > :first-child {
      margin-top: 0;
    }
    h1,
    h2 {
      margin: var(--spacing-medium) 0 var(--spacing-small);
      font-weight: normal;
    }
    h1 {
      font-size: 1.5em;
    }
    h2 {
      font-size: 1.25em;
    }
    p,
    ol,
    ul,
    blockquote {
      margin: 0 0 var(--spacing-small);
    }
    blockquote {
      padding-left: var(--spacing-small);
      border-left: 2px solid var(--c-gris_clair);
      color: var(--c-gris_fonce);
    }
    &.ql-blank::before {
      left: var(--spacing-medium);
      right: var(--spacing-medium);
      color: var(--c-gris);
    }
  }
}
</style>
