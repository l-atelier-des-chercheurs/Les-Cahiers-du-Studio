<template>
  <portal to="modal_container">
    <div 
      class="m_modal--mask"
      :class="[ 
        'typeOfModal-' + typeOfModal, 
        { 'is_invisible' : !showModal },
        { 'is_minimized' : is_minimized }
      ]"
      @mousedown.self="closeModal"
      :style="`height: ${$root.settings.windowHeight}px`"
    >
      <div class="m_modal--container"
        :class="[
          { 'is_invisible' : !showModal },
          { 'is_minimized' : is_minimized }
        ]"
        :style="!!backgroundColor ? `--background-color: ${backgroundColor}` : ''"
        @keyup.ctrl.enter="$emit('submit')"
      >
        <div
          class="m_modal--container--content"
          ref="modalContent"
        >
          <div v-if="!!this.$slots['preview']" class="m_modal--preview">
            <!-- if there is no sidebar, output header here -->
            <template v-if="!this.$slots['sidebar']">
              <div class="m_modal--header">
                <h3 class="margin-none">
                  
                  <slot name="header">
                      default header
                  </slot>
                </h3>
              </div>
            </template>

            <slot name="preview">
              default preview
            </slot>
          </div>
          
          <form
            class="m_modal--sidebar"
            :class="{ 'is_collapsed' : !show_sidebar }"
            v-on:submit.prevent="$emit('submit')"
            v-if="!!this.$slots['sidebar'] && !is_minimized"
            ref="form"
          >
            <button type="button" 
              class="m_modal--sidebar--toggle"
              @click="toggleSidebar"
            > 
              &#x2630;
            </button>

            <template v-if="!!this.$slots['sidebar'] && show_sidebar && !is_minimized">
              <div class="m_modal--header">
                <h3 class="margin-none">
                  <slot name="header">
                      default header
                  </slot>
                </h3>
              </div>

              <div class="m_modal--metaOptions">
                <slot name="sidebar">
                  default sidebar
                </slot>
              </div>

              <div 
                v-if="!!this.$slots['submit_button']"
                class="m_modal--buttons"
              >
                <button
                  type="submit"
                  :disabled="read_only"
                  class="button m_modal--buttons--save button-bg_rounded bg-bleuvert"
                >
                  <span class="text-cap font-verysmall">
                    <slot name="submit_button">
                      {{ $t('save') }}
                    </slot>
                  </span>
                </button>
              </div>
            </template>
          </form>

          <form 
            v-if="!!this.$slots['buttons']" 
            class="m_modal--buttons"
            v-on:submit.prevent="$emit('submit')"
            ref="form"
          >

            <button
              type="button"
              @click="closeModal"
              class="button button-bg_rounded bg-orange"
            >
              <span class="text-cap font-verysmall">
                <slot name="cancel_button">
                  {{ $t('cancel') }}
                </slot>
              </span>
            </button>

            <button
              type="submit"
              :disabled="read_only"
              class="button button-bg_rounded bg-bleuvert"
            >
              <span class="text-cap font-verysmall">
                <slot name="submit_button">
                  {{ $t('save') }}
                </slot>
              </span>
            </button>


          </form>

        </div>

      </div>

      <transition name="fade" :duration="600">
        <button
          class="button-round m_modal--close_button padding-verysmall"
          @click="closeModal"
          v-if="showModal && !is_minimized"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <line x1="13.33" y1="13.33" x2="34.67" y2="34.67"/>
            <line x1="13.33" y1="34.67" x2="34.67" y2="13.33"/>
          </svg>
        </button>
      </transition>

      <transition name="fade" :duration="600">
        <button
          class="button-round bg-blanc m_modal--minimize padding-verysmall"
          @click="toggleMinimize"
          v-if="showModal && can_minimize"
          :class="{ 'is_minimized' : is_minimized }"
        >
          <!-- <img src="/images/i_minimize.svg"> -->
        </button>
      </transition>

      <transition name="fade" :duration="600">
        <button
          class="button-round bg-blanc m_modal--nav m_modal--nav_left padding-verysmall"
          @click="arrowLeft()"
          v-if="showModal && arrow_navigation && !is_minimized"
        >
          ←
        </button>
      </transition>

      <transition name="fade" :duration="600">
        <button
          class="button-round bg-blanc m_modal--nav m_modal--nav_right padding-verysmall"
          @click="arrowRight()"
          v-if="showModal && arrow_navigation && !is_minimized"
        >
          →
        </button>
      </transition>

    </div>
  </portal>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    backgroundColor: {
      type: String,
      default: 'white'
    },
    read_only: {
      type: Boolean,
      default: true
    },
    typeOfModal: {
      type: String,
      default: 'EditMeta'
    },
    askBeforeClosingModal: {
      type: Boolean,
      default: false
    },
    isFile: {
      type: Boolean,
      default: false
    },
    show_sidebar: {
      type: Boolean,
      default: true
    },
    can_minimize: {
      type: Boolean,
      default: false
    },
    arrow_navigation: {
      type: Boolean,
      default: false
    },
    is_minimized: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showModal: false,
      windowHeight: window.innerHeight
    };
  },
  mounted: function() {
    console.log(`MOUNTED • BaseModal`)

    setTimeout(() => {
      this.showModal = true;

      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if(this.$refs.modalContent && this.$refs.modalContent.querySelector('[autofocus]')) {
          const el = this.$refs.modalContent.querySelector('[autofocus]');
          if(el.classList.contains('quillWrapper')) {
            el.querySelector('.ql-editor').focus();
          }  else {
            el.focus();
          }
        }

        if (this.isFile && this.$refs.form){
          this.$refs.form.setAttribute('enctype', 'multipart/form-data');
        }

      }
    },100);
  },
  computed: {
  },
  methods: {
    modalKeyListener: function(event) {
      if (window.state.dev_mode === 'debug') {
        console.log('METHODS • BaseModal: modalKeyListener');
      }
      
      if (event.key === 'Escape') {
        this.closeModal();
        return
      }

      if (event.target.tagName.toLowerCase() === 'input' 
        || event.target.tagName.toLowerCase() === 'textarea'
        || event.target.className.includes('ql-editor')
      ) {
        return;
      }  
      
      if (event.key === 'ArrowRight') {
        this.arrowRight();
        return;
      }
      if (event.key === 'ArrowLeft') {
        this.arrowLeft();
        return;
      }
    },
    closeModal: function() {
      console.log(`METHODS • BaseModal: closeModal with askBeforeClosingModal = ${this.askBeforeClosingModal}`)
      if(this.askBeforeClosingModal) {
        if (!window.confirm(this.$t('sureToCloseModal'))) {
          console.log(`METHODS • BaseModal: closeModal refused`)
          return;
        }
      }
      this.showModal = false;
      setTimeout(() => {
        this.$emit('close');
      }, 400);
    },
    arrowLeft: function() {
      console.log(`METHODS • BaseModal: arrowLeft with askBeforeClosingModal = ${this.askBeforeClosingModal}`)
      if(this.askBeforeClosingModal) {
        if (!window.confirm(this.$t('sureToCloseModal'))) {
          return;
        }
      }
      this.$emit('arrow_left');
    },
    arrowRight: function() {
      console.log(`METHODS • BaseModal: arrowRight with askBeforeClosingModal = ${this.askBeforeClosingModal}`)
      if(this.askBeforeClosingModal) {
        if (!window.confirm(this.$t('sureToCloseModal'))) {
          return;
        }
      }
      this.$emit('arrow_right');
    },
    toggleMinimize: function() {
      console.log(`METHODS • BaseModal: toggleMinimize`);
      this.$root.media_modal.minimized = !this.$root.media_modal.minimized;
    },
    toggleSidebar: function() {
      console.log(`METHODS • BaseModal: toggleSidebar`);
      this.$root.media_modal.show_sidebar = !this.$root.media_modal.show_sidebar;
    }
  },
  created: function() {
    document.addEventListener('keyup', this.modalKeyListener);
    document.body.classList.add('has_modal_opened');
    this.$root.settings.has_modal_opened = true;
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.modalKeyListener);
    document.body.classList.remove('has_modal_opened');
    this.$root.settings.has_modal_opened = false;
  }
};
</script>