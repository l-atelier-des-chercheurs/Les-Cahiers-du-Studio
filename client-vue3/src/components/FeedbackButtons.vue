<template>
  <!-- the app is a prototype: says so in the top bars, and reopens the
  notice window (NoticeModal.vue, with the contact address) on click -->
  <button type="button" class="m_prototype" @click="$emit('notice')">
    {{ $t("prototype_notice") }}
  </button>
</template>

<script>
export default {
  emits: ["notice"],
};
</script>

<style lang="scss" scoped>
.m_prototype {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background-color: var(--c-jaune);
  color: var(--c-noir);
  font-size: var(--font-size-small);
  line-height: 1.4;
  white-space: nowrap;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(0.95);
  }
}
</style>
