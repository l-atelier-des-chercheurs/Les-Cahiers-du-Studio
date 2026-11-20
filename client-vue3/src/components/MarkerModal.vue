<template>
  <!-- a repère, from the + button: its time is the time of the click, which
  can be changed; a label is optional. The parent creates it: it emits
  "submit" with the label (maybe empty) and the date, then sets is_creating /
  error as props. -->
  <BaseModal
    :busy="is_creating"
    @close="$emit('close')"
    @submit="$emit('submit', { label: label.trim(), date: marker_date })"
  >
    <template #header>{{ $t("add_marker") }}</template>

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

    <div class="m_modal--field">
      <label for="marker_date">{{ $t("date_on_timeline") }}</label>
      <input
        id="marker_date"
        type="datetime-local"
        :value="toInputValue(marker_date)"
        :disabled="is_creating"
        @change="onDateInput"
      />
      <small>{{ $t("marker_date_instructions") }}</small>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>{{ $t("add") }}</template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";

export default {
  components: { BaseModal },
  props: {
    // when the repère was asked for: its place on the timeline by default
    date: { type: String, required: true },
    is_creating: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  emits: ["close", "submit"],
  data() {
    return {
      label: "",
      marker_date: this.date,
    };
  },
  methods: {
    // emptied or invalid: the last valid date is kept
    onDateInput(event) {
      const date = new Date(event.target.value);
      if (event.target.value && !isNaN(date))
        this.marker_date = date.toISOString();
      else event.target.value = this.toInputValue(this.marker_date);
    },
    // datetime-local wants the local time, without zone
    toInputValue(date) {
      const d = new Date(date);
      if (!date || isNaN(d)) return "";
      return new Date(d - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    },
  },
};
</script>
