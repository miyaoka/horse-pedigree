import { HorseInfo } from "~/types";

const strToNum = (str: string) => {
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
};
export const sortByBorn = (a: HorseInfo, b: HorseInfo) => {
  return strToNum(a.born) - strToNum(b.born);
};
