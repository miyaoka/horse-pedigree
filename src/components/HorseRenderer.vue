<script setup lang="ts">
import { HorseInfo } from "~/types";
import { sortByBorn } from "./util";

const props = defineProps<{
  horse: HorseInfo;
  horseMap: Map<string, HorseInfo>;
  level: number;
  sexType: string;
}>();

const children = computed(() => {
  if (props.sexType !== props.horse.sex) return [];
  const children = [];
  for (const childName of props.horse.children) {
    const child = props.horseMap.get(childName);
    if (!child) continue;
    children.push(child);
  }
  return children.sort(sortByBorn);
});
</script>

<template>
  <div class="ml-8">
    <div class="flex gap-1 items-center">
      <div class="text-xs text-gray-400">{{ horse.born }}</div>
      <div class="name" :class="{ isFemale: horse.sex === 'F' }">
        {{ horse.name }}
      </div>
      <div class="text-xs text-gray-500">
        {{ sexType === "M" ? horse.mother : horse.father }}
      </div>
      <div class="text-sm">{{ horse.win }}</div>
    </div>
    <div class="children">
      <HorseRenderer
        v-for="child in children"
        :horse="child"
        :horseMap="horseMap"
        :level="level + 1"
        :sexType="sexType"
      />
    </div>
  </div>
</template>

<style scoped>
.name {
  color: rgb(15, 15, 195);
}
.isFemale {
  color: red;
}
</style>
