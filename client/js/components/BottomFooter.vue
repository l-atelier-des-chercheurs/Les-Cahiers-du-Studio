<template>
  <footer class="m_footer flex-wrap flex-vertically-centered limited-width">
    <div class="padding-vert-medium padding-sides-medium">
      <p>Les Cahiers du Studio version {{ $root.store.appVersion }}</p>
      <p class="text-center centered text-small">
        <span v-html="$root.store.lang.toconnectwithanotherdevice">
        </span>
        <template v-for="(ninfos, index) in $root.store.networkInfos">
          <a :href="getURLToApp(ninfos)" class="js--openInBrowser" target="_blank">
            {{ getURLToApp(ninfos) }}
          </a>
        </template>
      </p>
    </div>
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
</style>