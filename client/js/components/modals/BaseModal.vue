<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop :class="{ 'is--large' : size === 'large' }">

          <div class="modal-header padding-medium bg-noir c_blanc">
            <h3 class="text-cap margin-none">
              <slot name="header">
                default header
              </slot>
            </h3>
          </div>

          <div class="modal-sidebar padding-small">
            <slot name="sidebar">
              default sidebar
            </slot>
          </div>

          <div class="modal-preview padding-small">
            <slot name="preview">
              default preview
            </slot>
          </div>

          <button class="close_button padding-medium" @click="$emit('close')">
            ✕
          </button>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
let className = 'is_unscrollable';

export default {
  name: 'BaseModal',
  props: ['size'],
  data() {
    return {
    }
  },
  methods: {
    escapeKeyListener: function(evt) {
      if (evt.keyCode === 27) {
        this.$emit('close');
      }
    }
  },
  created: function () {
    window.addEventListener('keyup', this.escapeKeyListener);
    document.body.classList.add(className);
    this.$root.settings.has_modal_opened = true;
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.escapeKeyListener);
    document.body.classList.remove(className);
    this.$root.settings.has_modal_opened = false;
  },
}
</script>

<style lang="sass">

</style>