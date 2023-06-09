<script setup lang="ts">
import jspreadsheet from "jspreadsheet-ce";
import sampleData from "@/assets/sampleData.json";
import { useHorseStore } from "./horseStore";
import { useStorage } from "@vueuse/core";
import { HorseInfo } from "~/types";

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

const sheetRef = ref<HTMLDivElement | null>(null);
const initialData = [...sampleData, [], [], [], [], []];
const sheetState = useStorage("sheetData", initialData);
const sheet = ref<jspreadsheet.JspreadsheetInstance | null>(null);

const save = () => {
  if (!sheet.value) return;
  sheetState.value = sheet.value.getData() as string[][];
};
const clear = () => {
  if (!sheet.value) return;
  const ok = confirm("本当にクリアしますか？");
  if (!ok) return;
  sheet.value.setData([[], [], [], [], []]);
  save();
};
const reset = () => {
  if (!sheet.value) return;
  const ok = confirm("サンプルデータにリセットしますか？");
  if (!ok) return;
  sheet.value.setData(initialData);
  save();
};
const addRow = () => {
  if (!sheet.value) return;
  sheet.value.insertRow(5);
  save();
};

const nameRow = 0;
const fatherRow = 3;
const motherRow = 4;

onMounted(() => {
  const el = sheetRef.value;
  if (!el) return;

  sheet.value = jspreadsheet(el, {
    data: sheetState.value,
    columns: [
      { type: "text", title: "名前", width: 120 },
      { type: "numeric", title: "生年", width: 40 },
      { type: "text", title: "性別", width: 30 },
      { type: "text", title: "父", width: 120 },
      { type: "text", title: "母", width: 120 },
      { type: "text", title: "メモ", width: 120 },
      { type: "text", title: "系統", width: 120 },
    ],
    onselection: (instance, left, top, right, bottom) => {
      const selection = [];
      for (let x = left; x <= right; x++) {
        // 名前、父、母の欄で無ければスキップ
        if (!(x === nameRow || x === fatherRow || x === motherRow)) continue;
        for (let y = top; y <= bottom; y++) {
          const cell = sheetState.value[y][x];
          if (!cell) continue;
          selection.push(cell);
        }
      }
      horseStore.selectedHorses = [...new Set(selection)];
    },
    onundo(_element, historyRecord) {
      if (!historyRecord) return;
      save();
    },
    onafterchanges() {
      save();
    },
    onload() {
      save();
    },
  });
});

watch(
  sheetState,
  (state) => {
    const map = new Map<string, HorseInfo>();
    for (const row of state) {
      const [name, _born, sex, father, mother, memo, line] = row;
      if (!name) continue;

      const num = parseInt(_born, 10);
      const born = isNaN(num) ? null : num;
      const obj = {
        name,
        born,
        sex,
        father,
        mother,
        line,
        memo,
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

    horseStore.horseMap = map;
  },
  {
    immediate: true,
  }
);

watch(
  () => horseStore.selectedHorses,
  (selectedHorses) => {
    console.log(selectedHorses);
  }
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2 justify-end px-2">
      <button class="px-2 bg-gray-200 outline outline-1" @click="clear">
        clear all
      </button>
      <button class="px-2 bg-gray-200 outline outline-1" @click="reset">
        load sample
      </button>
    </div>
    <div ref="sheetRef" class="text-xs" />
    <div class="flex gap-2">
      <button class="px-2 bg-gray-200 outline outline-1" @click="addRow">
        ５行追加
      </button>
    </div>
  </div>
</template>

<style scoped></style>
