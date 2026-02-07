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
