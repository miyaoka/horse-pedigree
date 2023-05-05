<script setup lang="ts">
import jspreadsheet from "jspreadsheet-ce";
import sampleData from "@/assets/sampleData.json";
import { useHorseStore } from "./horseStore";
import { useStorage } from "@vueuse/core";

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
  horseStore.sheetData = sheet.value.getData() as string[][];
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

onMounted(() => {
  const el = sheetRef.value;
  if (!el) return;

  horseStore.sheetData = sheetState.value;
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
      horseStore.selected = [sheetState.value[top][left]];
    },
    onundo(_element, historyRecord) {
      if (!historyRecord) return;
      save();
    },
    onafterchanges() {
      save();
    },
  });
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <button class="px-2 bg-gray-200 outline outline-1" @click="clear">
        clear
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
