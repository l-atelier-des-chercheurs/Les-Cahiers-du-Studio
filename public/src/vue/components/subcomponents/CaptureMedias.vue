<template>
  <div class="m_captureMedias">
    <button
      type="button"
      class="_openCaptureBtn"
      @click="show_capture_pane = !show_capture_pane"
    >
      <svg class="svg-icon" viewBox="0 0 20 20">
        <path
          fill="currentColor"
          stroke-width=".3"
          d="M10,6.536c-2.263,0-4.099,1.836-4.099,4.098S7.737,14.732,10,14.732s4.099-1.836,4.099-4.098S12.263,6.536,10,6.536M10,13.871c-1.784,0-3.235-1.453-3.235-3.237S8.216,7.399,10,7.399c1.784,0,3.235,1.452,3.235,3.235S11.784,13.871,10,13.871M17.118,5.672l-3.237,0.014L12.52,3.697c-0.082-0.105-0.209-0.168-0.343-0.168H7.824c-0.134,0-0.261,0.062-0.343,0.168L6.12,5.686H2.882c-0.951,0-1.726,0.748-1.726,1.699v7.362c0,0.951,0.774,1.725,1.726,1.725h14.236c0.951,0,1.726-0.773,1.726-1.725V7.195C18.844,6.244,18.069,5.672,17.118,5.672 M17.98,14.746c0,0.477-0.386,0.861-0.862,0.861H2.882c-0.477,0-0.863-0.385-0.863-0.861V7.384c0-0.477,0.386-0.85,0.863-0.85l3.451,0.014c0.134,0,0.261-0.062,0.343-0.168l1.361-1.989h3.926l1.361,1.989c0.082,0.105,0.209,0.168,0.343,0.168l3.451-0.014c0.477,0,0.862,0.184,0.862,0.661V14.746z"
        ></path>
      </svg>
    </button>

    <template v-if="show_capture_pane">
      <!-- <div class="_modalOverlay" /> -->

      <div class="m_captureMedias--pane">
        <button type="button" @click="show_capture_pane = false">Retour</button>

        <CaptureView
          :slugFolderName="slugFolderName"
          :type="'folders'"
          :read_only="read_only"
          :available_modes="['photo', 'video', 'stopmotion', 'audio']"
          :can_add_to_fav="false"
          :return_temp_media="false"
          :must_validate_media="false"
          @close="show_capture_pane = false"
          @insertMedias="insertMedias"
        />
      </div>
    </template>
  </div>
</template>
<script>
import CaptureView from "../capture/CaptureView.vue";

export default {
  props: {
    slugFolderName: String,
  },
  components: {
    CaptureView,
  },
  data() {
    return {
      show_capture_pane: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    insertMedias(metaFileNames) {
      setTimeout(() => {
        const last_media_meta = metaFileNames[0];
        this.$eventHub.$emit("scrollToMedia", last_media_meta);
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped>
._openCaptureBtn {
  width: 64px;
  height: 64px;
  padding: 0 calc(var(--spacing) / 2);
  border-radius: 50%;
  margin: 0 auto;
  background-color: var(--c-author);
  color: var(--c-text_on_author_color);
  box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.15);
  cursor: pointer;
  pointer-events: auto;
}

.m_captureMedias {
  margin: 0 var(--spacing-verysmall);
}

.m_captureMedias--pane {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  height: 50%;
  pointer-events: auto;
  background: white;
}
</style>

<style lang="scss">
.m_captureview {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
