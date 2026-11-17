<template>
  <!-- a native modal dialog: focus trap, Escape and backdrop come with it -->
  <dialog
    ref="dialog"
    class="modal"
    @cancel.prevent="$emit('close')"
    @click="onClick"
  >
    <div class="modal__inner">
      <header class="modal__header">
        <h2 class="modal__title"><slot name="title" /></h2>
        <button
          type="button"
          class="modal__close"
          :aria-label="$t('close')"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>

<script>
export default {
  emits: ["close"],
  mounted() {
    this.$refs.dialog.showModal();
  },
  methods: {
    // a click on the backdrop targets the dialog itself
    onClick(event) {
      if (event.target === this.$refs.dialog) this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  width: min(28rem, calc(100vw - 2rem));
  padding: 0;
  border: none;
  border-radius: var(--radius);
  background: var(--c-surface);
  color: var(--c-text);
  box-shadow: 0 1rem 3rem rgb(0 0 0 / 20%);

  &::backdrop {
    background: rgb(0 0 0 / 35%);
  }
}

.modal__inner {
  padding: 1.25rem 1.5rem 1.5rem;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal__title {
  margin: 0;
  font-size: 1.15rem;
}

.modal__close {
  padding: 0 0.4rem;
  border: none;
  background: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--c-muted);
  cursor: pointer;

  &:hover {
    color: var(--c-text);
  }
}
</style>
