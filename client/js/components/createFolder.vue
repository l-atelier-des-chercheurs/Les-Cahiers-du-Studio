<template>
  <div>
    <button type="button" class="button margin-small" @click="openModal">
      Create Folder
    </button>
  </div>
</template>
<script>
// import SweetModal from '../../../node_modules/sweet-modal-vue/src/components/SweetModal.vue'
import SweetModal from './subcomponents/SweetModal.vue';

export default {
  props: [],
	components: {
		SweetModal
	},
  data() {
    return {
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
    openModal: function() {
      this.$refs.createFolderModal.open();
    }
  }
}

</script>
<style>

</style>
