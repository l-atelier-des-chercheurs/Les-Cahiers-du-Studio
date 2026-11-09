<template>
  <main class="hello">
    <h1>Hello {{ app_infos.product_name }}</h1>
    <p>
      v{{ app_infos.version }}
      <template v-if="app_infos.is_electron">· Electron</template>
      <template v-if="app_infos.page_is_standalone_html">· standalone</template>
      · {{ is_connected ? "en ligne" : "hors ligne" }}
    </p>
    <p v-if="is_logged_in">Connecté en tant que {{ author_slug }}</p>
    <p v-else>Pas connecté</p>

    <h2>Cahiers</h2>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!cahiers">Chargement…</p>
    <p v-else-if="cahiers.length === 0">Aucun cahier pour l’instant.</p>
    <ul v-else>
      <li v-for="cahier in cahiers" :key="cahier.$path">
        {{ cahier.title || cahier.$path }}
      </li>
    </ul>
  </main>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useSessionStore } from "@/stores/session";
import { useContentStore } from "@/stores/content";

export default {
  data() {
    return {
      // set by adc-core's index.pug
      app_infos: window.app_infos,
      error: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["is_logged_in", "author_slug"]),
    ...mapState(useContentStore, ["is_connected", "getFolders"]),
    cahiers() {
      return this.getFolders("cahiers");
    },
  },
  created() {
    this.openFolders("cahiers").catch((err) => (this.error = err.message));
  },
  beforeUnmount() {
    this.closeFolders("cahiers");
  },
  methods: {
    ...mapActions(useContentStore, ["openFolders", "closeFolders"]),
  },
};
</script>

<style lang="scss" scoped>
.hello {
  padding: 2rem;

  h1 {
    margin-top: 0;
  }
}

.error {
  color: #c23a2b;
}
</style>
