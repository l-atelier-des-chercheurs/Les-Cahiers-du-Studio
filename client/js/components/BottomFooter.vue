<template>
  <footer class="m_footer flex-wrap flex-vertically-centered limited-width">
    <div class="padding-vert-medium padding-sides-medium">
      <p>Les Cahiers du Studio version {{ $root.store.appVersion }}</p>
      <p class="text-center centered text-small">
        <span v-html="$root.store.lang.toconnectwithanotherdevice">
        </span>
        <template v-for="(ip, index) in $root.store.localNetworkInfos.ip">
          <a
            :href="getURLToApp(ip, $root.store.localNetworkInfos.port)"
            class="js--openInBrowser"
            target="_blank"
            v-html="getURLToApp(ip, $root.store.localNetworkInfos.port)">
          </a>
          <span> </span>
        </template>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  methods: {
    getURLToApp(ip, port) {
      return `https://${ip}:${port}`;
    }
  }
}
</script>

<style scoped>
</style>