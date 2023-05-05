import { HorseInfo } from "~/types";

export const sortByBorn = (a: HorseInfo, b: HorseInfo) => {
  return (a.born ?? 0) - (b.born ?? 0);
};

export const numToLast2digits = (num: number) => {
  return String(num % 100).padStart(2, "0");
};
