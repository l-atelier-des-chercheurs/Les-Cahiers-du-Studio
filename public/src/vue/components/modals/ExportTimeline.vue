<template>
  <Modal
    @close="$emit('close')"
    @submit="downloadExport"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
  >
    <template slot="header">
      <span class="text-cap"> {{ $t("export_folder") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        <label>{{ $t("password_protect") }}</label>
        <input type="password" v-model="export_options.password_protect" />
      </div>

      <div class="margin-bottom-small">
        <span class="switch">
          <input
            type="checkbox"
            class="switch"
            id="downloadswitch"
            v-model="export_options.allow_download"
          />
          <label for="downloadswitch">{{ $t("allow_media_download") }}</label>
        </span>
      </div>

      <div class="margin-bottom-small">
        <span class="switch">
          <input
            type="checkbox"
            class="switch"
            id="publiconlyswitch"
            v-model="export_options.only_public"
          />
          <label for="publiconlyswitch" v-html="$t('only_public_medias')" />
        </span>
      </div>
    </template>

    <template slot="submit_button">
      {{ $t("download") }}
    </template>
  </Modal>
</template>
<script>
import alertify from "alertify.js";

export default {
  props: {
    read_only: Boolean,
    slugFolderName: String,
  },
  components: {},
  data() {
    return {
      export_options: {
        allow_download: false,
        password_protect: "",
        only_public: false,
      },
    };
  },
  mounted() {},
  computed: {},
  methods: {
    downloadExport() {
      alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t("notifications.folder_export_started"));

      this.export_options.socketid = this.$socketio.socket.id;

      let hashCode = function (s) {
        return s.split("").reduce(function (a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
      };

      if (!!this.export_options.password_protect) {
        this.export_options.password_protect = hashCode(
          this.export_options.password_protect
        );
      }

      let query = Object.entries(this.export_options)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join("&");
      window.location.replace(
        window.location.origin +
          `/export/folders/${this.slugFolderName}?${query}`
      );
      this.$emit("close");
    },
  },
};
</script>
<style></style>
