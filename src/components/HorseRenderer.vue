<script setup lang="ts">
import { HorseInfo } from "~/types";
import { useHorseStore } from "./horseStore";
import { numToLast2digits, sortByBorn } from "./util";

const props = defineProps<{
  horse: HorseInfo;
  level: number;
  sexType: string;
}>();

const horseStore = useHorseStore();

const children = computed(() => {
  if (props.sexType !== props.horse.sex) return [];
  const children = [];
  for (const childName of props.horse.children) {
    const child = horseStore.horseMap.get(childName);
    if (!child) continue;
    children.push(child);
  }
  return children.sort(sortByBorn);
});

const parentName = computed(() => {
  return props.sexType === "M" ? props.horse.mother : props.horse.father;
});

const opacity = computed(() => {
  if (horseStore.selectedYear === 0) return 1;

  const span = horseStore.selectedYearRange;
  const diff = Math.abs((props.horse.born ?? 0) - horseStore.selectedYear) * 2;
  const diffRate = 1 - diff / span;
  return diffRate > 0 ? 1 : 0.2;
});

const isFemale = computed(() => props.horse.sex === "F");

const isNewLine = computed(() => {
  if (props.level === 0 || props.sexType !== props.horse.sex) return false;
  return props.horse.name === props.horse.line;
});
</script>

<template>
  <div class="ml-4">
    <div
      class="horse flex gap-1 items-center w-full cursor-pointer"
      :style="{ opacity }"
      :data-shown="opacity === 1"
      @mouseover="horseStore.select(horse)"
      @mouseleave="horseStore.select(null)"
      :class="{
        isSelected: horseStore.isSelected(horse),
        isSelectedYear: horse.born === horseStore.selectedYear,
      }"
    >
      <div class="text-xs text-gray-400" v-if="horse.born">
        {{ numToLast2digits(horse.born) }}
      </div>
      <div class="name text-sm">
        <span
          :class="{
            isFemale,
            isNewLine,
          }"
        >
          {{ horse.name }}
        </span>
        <span v-if="isNewLine">🔽</span>
      </div>

      <div
        class="text-[10px] text-gray-500 leading-tight"
        :class="sexType === 'F' ? 'self-start' : 'self-end'"
      >
        {{ parentName }}
      </div>
      <div class="text-xs text-gray-600 text-right flex-auto">
        {{ horse.memo }}
      </div>
    </div>
    <div class="children" v-if="!isNewLine">
      <HorseRenderer
        v-for="child in children"
        :horse="child"
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
.isNewLine {
  text-decoration: underline;
}
.isSelectedYear {
  background: #ffdc4f6e;
}
</style>
