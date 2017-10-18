<template>
  <transition name="modal">
    <div class="m_modal--mask" @click="$emit('close')">
      <div class="m_modal--wrapper">
        <div class="m_modal--container"
          @click.stop
          :class="[{
            'is--large' : !!this.$slots['preview']
          }, 'color-' + backgroundColor]"
          @keyup.ctrl.enter="$emit('submit')"
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

              <form v-if="!!this.$slots['sidebar']"
                class="padding-medium"
                v-on:submit.prevent="$emit('submit')"
                >
                <slot name="sidebar">
                  default sidebar
                </slot>

                <button v-if="!!this.$slots['submit_button']"
                  class="m_modal--save bg-transparent button-round margin-verysmall padding-verysmall float-right"
                  type="submit"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="24" style="fill: #22b573"/>
                    <polyline points="35.48 13.74 22.2 36.41 12.81 25.55" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                  </svg>

                  <span class="text-cap font-verysmall">
                    <slot name="submit_button">
                      Enregistrer
                    </slot>
                  </span>
                </button>
              </form>

            </div>
            <div v-if="!!this.$slots['preview']" class="m_modal--preview flex-size-3/5 flex-collapse-on-mobile">
              <slot name="preview">
                default preview
              </slot>
            </div>

          </div>

          <button class="button-round bg-transparent m_modal--close_button"  @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
              <g id="Calque_2" data-name="Calque 2">
                <g id="Editeur_txt" data-name="Editeur txt">
                  <circle cx="24" cy="24" r="24" style="fill: #ff3b4c"/>
                  <g>
                    <line x1="13.33" y1="13.33" x2="34.67" y2="34.67" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                    <line x1="13.33" y1="34.67" x2="34.67" y2="13.33" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                  </g>
                </g>
              </g>
            </svg>
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
    modalKeyListener: function(evt) {
      if (evt.keyCode === 27) {
        this.$emit('close');
      }
    }
  },
  created: function () {
    window.addEventListener('keyup', this.modalKeyListener);
    document.body.classList.add(className);
    this.$root.settings.has_modal_opened = true;
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.modalKeyListener);
    document.body.classList.remove(className);
    this.$root.settings.has_modal_opened = false;
  },
}
</script>

<style lang="sass">

</style>