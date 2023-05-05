import { HorseInfo } from "~/types";

export const sortByBorn = (a: HorseInfo, b: HorseInfo) => {
  return (a.born ?? 0) - (b.born ?? 0);
};
