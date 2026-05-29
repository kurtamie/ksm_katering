import { OrderDishOptions } from "@/types/admin/order"

export const dishTypeOptions = [
  { value: "rice", label: "Nasi" },
  { value: "main_dish", label: "Lauk Utama" },
  { value: "additional_dish", label: "Lauk Tambahan" },
  { value: "vegetable", label: "Sayur" },
  { value: "sauce", label: "Sambal" },
  { value: "chip", label: "Kerupuk" },
  { value: "fruit", label: "Buah" },
  { value: "mineral_water", label: "Air Mineral" },
  { value: "box", label: "Kotak" },
] as const

export type DishTypeValue = (typeof dishTypeOptions)[number]["value"]

export const dishTypeLabelMap: Record<DishTypeValue, string> = dishTypeOptions.reduce(
  (acc, item) => {
    acc[item.value] = item.label
    return acc
  },
  {} as Record<DishTypeValue, string>
)

export const getDishTypeLabel = (value: string | null | undefined) => {
  if (!value) return "-"
  const key = value as DishTypeValue
  return dishTypeLabelMap[key] ?? value
}

export const DEFAULT_DISH_OPTIONS: OrderDishOptions = {
  rice: [
    "Ketupat",
    "Lontong",
    "Lontong Pak Eko",
    "Nasi goreng",
    "Nasi goreng seafood",
    "Nasi kuning",
    "Nasi lemak",
    "Nasi putih",
    "Nasi liwet",
  ],
  mainDish: ["Ayam bakar padang", "Ayam geprek", "Ayam fillet", "Semur daging"],
  additionalDish: [
    "Bakwan jagung",
    "Bakwan kedelai",
    "Bakwan kentang",
  ],
  vegetable: ["Tumis", "Bayam", "Kangkung"],
  sauce: ["Sambal Terasi", "Sambal Ijo", "Sambal"],
  chip: ["Kerupuk", "Kerupuk udang kecil", "Kerupuk udang besar"],
  fruit: ["Apel", "Jeruk", "Pisang"],
  mineralWater: ["Aqua 220", "Aqua 330", "Aqua 600", "Le Minerale 330", "Sanford 220", "Sanford 330", "Sanford 600"],
  box: [
    "Kotak putih snack",
    "Bungkus ala nasi padang",
    "Kotak bento",
    "Kotak snack ksm",
    "Kotak warna 19x19",
    "Kotak putih 18x18",
    "Mika bento",
  ],
}
