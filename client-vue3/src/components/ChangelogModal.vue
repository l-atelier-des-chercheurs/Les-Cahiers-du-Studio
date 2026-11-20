<template>
  <!-- What's new since the version this browser last ran (ChangelogList.vue).
  Opened from the update notice (UpdateNotice.vue). -->
  <BaseModal @close="$emit('close')" @submit="$emit('close')">
    <template #header>{{ $t("whats_new") }}</template>

    <ChangelogList :since="since" :current="current" />

    <template #submit_button>{{ $t("close") }}</template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";
import ChangelogList from "./ChangelogList.vue";

export default {
  components: { BaseModal, ChangelogList },
  props: {
    since: { type: String, default: "" },
    current: { type: String, default: "" },
  },
  emits: ["close"],
};
</script>
