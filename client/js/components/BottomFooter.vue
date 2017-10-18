<template>
  <footer class="m_footer">
    <template v-for="ninfos in $root.store.networkInfos">
      <p>Les Cahiers du Studio version {{ $root.store.appVersion }}</p>
      <p class="text-center centered text-small">
        <span v-html="$root.store.lang.toconnectwithanotherdevice">
        </span>
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