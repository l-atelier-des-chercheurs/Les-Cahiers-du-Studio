<template>
  <footer>
    <template v-for="ninfos in $root.store.networkInfos">
      <p class="text-center centered text-small">
        {{ $root.store.lang.toconnectwithanotherdevice }}
        <a :href="getURLToApp(ninfos)" class="js--openInBrowser" target="_blank">
          {{ getURLToApp(ninfos) }}
        </a>
      </p>
    </template>
  </footer>
</template>

<script>
export default {
  methods: {
    getURLToApp(ninfos) {
      return `https://${ninfos}:8080`;
    }
  }
}
</script>

<style scoped>
footer {
  max-width: 42em;
  margin: 0 auto;
}
</style>