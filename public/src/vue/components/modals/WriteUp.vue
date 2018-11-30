<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'Writeup'"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('writeup') }}</span>
    </template>
    <template slot="preview">
      <VueEditor 
        v-model="writeupContent"
        @text-change="textChange"
        ref="textField"
        autocorrect="off"
        class="mediaTextContent"
        :editorToolbar="customToolbar"        
        autofocus
      />
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import { VueEditor } from 'vue2-editor';

export default {
  props: {
  },
  components: {
    Modal,
    VueEditor
  },
  data() {
    return {
      writeupContent: '',
      customToolbar: [
        [{ 'header': [false, 1, 2, 3, 4] }],
        // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
        ['bold', 'italic', 'underline', 'link', 'blockquote'],
        // [
        //   { align: "" },
        //   { align: "center" },
        //   { align: "right" },
        //   { align: "justify" }
        // ],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        ["link", "image", "video"],
        ['clean']  
      ]
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    'writeupContent': function() {
    }
  },
  computed: {
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    }
  }
}
</script>
<style>

</style>