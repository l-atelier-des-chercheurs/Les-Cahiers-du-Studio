<template>
  <!-- v2's BaseModal, typeOfModal "EditMeta" (less/_modal.less, and its
  overrides in style.less): a 400px panel on a black veil, a black header,
  dark grey fields and a wide green submit button.
  A native modal dialog: focus trap and Escape come with it.
  Fields go in the default slot, as
    <div class="m_modal--field"><label>…</label><input /></div>
  or, grouped in a black box,
    <div class="m_modal--field"><label>…</label><div class="m_modal--box">…</div></div>
  (styles in assets/main.scss) -->
  <dialog
    ref="dialog"
    class="m_modal"
    :class="{ 'is--wide': wide }"
    @cancel.prevent="$emit('close')"
    @click="onClick"
  >
    <form class="m_modal--container" @submit.prevent="$emit('submit')">
      <header class="m_modal--header">
        <h3 class="text-cap"><slot name="header" /></h3>
      </header>

      <div class="m_modal--fields">
        <slot />
      </div>

      <button
        v-if="$slots.submit_button"
        type="submit"
        class="m_modal--save"
        :disabled="disabled"
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <polyline points="35.48 13.74 22.2 36.41 12.81 25.55" />
        </svg>
        <span class="text-cap font-verysmall">
          <slot name="submit_button" />
        </span>
      </button>
    </form>

    <button
      type="button"
      class="button-round m_modal--close_button"
      :aria-label="$t('close')"
      @click="$emit('close')"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <line x1="13.33" y1="13.33" x2="34.67" y2="34.67" />
        <line x1="13.33" y1="34.67" x2="34.67" y2="13.33" />
      </svg>
    </button>
  </dialog>
</template>

<script>
export default {
  props: {
    // disables the submit button
    disabled: { type: Boolean, default: false },
    // a larger panel, for lists (the import modal)
    wide: { type: Boolean, default: false },
  },
  emits: ["close", "submit"],
  mounted() {
    this.$refs.dialog.showModal();
  },
  methods: {
    // the dialog fills the window: a click outside the panel targets it
    onClick(event) {
      if (event.target === this.$refs.dialog) this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.m_modal {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0;
  padding: var(--spacing-medium) var(--spacing-small);
  border: none;
  background: rgb(0 0 0 / 87%);
  color: white;

  // the veil is the dialog itself
  &::backdrop {
    background: transparent;
  }

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media screen and (max-width: 50rem) {
    padding: 0;

    &[open] {
      align-items: flex-start;
    }
  }
}

.m_modal--container {
  width: 100%;
  max-width: 400px;
  margin: auto;
  background-color: var(--c-noir_light);

  .is--wide & {
    max-width: 800px;
  }
}

.m_modal--header {
  padding: var(--spacing-medium);
  background-color: var(--c-noir);
  color: white;

  h3 {
    font-weight: normal;
    font-size: inherit;
    line-height: 1.6;

    &::before {
      content: "● ";
    }
  }
}

.m_modal--fields {
  padding: var(--spacing-small) 0;
}

.m_modal--save {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-small);
  width: 100%;
  padding: var(--spacing-small);
  border-radius: 0;
  // dark text: white on this green is too faint (2.6:1, here 6:1)
  background-color: var(--c-vert_vif);
  color: var(--c-noir);

  &:disabled {
    opacity: 1;
    background-color: var(--c-gris);
    color: white;
  }

  svg {
    width: 48px;
    height: 48px;
    fill: none;
    stroke: currentColor;
    stroke-miterlimit: 10;
    stroke-width: 2px;
  }

  span {
    letter-spacing: 0.1em;
  }

  @media screen and (max-width: 50rem) {
    padding: var(--spacing-verysmall);
  }
}

.m_modal--close_button {
  position: fixed;
  top: 0;
  right: 0;
  padding: var(--spacing-verysmall);

  line {
    fill: none;
    stroke: var(--c-gris_clair);
    stroke-miterlimit: 10;
    stroke-width: 3px;
  }

  &:hover line {
    stroke: white;
  }
}
</style>
