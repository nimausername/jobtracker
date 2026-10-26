import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
