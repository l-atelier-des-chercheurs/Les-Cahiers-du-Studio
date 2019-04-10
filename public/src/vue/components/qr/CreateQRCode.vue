<template>
  <div>
    <div class="hide_on_print" v-html="$t('toconnectwithanotherdevice')" />
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
          class="buttonLink hide_on_print padding-none bg-transparent"
          @click.prevent="printQR"
        >
          <small class="text-cap">{{ $t('print') }} </small>
        </button>
      </div>
      <div class="m_qrSnippet--text">
        <a 
          class="break-long-lines js--openInBrowser"
          :href="getURLToApp(ip)"
          target="_blank"
        >        
          <!-- <template v-if="nameOfFolder">
            • {{ nameOfFolder }} •<br><br>
          </template> -->
        
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
    this.$socketio.updateNetworkInfos();
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

      let url = new URL(window.location);

      function isIP( address ){ 
        const r = RegExp('((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])');
        return r.test( address )
      }

      // si on est en localhost (cas de electron et navigateur connecté à electron)
      // alors on remplace localhost par l’IP
      if(url.hostname === 'localhost') {
        url.hostname = ip;        
      } 
      // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
      // alors on remplace par l’IP
      else if(isIP(url.hostname)) {
        url.hostname = ip;        
      }
      // et si on est sur un nom de domaine alors on ne fait rien
      if(this.slugFolderName) {
        url.pathname = this.slugFolderName;
        if(this.media_filename) {
          url.pathname += `/media/${this.media_filename}`;
        }
      }
      return url;        
    }
  }
}
</script>
<style>

</style>