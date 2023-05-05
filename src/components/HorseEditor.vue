<script setup lang="ts"></script>

<template>
  <header class="flex p-2 justify-center">
    スプレッドシートから系統図を表示するツール
  </header>
  <div class="flex gap-2 flex-wrap p-2">
    <details name="sheet" open>
      <summary>シート</summary>
      <HorseSheet />
    </details>

    <details name="timeline" open>
      <summary>timeline</summary>
      <HorseTimeline />
    </details>

    <HorseLines />
  </div>
  <footer class="flex p-4 mb-10 justify-center">
    <a
      href="https://github.com/miyaoka/horse-pedigree"
      target="_blank"
      class="underline"
      >Source(GitHub)</a
    >
  </footer>
</template>

<style scoped></style>
