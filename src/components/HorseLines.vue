<script setup lang="ts">
import { HorseInfo } from "~/types";
import { useHorseStore } from "./horseStore";
import { sortByBorn } from "./util";

const horseStore = useHorseStore();

const rootList = computed(() => {
  const horseMap = horseStore.horseMap;
  const commonParentMap = new Map<string, HorseInfo>();

  // 親を取得する。なければ作成してmapに登録する
  const getOrCreateParent = (parentName: string, sex: string) => {
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

  // 各馬の親リストを作成する
  for (const horse of horseMap.values()) {
    const { father, mother } = horse;
    if (father && !horseMap.has(father)) {
      const parent = getOrCreateParent(father, "M");
      parent.children.push(horse.name);
    }
    if (mother && !horseMap.has(mother)) {
      const parent = getOrCreateParent(mother, "F");
      parent.children.push(horse.name);
    }
  }

  const familyRootMap = new Map<string, HorseInfo>();
  const sireRootMap = new Map<string, HorseInfo>();

  // 親リストで子を複数持つものはrootMapに追加する
  for (const horse of commonParentMap.values()) {
    if (horse.children.length < 2) continue;
    if (horse.sex === "F") {
      familyRootMap.set(horse.name, horse);
    } else {
      sireRootMap.set(horse.name, horse);
    }
  }

  // 馬一覧でrootとなるものをrootMapに追加する
  for (const horse of horseMap.values()) {
    // 子が無ければrootにしない
    if (horse.children.length === 0) continue;

    // rootまたは系統主になっていないならrootにしない
    if (!(horse.isRoot || horse.line === horse.name)) continue;

    // 親がrootに登録されていないならrootMapに追加する
    if (horse.sex === "F") {
      if (familyRootMap.has(horse.mother)) continue;
      familyRootMap.set(horse.name, horse);
    } else {
      if (familyRootMap.has(horse.father)) continue;
      sireRootMap.set(horse.name, horse);
    }
  }
  return {
    sireRootList: [...sireRootMap.values()].sort(sortByBorn),
    familyRootList: [...familyRootMap.values()].sort(sortByBorn),
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
          <span v-if="horse.line" class="text-xs"
            >（🐎{{ horse.line }}系）</span
          >
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
          <span v-if="horse.line" class="text-xs"
            >（🐎{{ horse.line }}系）</span
          >
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
