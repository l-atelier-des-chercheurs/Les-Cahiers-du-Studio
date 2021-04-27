<template>
  <div class="m_timelineplayer font-verysmall" v-if="active_players.length > 0">
    <div
      class="m_timelineplayer--item"
      v-for="{ metaFileName, name, player, thumb } in active_players"
      :key="metaFileName"
    >
      <button type="button" @click="showMedia(metaFileName)">
        <img class="_thumb" v-if="thumb" :src="thumb" />
        <span class="padding-left-small" v-else>{{ name }}</span>
        <span class="_action">{{ $t("show") }}</span>
      </button>
      <button type="button" @click="pausePlayer({ metaFileName, player })">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path
            d="M6 1H3c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm6 0c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-3z"
          />
        </svg>
        <span class="_action">{{ $t("stop_playback") }}</span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      active_players: [],
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
    showMedia(metaFileName) {
      this.$eventHub.$emit("scrollToMedia", metaFileName);
    },
    playing({ plyr: player, metaFileName, name, thumb }) {
      console.log("METHODS • TimelinePlayer: playing");
      const existing_player = this.active_players.find(
        (p) => p.metaFileName === metaFileName
      );
      if (existing_player) {
        existing_player.player.play();
        return;
      }

      this.active_players.push({
        metaFileName,
        player,
        name,
        thumb,
      });
    },
    stopped_playing({ plyr: player, metaFileName }) {
      this.pausePlayer({ metaFileName, player });
    },
    pausePlayer({ metaFileName, player }) {
      console.log("METHODS • TimelinePlayer: pausePlayer");
      player.pause();
      this.active_players = this.active_players.filter(
        (p) => p.metaFileName !== metaFileName
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.m_timelineplayer {
  // position: absolute;
  display: flex;
  flex-flow: column nowrap;
  text-align: center;

  align-content: center;
  justify-content: center;
  align-items: center;
}

.m_timelineplayer--item {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  max-width: 350px;
  border-radius: 4px;
  overflow: hidden;
  padding: 0;
  margin-bottom: 0.2em;
  height: auto;
  background-color: transparent;

  button {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    background: var(--c-noir);
    color: white;
    // padding: 5px;
    border-radius: 2px;
    padding: 0;
    padding-left: 4px;
    height: 2em;

    margin-right: 1em;

    &:last-child {
      margin-right: 0;
    }
  }

  svg {
    flex: 0 0 12px;
    width: 12px;
    height: 12px;
    margin: 0;

    fill: currentColor;
  }

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  ._action {
    margin: 0 0.5em 0 0.5em;
  }

  ._thumb {
    background-color: #000;
    flex: 0 0 2em;
    max-height: 100%;
    height: 2em;
    width: 2em;
    object-fit: contain;
  }
}
</style>
