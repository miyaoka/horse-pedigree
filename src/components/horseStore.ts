import { defineStore } from "pinia";
import { HorseInfo } from "~/types";
import { useStorage } from "@vueuse/core";
import sampleData from "@/assets/sampleData.json";

type State = {
  selectedHorses: string[];
  selectedYear: number;
  selectedYearRange: number;
  horseMap: Map<string, HorseInfo>;
};
export const useHorseStore = defineStore("horseStore", {
  state: (): State => ({
    selectedHorses: [],
    selectedYear: 0,
    selectedYearRange: 5,
    horseMap: new Map(),
  }),
  actions: {
    select(horse: HorseInfo | null) {
      if (!horse) {
        this.selectedHorses = [];
        return;
      }
      this.selectedHorses = [horse.name];
    },
    isSelected(horse: HorseInfo) {
      return this.selectedHorses.includes(horse.name);
    },
    selectYear(year: number) {
      this.selectedYear = year;
    },
  },
});
