<script setup lang="ts">
import { HorseInfo } from "~/types";
import { sortByBorn } from "./util";
import { useHorseStore } from "./horseStore";
import { HorseStore } from "~~/.nuxt/components";

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
  return children.sort(sortByBorn);
});

const onHover = (name: string) => {
  horseStore.selected = [name];
};

const parentName = computed(() => {
  return props.sexType === "M" ? props.horse.mother : props.horse.father;
});
</script>

<template>
  <div class="ml-4">
    <button
      class="horse flex gap-1 items-center"
      @mouseover="onHover(horse.name)"
      :class="{
        isSelected: horseStore.selected.includes(horse.name),
      }"
    >
      <div class="text-xs text-gray-400">{{ horse.born }}</div>
      <div
        class="name"
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
  background: #ecd062;
}
.isFemale {
  color: red;
}
</style>
