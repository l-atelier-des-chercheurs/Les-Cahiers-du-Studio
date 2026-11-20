<template>
  <!-- a repère, from the + button: its time is the time of the click; a
  label is optional. The parent creates it: it emits "submit" with the
  label (maybe empty), then sets is_creating / error as props. -->
  <BaseModal
    :busy="is_creating"
    @close="$emit('close')"
    @submit="$emit('submit', label.trim())"
  >
    <template #header>{{ $t("add_marker") }} · {{ time }}</template>

    <div class="m_modal--field">
      <label for="marker_label">{{ $t("label") }}</label>
      <input
        id="marker_label"
        v-model="label"
        type="text"
        maxlength="200"
        :placeholder="$t('marker_placeholder')"
        autofocus
      />
      <small>{{ $t("marker_instructions") }}</small>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("add") }}</template>
  </BaseModal>
</template>

<script>
import { formatTime } from "@/medias";
import BaseModal from "./BaseModal.vue";

export default {
  components: { BaseModal },
  props: {
    // when the repère was asked for: its place on the timeline
    date: { type: String, required: true },
    is_creating: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  emits: ["close", "submit"],
  data() {
    return {
      label: "",
    };
  },
  computed: {
    time() {
      return formatTime(this.date);
    },
  },
};
</script>
