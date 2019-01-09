<template>
  <div>
    <div class="hide_on_print" v-html="$t('toconnectwithanotherdevicetothisfolder')" />

    <div v-for="(ip, index) in $root.state.localNetworkInfos.ip"
      class="m_qrSnippet"
      :key="index"
      >
      <div class="m_qrSnippet--motif">
        <qrcode 
          ref="qr_canvas"
          :value="getURLToApp(ip)" 
          :options="{ size: 400, foreground: '#333', background: 'transparent' }"
        ></qrcode>
        <button type="button"
          class="buttonLink hide_on_print"
          @click.prevent="printQR"
        >
          {{ $t('print') }} 
        </button>

        <CreateQRCode 
        >
        </CreateQRCode>
      </div>
      <div class="m_qrSnippet--text">
        <a 
          class="break-long-lines js--openInBrowser"
          :href="getURLToApp(ip)"
          target="_blank"
        >
          <!-- <img :src="'/images/i_logo.svg'" />           -->
        
          <template v-if="nameOfFolder">
            • {{ nameOfFolder }} •<br><br>
          </template>
          <span class="font-verysmall">
            {{ getURLToApp(ip) }}
          </span>
        </a>
      </div>
    </div>

  </div>
</template>
<script>
import qrcode from '@xkeshi/vue-qrcode';

export default {
  props: ['slugFolderName', 'media_filename'],
  components: {
    qrcode
  },
  data() {
    return {
    }
  },
  created() {
  },
  mounted() {
    this.$root.updateNetworkInfos();
  },
  beforeDestroy() {
  },
  watch: {
  },
  computed: {
    nameOfFolder() {
      if(!this.slugFolderName || !this.$root.store.folders[this.slugFolderName].hasOwnProperty('name')) {
        return false;
      }
      return this.$root.store.folders[this.slugFolderName].name;
    }
  },
  methods: {
    printQR: function() {
      window.print();
    },
    getURLToApp(ip) {
      let url = `${this.$root.state.protocol}://${ip}:${this.$root.state.localNetworkInfos.port}`;
      if(this.slugFolderName) {
        url += `/${this.slugFolderName}`;
        if(this.media_filename) {
          url += `/media/${this.media_filename}`;
        }
      }
      return url;        
    }
  }
}
</script>
<style>

</style>