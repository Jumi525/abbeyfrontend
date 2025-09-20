import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number: number) {
  if (typeof number !== "number" || isNaN(number)) {
    return "Invalid number";
  }

  if (number < 1000) {
    return number.toString();
  }

  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + "K";
  }

  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  }

  return number.toString();
}
