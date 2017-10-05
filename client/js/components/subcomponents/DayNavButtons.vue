<template>
  <div class="btnDayNav">
<!--      :class="{ 'is--disabled' : !prevDayIsVisible() }" -->
    <button class="btnDayNav--prev button_small"
      @click="$emit('goToPrevDay')"
    >
      Jour Précédent
    </button>

<!--      :class="{ 'is--disabled' : !nextDayIsVisible() }" -->
    <button class="btnDayNav--next button_small"
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
    }
  }
}
</script>
<style>

</style>