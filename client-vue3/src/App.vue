<template>
  <div class="app">
    <div v-if="show_connection_lost" class="m_connectionStatus">
      {{ $t("connection_lost") }}
    </div>

    <HomeView @login="show_login_modal = true" />

    <LoginModal v-if="show_login_modal" @close="show_login_modal = false" />
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import HomeView from "@/views/HomeView.vue";
import LoginModal from "@/components/LoginModal.vue";

export default {
  components: { HomeView, LoginModal },
  data() {
    return {
      show_login_modal: false,
      was_connected: false,
    };
  },
  computed: {
    ...mapState(useContentStore, ["is_connected"]),
    // not before the first connection: the socket takes a moment
    show_connection_lost() {
      return this.was_connected && !this.is_connected;
    },
  },
  watch: {
    is_connected: {
      handler(is_connected) {
        if (is_connected) this.was_connected = true;
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.m_connectionStatus {
  position: fixed;
  z-index: 10000;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2px var(--spacing-small);
  background-color: var(--c-rouge);
  color: white;
  font-size: var(--font-size-verysmall);
  text-align: center;
}
</style>
