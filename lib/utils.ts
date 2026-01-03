import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStrapiURL(path = "") {
  return `${
    process.env.API_URL || "http://localhost:1337"
  }${path}`;
}
