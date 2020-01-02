<template>
  <div class="m_timelineplayer" v-if="active_players.length > 0">
    <div>
      <button
        type="button"
        v-for="({ metaFileName, player }) in active_players"
        :key="metaFileName"
        @click="pausePlayer({ metaFileName, player })"
      >pause {{ metaFileName }}</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      active_players: []
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("timelineplayer.playing", this.playing);
    this.$eventHub.$on("timelineplayer.pause", this.stopped_playing);
    this.$eventHub.$on("timelineplayer.ended", this.stopped_playing);
  },
  beforeDestroy() {
    this.$eventHub.$off("timelineplayer.playing", this.playing);
    this.$eventHub.$off("timelineplayer.pause", this.stopped_playing);
    this.$eventHub.$off("timelineplayer.ended", this.stopped_playing);
  },
  watch: {},
  computed: {},
  methods: {
    playing({ plyr: player, metaFileName }) {
      console.log("METHODS • TimelinePlayer: playing");
      const existing_player = this.active_players.find(
        p => p.metaFileName === metaFileName
      );
      if (existing_player) {
        existing_player.player.play();
        return;
      }

      this.active_players.push({
        metaFileName,
        player
      });
    },
    stopped_playing({ plyr: player, metaFileName }) {
      this.pausePlayer({ metaFileName, player });
    },
    pauseAllPlayers() {
      console.log("METHODS • TimelinePlayer: pauseAllPlayers");
      this.active_players.map(({ player }) => player.pause());
      this.active_players = [];
    },
    pausePlayer({ metaFileName, player }) {
      player.pause();
      this.active_players = this.active_players.filter(
        p => p.metaFileName !== metaFileName
      );
    }
  }
};
</script>
<style lang="scss" scoped>
.m_timelineplayer {
  // position: absolute;
  color: var(--color-noir);
}
</style>
