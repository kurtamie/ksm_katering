import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStrapiURL(path = "") {
  return `${
    process.env.API_URL || "https://big-surprise-ab176c9ad8.strapiapp.com"
  }${path}`;
}
