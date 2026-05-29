import { DishItem } from "@/types/admin/dish"
import { OrderDishOptions } from "@/types/admin/order"

export const DEFAULT_ORDER_NUMBER = "0001"

export const getMainDishFieldCount = (packageLabel: string | null | undefined) => {
  const normalized = String(packageLabel ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()

  if (/\bpaket c\+?\b/.test(normalized)) return 3
  if (/\bpaket b\+?\b/.test(normalized)) return 2
  if (/\bpaket a\+?\b/.test(normalized)) return 1

  return 1
}

export const mapDishesToOrderOptions = (dishes: DishItem[]): OrderDishOptions => {
  const next: OrderDishOptions = {
    rice: [],
    mainDish: [],
    additionalDish: [],
    vegetable: [],
    sauce: [],
    chip: [],
    fruit: [],
    mineralWater: [],
    box: [],
  }

  const seen: Record<keyof OrderDishOptions, Set<string>> = {
    rice: new Set(),
    mainDish: new Set(),
    additionalDish: new Set(),
    vegetable: new Set(),
    sauce: new Set(),
    chip: new Set(),
    fruit: new Set(),
    mineralWater: new Set(),
    box: new Set(),
  }

  dishes.forEach((dish) => {
    const name = dish.name?.trim()
    if (!name || name === "-") return

    const normalizedType = String(dish.type ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")

    let key: keyof OrderDishOptions | null = null
    if (normalizedType === "rice") key = "rice"
    if (normalizedType === "main_dish") key = "mainDish"
    if (normalizedType === "additional_dish") key = "additionalDish"
    if (normalizedType === "vegetable") key = "vegetable"
    if (normalizedType === "sauce") key = "sauce"
    if (normalizedType === "chip") key = "chip"
    if (normalizedType === "fruit") key = "fruit"
    if (normalizedType === "mineral_water") key = "mineralWater"
    if (normalizedType === "box") key = "box"

    if (!key) return

    const normalizedName = name.toLowerCase()
    if (seen[key].has(normalizedName)) return
    seen[key].add(normalizedName)
    next[key].push(name)
  })

  return next
}


export const suppliers = ["Dapur KCI", "Bu Farida", "Bu Anti"]

export const defaultProducts = [
    "Nasi Kotak",
    "Prasmanan",
    "Pondokan",
    "Coffee Break",
    "Tumpeng",
    "Custom",
    "Bento",
    "Aqiqah",
    "Snack",
    "Rantangan",
]
  
export const sauces = ["Sambal Terasi", "Sambal Ijo", "Sambal"]
  
export const boxes = [
    "Kotak putih snack",
    "Bungkus ala nasi padang",
    "Kotak bento",
    "Kotak snack ksm",
    "Kotak warna 19x19",
    "Kotak putih 18x18",
    "Mika bento",
]
  
export const arrives = [
    "01:00:00",
    "01:30:00",
    "02:00:00",
    "02:30:00",
    "03:00:00",
    "03:30:00",
    "04:00:00",
    "04:30:00",
    "05:00:00",
    "05:30:00",
    "06:00:00",
    "06:30:00",
    "07:00:00",
    "07:30:00",
    "08:00:00",
    "08:30:00",
    "09:00:00",
    "09:30:00",
    "10:00:00",
    "10:30:00",
    "11:00:00",
    "11:30:00",
    "12:00:00",
    "12:30:00",
    "13:00:00",
    "13:30:00",
    "14:00:00",
    "14:30:00",
    "15:00:00",
    "15:30:00",
    "16:00:00",
    "16:30:00",
    "17:00:00",
    "17:30:00",
    "18:00:00",
    "18:30:00",
    "19:00:00",
    "19:30:00",
    "20:00:00",
    "20:30:00",
    "21:00:00",
    "21:30:00",
    "22:00:00",
    "22:30:00",
    "23:00:00",
    "23:30:00",
    "00:00:00",
    "00:30:00",
]
