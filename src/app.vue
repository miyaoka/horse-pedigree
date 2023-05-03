<script setup lang="ts">
useHead({
  title: "Horse pedigree",
  meta: [
    {
      name: "description",
      content: "スプレッドシートから系統図を表示するツール",
    },
  ],
});
</script>

<template>
  <HorseEditor />
</template>
