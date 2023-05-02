import { defineStore } from "pinia";

type State = {
  selected: string[];
};
export const useHorseStore = defineStore("horseStore", {
  state: (): State => ({
    selected: [],
  }),
});
