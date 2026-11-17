<template>
  <BaseModal @close="$emit('close')" @submit="$emit('close')">
    <template #header>{{ $t("notice_title") }}</template>

    <div class="m_modal--field">
      <p>{{ $t("notice_in_preparation") }}</p>
      <i18n-t keypath="notice_contact" tag="p" scope="global">
        <template #contact_us>
          <a :href="`mailto:${contact_email}`">{{ $t("contact_us") }}</a>
        </template>
        <template #email>
          <span class="notice--email">{{ contact_email }}</span>
        </template>
      </i18n-t>
    </div>

    <template #submit_button>{{ $t("understood") }}</template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";

export default {
  components: { BaseModal },
  emits: ["close"],
  data() {
    return {
      contact_email: "archivesvivantes@federation-apcp.org",
    };
  },
};
</script>

<style lang="scss" scoped>
p {
  margin: 0 0 var(--spacing-small);
  line-height: 1.5;
}

a {
  color: inherit;
  text-underline-offset: 0.15em;
}

.notice--email {
  overflow-wrap: anywhere;
}
</style>
