<script setup lang="ts">
import { HorseInfo } from "~/types";
import { useHorseStore } from "./horseStore";
import { sortByBorn } from "./util";

const horseStore = useHorseStore();

const rootList = computed(() => {
  const familyRootList = [];
  const sireRootList = [];

  const horseMap = horseStore.horseMap;
  const commonParentMap = new Map<string, HorseInfo>();

  const getParent = (parentName: string, sex: string) => {
    const parent = commonParentMap.get(parentName);
    if (parent) {
      return parent;
    }
    const newParent: HorseInfo = {
      name: parentName,
      born: null,
      sex,
      father: "",
      mother: "",
      line: "",
      memo: "",
      children: [],
      isRoot: true,
    };
    commonParentMap.set(parentName, newParent);
    return newParent;
  };

  for (const horse of horseMap.values()) {
    const { father, mother } = horse;
    if (father && !horseMap.has(father)) {
      const parent = getParent(father, "M");
      parent.children.push(horse.name);
    }
    if (mother && !horseMap.has(mother)) {
      const parent = getParent(mother, "F");
      parent.children.push(horse.name);
    }
  }

  for (const horse of commonParentMap.values()) {
    if (horse.children.length < 2) continue;
    if (horse.sex === "F") {
      familyRootList.push(horse);
    } else {
      sireRootList.push(horse);
    }
  }

  for (const horse of horseMap.values()) {
    if (
      horse.children.length === 0 ||
      !(horse.isRoot || horse.line === horse.name)
    )
      continue;

    if (horse.sex === "F") {
      if (familyRootList.some((root) => root.name === horse.mother)) continue;
      familyRootList.push(horse);
    } else {
      if (familyRootList.some((root) => root.name === horse.fatehr)) continue;
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
  <details name="familyLine" open>
    <summary>Family line</summary>
    <div class="p-4 gap-4 flex flex-col">
      <details v-for="horse in rootList.familyRootList" open>
        <summary class="text-sm">
          <span>{{ horse.name }}</span>
          <span v-if="horse.line" class="text-xs">{{ horse.line }}系</span>
        </summary>
        <HorseRenderer
          :horse="horse"
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
          <span v-if="horse.line" class="text-xs">{{ horse.line }}系</span>
        </summary>
        <HorseRenderer
          :horse="horse"
          :level="0"
          sexType="M"
          class="outline-indigo-300 outline-1 outline p-4 bg-indigo-50 rounded-xl"
        />
      </details>
    </div>
  </details>
</template>

<style scoped></style>
