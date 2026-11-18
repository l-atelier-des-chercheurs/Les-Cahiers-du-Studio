<template>
  <footer class="m_footer">
    <!-- to try another typeface: STVitry stays the default -->
    <button type="button" class="textLink" @click="toggleFont">
      {{ $t("typeface") }} :
      {{ font === "victor" ? "Victor Mono" : "STVitry" }}
    </button>
  </footer>
</template>

<script>
import { getFont, setFont } from "@/font";

export default {
  data() {
    return {
      font: getFont(),
    };
  },
  methods: {
    toggleFont() {
      this.font = this.font === "victor" ? "" : "victor";
      setFont(this.font);
    },
  },
};
</script>

<style lang="scss" scoped>
.m_footer {
  padding: var(--spacing-medium);
  color: var(--c-gris);
  font-size: var(--font-size-verysmall);
  text-align: center;
}
</style>
