<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container padding-small" @click.stop :class="{ 'is--large' : size === 'large' }">

          <button class="close_button padding-medium" @click="$emit('close')">
            ✕
          </button>

          <div class="modal-header padding-small">
            <slot name="header">
              default header
            </slot>
          </div>

          <div class="modal-body padding-small">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer padding-small">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>

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
.modal-mask {
  position: fixed;
  z-index: 10001;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255, .7);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  position: relative;
  max-height: 100vh;
  overflow-y: scroll;
  width: 90%;
  max-width: 1024px;

  margin: 0px auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;

  display: flex;
  flex-flow: row wrap;

  .modal-header {
    flex: 1 100%;
  }
  .modal-body {
    flex: 3 1 70%;

    textarea.mediaTextContent {
      min-height: 60vh;
    }
  }
  .modal-footer {
    flex: 1 0 30%;
  }

  &.is--large {
    width: 90vw;
  }

  .close_button {
    position: absolute;
    top:0;
    right:0;
  }


}

.modal-header {
  margin-top: 0;
  color: #42b983;

  :first-child {
    margin-top: 0;
  }
}

.modal-default-button {
  float: right;
}

@media print {
  .m_timeline-container {
    display: none;
  }
  .modal-header {
    display: none;
  }
  .modal-footer {
    display: none;
  }
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.06);
  transform: scale(1.06);
}
</style>