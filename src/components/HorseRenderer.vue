<script setup lang="ts">
import { HorseInfo } from "~/types";

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
  return children.sort((a, b) => b.born - a.born);
});
</script>

<template>
  <div class="container">
    <div class="horse">
      <span class="name" :class="{ isFemale: horse.sex === 'F' }">{{
        horse.name
      }}</span>
      <span class="born">{{ horse.born }}</span>
      <span class="win">{{ horse.win }}</span>
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
.container {
  margin-left: 30px;
}
.horse {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.born,
.win {
  font-size: 0.8em;
}
.name {
  color: rgb(29, 29, 129);
}
.isFemale {
  color: red;
}
</style>
