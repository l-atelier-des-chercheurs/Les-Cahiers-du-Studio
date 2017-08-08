<template>
  <div>
    <p>
      <input type="date" v-model="date" @input="updateDate()">
    </p>
    <p>
      <input type="time" v-model="time" @input="updateDate()">
    </p>
  </div>
</template>
<script>
import moment from 'moment';

export default {
  props: ['value'],
  data() {
    return {
      date: moment(this.value).format('YYYY-MM-DD'),
      time: moment(this.value).format('HH:mm')
    }
  },
  methods: {
    updateDate() {
      this.$emit('input', this.date + 'T' + this.time);
    }
  }
};
</script>