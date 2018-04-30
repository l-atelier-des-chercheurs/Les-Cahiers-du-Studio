<template>
  <div class="input-group">
    <input type="date" v-model="date" @input="updateDate()" :readonly="read_only">
    <input type="time" v-model="time" @input="updateDate()" step="1" :readonly="read_only">
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    twowaybinding: {
      type: Boolean,
      default: false
    },
    read_only: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      date: this.$moment(this.value).isValid()
        ? this.$moment(this.value).format('YYYY-MM-DD')
        : '',
      time: this.$moment(this.value).isValid()
        ? this.$moment(this.value).format('HH:mm:ss')
        : ''
    };
  },
  watch: {
    value: function() {
      if (this.twowaybinding !== true) {
        return;
      }
      (this.date = this.$moment(this.value).format('YYYY-MM-DD')),
        (this.time = this.$moment(this.value).format('HH:mm:ss'));
    }
  },
  methods: {
    updateDate() {
      const newDateStr = this.date + 'T' + this.time;
      if(this.$moment(newDateStr).isValid()) {
        this.$emit('input', this.$moment(newDateStr));
      }
    }
  }
};
</script>