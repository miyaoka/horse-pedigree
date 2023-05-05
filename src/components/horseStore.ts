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
});
