<script setup lang="ts">
import { useHorseStore } from "./horseStore";

const horseStore = useHorseStore();

const rootList = computed(() => {
  const familyRootList = [];
  const sireRootList = [];

  for (const horse of horseStore.horseMap.values()) {
    if (!horse.isRoot || horse.children.length === 0) continue;
    if (horse.sex === "F") {
      familyRootList.push(horse);
    } else {
      sireRootList.push(horse);
    }
  }
  return {
    sireRootList: sireRootList.sort((a, b) => a.born - b.born),
    familyRootList: familyRootList.sort((a, b) => a.born - b.born),
  };
});
</script>

<template>
  <details name="familyLine" open>
    <summary>Family line</summary>
    <div class="p-4 gap-4 flex flex-col">
      <details v-for="horse in rootList.familyRootList" open>
        <summary class="text-sm">
          <span>{{ horse.name }}</span>
          <template v-if="horse.mother">
            <span> &lt; </span>
            <span class="text-xs">{{ horse.mother }}</span>
          </template>
        </summary>
        <HorseRenderer
          :horse="horse"
          :level="0"
          sexType="F"
          class="outline-red-300 outline-1 outline p-4 bg-pink-50 rounded-xl"
        />
      </details>
    </div>
  </details>
  <details name="sireLine" open>
    <summary>Sire line</summary>
    <div class="p-4 flex flex-col gap-4">
      <details v-for="horse in rootList.sireRootList" open>
        <summary class="text-sm">
          <span>{{ horse.name }}</span>
          <template v-if="horse.father">
            <span> &lt; </span>
            <span class="text-xs">{{ horse.father }}</span>
          </template>
        </summary>
        <HorseRenderer
          :horse="horse"
          :level="0"
          sexType="M"
          class="outline-indigo-300 outline-1 outline p-4 bg-indigo-50 rounded-xl"
        />
      </details>
    </div>
  </details>
</template>

<style scoped></style>
