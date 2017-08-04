<template>
  <div>

    <button type="button" class="button margin-small" @click="showModal = true">
      Create Folder
    </button>

    <modal v-if="showModal" @close="showModal = false">

      <h3 slot="header">
        Create a folder
      </h3>

      <div slot="body">
        <div class="mark">fields with a * are required</div>

        <div class="input-single">
          <label>Name</label>
          <input type="text">
        </div>


      </div>
      <div slot="footer">
        <button class="modal-default-button" @click="showModal = false">
          Annuler
        </button>
        <button class="modal-default-button button-success" @click="newFolder()">
          Valider
        </button>
      </div>
    </modal>

  </div>
</template>
<script>
import modal from './subcomponents/modal.vue';

export default {
  components: {
    modal
  },
  data() {
    return {
      showModal: false
    }
  },
  computed: {
  },
  methods: {
    newFolder() {
      debugger;
    }
  }
}

</script>
<style>

</style>
