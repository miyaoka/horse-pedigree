import { defineStore } from "pinia";
import { HorseInfo } from "~/types";

type State = {
  selected: string[];
  selectedYear: number;
  selectedYearRange: number;
};
export const useHorseStore = defineStore("horseStore", {
  state: (): State => ({
    selected: [],
    selectedYear: 0,
    selectedYearRange: 5,
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
