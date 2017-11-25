<template>
  <div class="input-group">
    <input type="date" v-model="date" @input="updateDate()">
    <input type="time" v-model="time" @input="updateDate()" step="1">
  </div>
</template>
<script>

export default {
  props: ['value', 'twowaybinding'],
  data() {
    return {
      date: this.$moment(this.value).format('YYYY-MM-DD'),
      time: this.$moment(this.value).format('HH:mm:ss')
    }
  },
  watch: {
    value:  function() {
      if(this.twowaybinding !== true) { return; }
      this.date = this.$moment(this.value).format('YYYY-MM-DD'),
      this.time = this.$moment(this.value).format('HH:mm:ss')
    }
  },
  methods: {
    updateDate() {
      this.$emit('input', $moment(this.date + 'T' + this.time));
    }
  }
};
</script>