<template>
  <!-- v2's BaseModal, typeOfModal "EditMeta" (less/_modal.less, and its
  overrides in style.less): a 400px panel on a black veil, a black header,
  dark grey fields and a wide green submit button.
  A native modal dialog: the focus trap comes with it. Escape closes the
  window on top (open_modals, below).
  Fields go in the default slot, as
    <div class="m_modal--field"><label>…</label><input /></div>
  or, grouped in a black box,
    <div class="m_modal--field"><label>…</label><div class="m_modal--box">…</div></div>
  (styles in assets/main.scss).
  With a "preview" slot, the panel fills the window: the header, fields
  and button in a column on the left, easier to read, the preview on the
  right (v2's typeOfModal "LargeAndNoScroll", for medias). On narrow
  screens, the preview on top -->
  <dialog
    ref="dialog"
    class="m_modal"
    :class="{ 'is--wide': wide }"
    @cancel.prevent="$emit('close')"
    @click="onClick"
  >
    <!-- the panel, and under it the "nav" slot (the media window's ←
    and →). Given a slide_key, a new key slides the panel out and back in,
    from the side of slide_direction -->
    <div
      ref="stack"
      class="m_modal--stack"
      :class="{ 'has--nav': !!$slots.nav }"
    >
      <Transition :name="`m_modal-slide-${slide_direction}`" mode="out-in">
        <form
          :key="slide_key"
          class="m_modal--container"
          :class="{
            'has--preview': !!$slots.preview,
            'has--previewHeight': !!mobile_preview_height,
          }"
          :style="
            mobile_preview_height && {
              '--mobile-preview-height': mobile_preview_height,
            }
          "
          @submit.prevent="$emit('submit')"
        >
          <div v-if="$slots.preview" class="m_modal--preview">
            <slot name="preview" />
          </div>

          <div class="m_modal--sidebar">
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
              :class="{ 'is--busy': busy }"
              :disabled="disabled || busy"
              :aria-busy="busy"
            >
              <!-- while sent: a ring filled as it goes, or turning when
              how far it is isn't known (yet, or anymore: the server is
              saving it) -->
              <svg
                v-if="busy"
                viewBox="0 0 48 48"
                class="m_modal--spinner"
                :class="{ 'is--indeterminate': !has_progress }"
                aria-hidden="true"
              >
                <circle class="_track" cx="24" cy="24" r="12" />
                <circle
                  class="_value"
                  cx="24"
                  cy="24"
                  r="12"
                  pathLength="100"
                  :stroke-dasharray="`${has_progress ? progress * 100 : 25} 100`"
                />
              </svg>
              <svg v-else viewBox="0 0 48 48" aria-hidden="true">
                <polyline points="35.48 13.74 22.2 36.41 12.81 25.55" />
              </svg>
              <span class="text-cap font-verysmall" role="status">
                <template v-if="busy">
                  {{ $t("sending") }}
                  <template v-if="has_progress">
                    {{ Math.round(progress * 100) }} %
                  </template>
                </template>
                <slot v-else name="submit_button" />
              </span>
            </button>
          </div>
        </form>
      </Transition>

      <div v-if="$slots.nav" class="m_modal--nav">
        <slot name="nav" />
      </div>
    </div>

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
// The open windows, the last one on top. Escape closes only that one:
// handled here rather than by the dialog's cancel event, which Chrome
// skips on a second Escape without a click in between (the dialog then
// closes by itself, still shown by Vue), and which lets Escape reach the
// page under it (AddMedias' menu, the search)
const open_modals = [];
function onEscape(event) {
  if (event.key !== "Escape" || event.isComposing) return;
  const top = open_modals.at(-1);
  if (!top) return;
  event.preventDefault();
  event.stopPropagation();
  top.$emit("close");
}

export default {
  props: {
    // disables the submit button
    disabled: { type: Boolean, default: false },
    // a larger panel, for lists (the import modal)
    wide: { type: Boolean, default: false },
    // changing it slides the panel (the media window, to another media)
    slide_key: { type: String, default: "" },
    // "next": the new panel comes from the right; "prev": from the left
    slide_direction: { type: String, default: "next" },
    // on narrow screens, the preview's height (a CSS length) instead of
    // 45% of the window: a sound's player needs little
    mobile_preview_height: { type: String, default: "" },
    // being sent: the submit button turns into a spinner
    busy: { type: Boolean, default: false },
    // 0 to 1 while busy, if known: shown on the spinner, in %
    progress: { type: Number, default: null },
  },
  emits: ["close", "submit"],
  computed: {
    // all sent, the server still saving it: as unknown
    has_progress() {
      return this.progress !== null && this.progress < 1;
    },
  },
  mounted() {
    this.$refs.dialog.showModal();
    if (!open_modals.length)
      window.addEventListener("keydown", onEscape, { capture: true });
    open_modals.push(this);
  },
  // Closing: the window is removed at once by whoever opened it. A copy
  // stays just long enough to fade out (.is--closing), inert, with what
  // was typed in its fields.
  beforeUnmount() {
    const index = open_modals.indexOf(this);
    if (index !== -1) open_modals.splice(index, 1);
    if (!open_modals.length)
      window.removeEventListener("keydown", onEscape, { capture: true });

    const dialog = this.$refs.dialog;
    if (
      !dialog ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const ghost = dialog.cloneNode(true);
    const fields = "input, textarea, select";
    const values = [...dialog.querySelectorAll(fields)].map((f) => f.value);
    ghost
      .querySelectorAll(fields)
      .forEach((field, i) => (field.value = values[i] ?? field.value));
    ghost.inert = true;
    ghost.classList.add("is--closing");
    document.body.appendChild(ghost);
    const remove = () => ghost.remove();
    ghost.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, 400);
  },
  methods: {
    // the dialog fills the window: a click outside the panel targets it,
    // or the stack around the panel and its nav
    onClick(event) {
      if (
        event.target === this.$refs.dialog ||
        event.target === this.$refs.stack
      )
        this.$emit("close");
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
  background: rgb(0 0 0 / 77%);
  color: white;
  // always clickable, even opened from a container that lets clicks
  // through (the + button, AddMedias.vue)
  pointer-events: auto;

  // the veil is the dialog itself
  &::backdrop {
    background: transparent;
  }

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: m_modal-veil 0.8s ease-out;
  }

  @media screen and (max-width: 50rem) {
    padding: 0;

    &[open] {
      align-items: flex-start;
    }
  }
}

// on opening: the veil fades in, the panel rises a little
@keyframes m_modal-veil {
  from {
    background-color: transparent;
  }
}
@keyframes m_modal-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

// the copy left when closing (beforeUnmount): fades out, the panel sinks a
// little
.m_modal.is--closing {
  position: fixed;
  inset: 0;
  z-index: 100000;
  // placed as when open ([open], kept by the copy)
  animation: m_modal-veil-out 0.18s ease-in forwards;

  .m_modal--stack {
    animation: m_modal-sink 0.18s ease-in forwards;
  }
}
@keyframes m_modal-veil-out {
  to {
    background-color: transparent;
  }
}
@keyframes m_modal-sink {
  to {
    opacity: 0;
    transform: translateY(12px);
  }
}

// the panel and its nav: rises once, when opened (the panel itself is
// replaced when it slides)
.m_modal--stack {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--spacing-small);
  width: 100%;
  margin: auto;
  animation: m_modal-rise 0.35s cubic-bezier(0.19, 1, 0.22, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// under the panel, centred; fixed at the bottom of small screens, where
// the panel fills them
.m_modal--nav {
  flex: 0 0 auto;

  @media screen and (max-width: 50rem) {
    position: fixed;
    bottom: max(var(--spacing-small), env(safe-area-inset-bottom, 0px));
    left: 50%;
    z-index: 1;
    transform: translateX(-50%);
  }
}

// to another media: out to one side, in from the other
.m_modal-slide-next-enter-active,
.m_modal-slide-prev-enter-active {
  transition:
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.2s;
}
.m_modal-slide-next-leave-active,
.m_modal-slide-prev-leave-active {
  transition:
    transform 0.15s ease-in,
    opacity 0.15s ease-in;
}
.m_modal-slide-next-enter-from,
.m_modal-slide-prev-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.m_modal-slide-next-leave-to,
.m_modal-slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
@media (prefers-reduced-motion: reduce) {
  .m_modal-slide-next-enter-active,
  .m_modal-slide-prev-enter-active,
  .m_modal-slide-next-leave-active,
  .m_modal-slide-prev-leave-active {
    transition: none;
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

  // the preview, and a column on its right
  &.has--preview {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    grid-template-areas: "sidebar preview";
    max-width: 1400px;
    height: calc(100dvh - 2 * var(--spacing-medium));
    background-color: black;

    // room for the nav under it
    .has--nav > & {
      height: calc(100dvh - 2 * var(--spacing-medium) - 3rem);
    }

    @media screen and (max-width: 50rem) {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(0, 45%) minmax(0, 1fr);
      grid-template-areas: "preview" "sidebar";
      height: 100dvh;

      &.has--previewHeight {
        grid-template-rows: var(--mobile-preview-height) minmax(0, 1fr);
      }
    }
  }
}

.m_modal--preview {
  grid-area: preview;
  position: relative;
  min-width: 0;
  min-height: 0;
}

.m_modal--sidebar {
  grid-area: sidebar;
  display: flex;
  flex-flow: column nowrap;
  min-height: 0;
  background-color: var(--c-noir_light);

  .has--preview & .m_modal--fields {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
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
    font-variant-numeric: tabular-nums;
  }

  // still green while sent: it is on its way, not unavailable
  &.is--busy:disabled {
    background-color: var(--c-vert_vif);
    color: var(--c-noir);
    cursor: progress;
  }

  @media screen and (max-width: 50rem) {
    padding: var(--spacing-verysmall);
  }
}

.m_modal--spinner {
  circle {
    fill: none;
    stroke-width: 3px;
  }
  ._track {
    opacity: 0.25;
  }
  // from the top, clockwise
  ._value {
    transform: rotate(-90deg);
    transform-origin: center;
    transition: stroke-dasharray 0.2s linear;
  }
  &.is--indeterminate {
    animation: m_modal-spin 0.9s linear infinite;
  }
}
@keyframes m_modal-spin {
  to {
    transform: rotate(360deg);
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
