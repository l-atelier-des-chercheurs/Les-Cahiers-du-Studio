<template>
  <Modal @close="$emit('close')">
    <div slot="header">
      Edit a folder
    </div>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: ['slugFolderName', 'folder'],
  components: {
    Modal,
  }
}
</script>