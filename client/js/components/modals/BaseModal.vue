<template>
  <transition name="modal">
    <div class="m_modal--mask" @click="$emit('close')">
      <div class="m_modal--wrapper">
        <div class="m_modal--container"
          @click.stop
          :class="[{
            'is--large' : size === 'large'
          }, 'color-' + backgroundColor]"
          >

          <div class="flex-wrap flex-vertically-stretched ">
            <div class="m_modal--sidebar flex-size-2/5 flex-collapse-on-mobile bg-noir_light c_blanc">

              <div class="m_modal--header padding-medium bg-noir c_blanc">
                <h3 class="margin-none with-bullet">
                  <slot name="header">
                      default header
                  </slot>
                </h3>
              </div>

              <div class="padding-medium">
                <slot name="sidebar">
                  default sidebar
                </slot>
              </div>
            </div>

            <div class="m_modal--preview flex-size-3/5 flex-collapse-on-mobile">
              <slot name="preview">
                default preview
              </slot>
            </div>
          </div>

          <button class="m_modal--close_button" @click="$emit('close')">
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
  props: {
    size: String,
    backgroundColor: {
      type: String,
      default: 'white'
    }
  },
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