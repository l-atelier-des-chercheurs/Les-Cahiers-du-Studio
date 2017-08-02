<template>
  <div>
    <a :href='slug'>
      {{ folder.name }}
    </a>

  </div>
</template>
<script>

export default {
  props: ['folder', 'slug'],
  data() {
    return {
    }
  },
  computed: {
  }
}
</script>
<style>
</style>