<script setup lang="ts">
import jspreadsheet from "jspreadsheet-ce";
import sampleData from "@/assets/sampleData.json";
import { HorseInfo } from "@/types";
import { sortByBorn } from "./util";
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
  bodyAttrs: {
    class: "p-4",
  },
});

const horseStore = useHorseStore();

const sheetRef = ref<HTMLDivElement | null>(null);
const sheetData = ref<string[][]>(sampleData);

onMounted(() => {
  const el = sheetRef.value;
  if (!el) return;

  jspreadsheet(el, {
    data: sheetData.value,
    columns: [
      { type: "text", title: "名前", width: 160 },
      { type: "numeric", title: "生年", width: 60 },
      { type: "text", title: "性別", width: 40 },
      { type: "text", title: "父", width: 160 },
      { type: "text", title: "母", width: 160 },
      { type: "text", title: "実績", width: 120 },
    ],
    onselection: (instance, left, top, right, bottom) => {
      console.log(sheetData.value[top][left]);
      horseStore.selected = [sheetData.value[top][left]];
    },
  });
});

const horseMap = computed(() => {
  const map = new Map<string, HorseInfo>();
  for (const row of sheetData.value) {
    const [name, born, sex, father, mother, win] = row;

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
    sireRootList: sireRootList.sort(sortByBorn),
    familyRootList: familyRootList.sort(sortByBorn),
  };
});
</script>

<template>
  <div class="flex gap-4 flex-wrap">
    <div>
      <div ref="sheetRef" />
      <details>
        <summary>sheetData</summary>
        {{ sheetData }}
      </details>
      <div>
        {{ horseStore.selected }}
      </div>
    </div>
    <div class="flex flex-row gap-4">
      <div class="p-4 gap-4 flex flex-col">
        <header class="text-lg underline">Family line</header>
        <details v-for="horse in rootList.familyRootList" open>
          <summary class="text-sm">
            <span>{{ horse.name }}</span>
            <span class="ml-2 text-xs">{{ horse.mother }}</span>
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
      <div class="p-4 flex flex-col gap-4">
        <header class="text-lg underline">Sire line</header>

        <details v-for="horse in rootList.sireRootList" open>
          <summary class="text-sm">
            <span>{{ horse.name }}</span>
            <span class="ml-2 text-xs">{{ horse.father }}</span>
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
    </div>
  </div>
</template>
