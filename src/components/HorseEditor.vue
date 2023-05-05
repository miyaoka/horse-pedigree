<script setup lang="ts">
import jspreadsheet from "jspreadsheet-ce";
import sampleData from "@/assets/sampleData.json";
import { HorseInfo } from "@/types";
import { useHorseStore } from "./horseStore";

useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://bossanova.uk/jspreadsheet/v4/jexcel.css",
    },
    {
      rel: "stylesheet",
      href: "https://jsuites.net/v4/jsuites.css",
    },
  ],
});

const horseStore = useHorseStore();

const horseMap = computed(() => {
  const map = new Map<string, HorseInfo>();
  for (const row of horseStore.sheetData) {
    const [name, _born, sex, father, mother, win] = row;
    if (!name) continue;

    const num = parseInt(_born, 10);
    const born = isNaN(num) ? 0 : num;
    const obj = {
      name,
      born,
      sex,
      father,
      mother,
      win,
      children: [],
      isRoot: false,
    };

    map.set(name, obj);
  }

  for (const entry of map.entries()) {
    const [name, horse] = entry;
    const { father, mother, sex } = horse;
    const fatherHorse = map.get(father);
    const motherHorse = map.get(mother);
    if (fatherHorse) {
      fatherHorse.children.push(name);
    }
    if (motherHorse) {
      motherHorse.children.push(name);
    }
    if ((sex === "M" && !fatherHorse) || (sex === "F" && !motherHorse)) {
      horse.isRoot = true;
    }
  }

  return map;
});

const rootList = computed(() => {
  const familyRootList = [];
  const sireRootList = [];

  for (const horse of horseMap.value.values()) {
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
  horseMap,
  () => {
    const timelineMap = new Map<number, HorseInfo[]>();
    for (const horse of horseMap.value.values()) {
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
</script>

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
            @mouseover="horseStore.selectYear(year)"
            @mouseleave="horseStore.selectYear(0)"
            class="px-4"
            :class="{
              isSelected: year === horseStore.selectedYear,
            }"
          >
            {{ year }}
          </button>
          <div class="flex flex-row gap-1 flex-wrap items-start">
            <button
              class="name"
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
    </details>

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
            :horseMap="horseMap"
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
            :horseMap="horseMap"
            :level="0"
            sexType="M"
            class="outline-indigo-300 outline-1 outline p-4 bg-indigo-50 rounded-xl"
          />
        </details>
      </div>
    </details>
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
