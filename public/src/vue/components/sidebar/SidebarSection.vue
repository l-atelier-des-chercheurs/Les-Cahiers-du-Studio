<template>
  <section class="border border-bottom-dashed padding-medium">
    <header>
      <slot name="header"></slot>
    </header>

    <div class="margin-top-small" v-if="!!$slots['body']">
      <slot name="body"></slot>
    </div>
  </section>
</template>
<script></script>
<style></style>
