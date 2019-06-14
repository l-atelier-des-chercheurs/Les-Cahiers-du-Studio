<template>
  <footer class="m_footer limited-width">
    <div class="padding-vert-medium padding-sides-medium">
      <p><em>Les Cahiers du Studio</em> version {{ $root.state.appVersion }}</p>
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
};
</script>

<style scoped>

</style>