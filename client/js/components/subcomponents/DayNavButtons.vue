<template>
  <div class="btnDayNav">
    <button class="btnDayNav--prev button_small"
      :class="{ 'is--disabled' : !prevDayIsVisible() }"
      @click="$emit('goToPrevDay')"
    >
      Jour Précédent
    </button>

    <button class="btnDayNav--next button_small"
      :class="{ 'is--disabled' : !nextDayIsVisible() }"
      @click="$emit('goToNextDay')"
      >
        Jour Suivant
    </button>
  </div>
</template>
<script>


export default {
  props: {
    timelineInfos: Object,
    timelineViewport: Object
  },
  methods: {
    prevDayIsVisible: function() {
      if(this.timelineIsShownFromTheStart()) {
        return false;
      }
      return true;
    },
    nextDayIsVisible: function() {
      if(this.timelineIsShownUntilTheEnd()) {
        return false;
      }
      return true;
    },
    timelineIsShownFromTheStart: function() {
      if(this.timelineInfos.start.format('YYYYMMDD') === this.timelineViewport.start.format('YYYYMMDD')) {
        return true;
      }
      return false;
    },
    timelineIsShownUntilTheEnd: function() {
      if(this.timelineInfos.end.format('YYYYMMDD') === this.timelineViewport.end.format('YYYYMMDD')) {
        return true;
      }
      return false;
    }
  }
}
</script>
<style>

</style>