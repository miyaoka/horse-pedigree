<script setup lang="ts">
import { HorseInfo } from "~/types";
import { useHorseStore } from "./horseStore";

const props = defineProps<{
  horse: HorseInfo;
  horseMap: Map<string, HorseInfo>;
  level: number;
  sexType: string;
}>();

const horseStore = useHorseStore();

const children = computed(() => {
  if (props.sexType !== props.horse.sex) return [];
  const children = [];
  for (const childName of props.horse.children) {
    const child = props.horseMap.get(childName);
    if (!child) continue;
    children.push(child);
  }
  return children.sort((a, b) => a.born - b.born);
});

const parentName = computed(() => {
  return props.sexType === "M" ? props.horse.mother : props.horse.father;
});

const opacity = computed(() => {
  if (horseStore.selectedYear === 0) return 1;

  const span = horseStore.selectedYearRange;
  const diff = Math.abs(props.horse.born - horseStore.selectedYear) * 2;
  const diffRate = diff / span;
  return Math.max(1 - diffRate ** 2, 0.1);
});
</script>

<template>
  <div class="ml-4">
    <button
      class="horse flex gap-1 items-center"
      :style="{ opacity }"
      @mouseover="horseStore.select(horse)"
      @mouseleave="horseStore.select(null)"
      :class="{
        isSelected: horseStore.isSelected(horse),
        isSelectedYear: horse.born === horseStore.selectedYear,
      }"
    >
      <div class="text-xs text-gray-400">{{ horse.born }}</div>
      <div
        class="name text-sm"
        :class="{
          isFemale: horse.sex === 'F',
        }"
      >
        {{ horse.name }}
      </div>
      <div class="text-xs text-gray-500">
        {{ parentName }}
      </div>
      <div class="text-sm text-gray-600">{{ horse.win }}</div>
    </button>
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
.horse.isSelected {
  background: #ffdc4f;
}
.isFemale {
  color: red;
}
.isSelectedYear {
  background: #ffdc4f6e;
}
</style>