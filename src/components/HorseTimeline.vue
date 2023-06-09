<script setup lang="ts">
import { HorseInfo } from "@/types";
import { useHorseStore } from "./horseStore";
import { numToLast2digits } from "./util";

const horseStore = useHorseStore();

const holdingSelection = ref<number | null>(null);
const minYear = ref(0);
const maxYear = ref(0);
const timeline = ref<{ year: number; horses: HorseInfo[] }[]>([]);

const getYearStyle = (year: number) => {
  if (horseStore.selectedYear === 0) return {};
  const getOpacity = () => {
    const span = horseStore.selectedYearRange;
    const diff = Math.abs(year - horseStore.selectedYear) * 2;
    const diffRate = diff / span;
    return 1 - diffRate ** 2;
  };
  const opacity = getOpacity();
  if (opacity < 0) return {};
  return {
    backgroundColor: `rgba(255, 220, 79, ${getOpacity()})`,
  };
};

watch(
  () => horseStore.horseMap,
  (horseMap) => {
    const timelineMap = new Map<number, HorseInfo[]>();
    for (const horse of horseMap.values()) {
      if (horse.born == null) continue;
      timelineMap.has(horse.born)
        ? timelineMap.get(horse.born)?.push(horse)
        : timelineMap.set(horse.born, [horse]);
    }

    const years = [...timelineMap.keys()];
    minYear.value = Math.min(...years);
    maxYear.value = Math.max(...years);
    const timelineArray = [];

    for (let year = minYear.value; year <= maxYear.value; year++) {
      timelineArray.push({
        year,
        horses: timelineMap.get(year) || [],
      });
    }
    timeline.value = timelineArray;
  },
  {
    immediate: true,
  }
);

const toggleSelectYear = (year: number) => {
  // hold on
  if (holdingSelection.value == null) {
    holdingSelection.value = year;
    return;
  }
  // hold off
  holdingSelection.value = null;
  horseStore.selectYear(year);
};
const selectYear = (year: number) => {
  // holdされていて、かつ、holdされている年と違う年をホバーしたら何もしない
  if (holdingSelection.value != null && holdingSelection.value !== year) return;

  horseStore.selectYear(year);
};
</script>

<template>
  <div class="w-[400px]">
    <div class="text-sm p-2">
      年代レンジ：
      <input
        type="range"
        min="1"
        max="20"
        v-model="horseStore.selectedYearRange"
      />
      {{ horseStore.selectedYearRange }}
    </div>
    <div class="text-sm text-gray-500">
      （年の部分をホバーするとフィルタ表示します）
    </div>
    <div
      v-for="{ year, horses } in timeline"
      class="flex flex-row gap-2 text-sm border-t border-gray-200"
      :style="getYearStyle(year)"
    >
      <button
        @mouseover="selectYear(year)"
        @mouseleave="selectYear(0)"
        @click="toggleSelectYear(year)"
        class="px-4 flex"
        :class="{
          isSelected: year === horseStore.selectedYear,
        }"
      >
        {{ numToLast2digits(year) }}
      </button>
      <div class="flex flex-row gap-1 flex-wrap items-start">
        <button
          class="name leading-tight"
          v-for="horse in horses"
          @mouseover="horseStore.select(horse)"
          @mouseleave="horseStore.select(null)"
          :class="{
            isFemale: horse.sex === 'F',
            isSelected: horseStore.isSelected(horse),
          }"
        >
          {{ horse.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"][orient="vertical"] {
  -webkit-appearance: slider-vertical;
  rotate: 180deg;
  padding: 0 5px;
}
.name {
  color: rgb(15, 15, 195);
}
.isSelected {
  background: #ffdc4f;
}
.isFemale {
  color: red;
}
</style>
