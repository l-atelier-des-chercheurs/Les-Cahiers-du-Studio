<template>
  <footer class="m_footer flex-wrap flex-vertically-centered limited-width">
    <div class="padding-vert-medium padding-sides-medium">
      <p><em>Les Cahiers du Studio</em> version {{ $root.state.appVersion }}</p>
      <p class="text-center centered font-small">
        <span v-html="$t('toconnectwithanotherdevice')">
        </span>
        <template v-for="(ip, index) in $root.state.localNetworkInfos.ip">
          <a
            :href="getURLToApp(ip, $root.state.localNetworkInfos.port)"
            class="js--openInBrowser"
            target="_blank"
            v-html="getURLToApp(ip, $root.state.localNetworkInfos.port)">
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
      return `${this.$root.state.protocol}://${ip}:${port}`;
    }
  }
}
</script>

<style scoped>
</style>