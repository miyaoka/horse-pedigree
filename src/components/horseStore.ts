import { defineStore } from "pinia";
import { HorseInfo } from "~/types";
import { useStorage } from "@vueuse/core";
import sampleData from "@/assets/sampleData.json";

type State = {
  selected: string[];
  selectedYear: number;
  selectedYearRange: number;
  sheetData: string[][];
};
export const useHorseStore = defineStore("horseStore", {
  state: (): State => ({
    selected: [],
    selectedYear: 0,
    selectedYearRange: 5,
    sheetData: [[]],
  }),
  actions: {
    select(horse: HorseInfo | null) {
      if (!horse) {
        this.selected = [];
        return;
      }
      this.selected = [horse.name];
    },
    isSelected(horse: HorseInfo) {
      return this.selected.includes(horse.name);
    },
    selectYear(year: number) {
      this.selectedYear = year;
    },
  },
  getters: {
    horseMap(state) {
      const map = new Map<string, HorseInfo>();
      for (const row of state.sheetData) {
        const [name, _born, sex, father, mother, line, memo] = row;
        if (!name) continue;

        const num = parseInt(_born, 10);
        const born = isNaN(num) ? 0 : num;
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

      return map;
    },
  },
});
