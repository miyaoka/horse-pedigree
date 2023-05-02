<script setup lang="ts">
import jspreadsheet from "jspreadsheet-ce";
import { sampleData } from "@/assets/sampleData";
import { HorseInfo } from "./types";

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

const sheetRef = ref<HTMLDivElement | null>(null);
const sheetData = ref<string[][]>(sampleData);

onMounted(() => {
  const el = sheetRef.value;
  if (!el) return;
  const sheet = jspreadsheet(el, {
    data: sheetData.value,
    columns: [
      { type: "text", title: "名前", width: 160 },
      { type: "numeric", title: "生年", width: 60 },
      { type: "text", title: "性別", width: 40 },
      { type: "text", title: "父", width: 160 },
      { type: "text", title: "母", width: 160 },
      { type: "text", title: "実績", width: 120 },
    ],
  });
});

const horseMap = computed(() => {
  const map = new Map<string, HorseInfo>();
  for (const row of sheetData.value) {
    const [name, _born, sex, father, mother, win] = row;
    const born = parseInt(_born, 10);

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
    const [name, obj] = entry;
    const { father, mother } = obj;
    const fatherObj = map.get(father);
    const motherObj = map.get(mother);
    if (fatherObj) {
      fatherObj.children.push(name);
    }
    if (motherObj) {
      motherObj.children.push(name);
    }
    if (!fatherObj && !motherObj) {
      obj.isRoot = true;
    }
  }

  return map;
});

const rootList = computed(() => {
  const familyRootList = [];
  const sireRootList = [];

  for (const horse of horseMap.value.values()) {
    if (!horse.isRoot) continue;
    if (horse.sex === "F") {
      familyRootList.push(horse);
    } else {
      sireRootList.push(horse);
    }
  }
  return { sireRootList, familyRootList };
});
</script>

<template>
  <div ref="sheetRef" />

  <div>
    <HorseRenderer
      v-for="horse in rootList.familyRootList"
      :horse="horse"
      :horseMap="horseMap"
      :level="0"
      sexType="F"
    />
    <HorseRenderer
      v-for="horse in rootList.sireRootList"
      :horse="horse"
      :horseMap="horseMap"
      :level="0"
      sexType="M"
    />
  </div>

  <!-- <div class="flex fixed inset-0 top-auto h-40 p-2">
    <textarea v-model="csv" class="border border-black flex-1 p-2" />
  </div>
  <div class="text-3x">
    {{ csv }}
  </div> -->
</template>
