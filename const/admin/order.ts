import { DishItem } from "@/types/admin/dish"
import { OrderDishOptions } from "@/types/admin/order"

export const DEFAULT_ORDER_NUMBER = "0001"

export const ORDER_STEP_SEQUENCE = ["packing", "send", "success"] as const

export type OrderStep = (typeof ORDER_STEP_SEQUENCE)[number] | "waiting_payment" | ""

export const ORDER_STEP_LABELS: Record<string, string> = {
  waiting_payment: "Menunggu Pembayaran",
  packing: "Dikemas",
  send: "Dalam Pengiriman",
  success: "Pesanan Diterima",
}

export const STEP_LABEL_MAP = ORDER_STEP_LABELS

export type OrderInvoiceLike = {
  invoice_no?: string | null
  invoice_date?: string | null
  payment_status?: string | null
}

export type OrderWithInvoices = {
  step?: string | null
  delivery_status?: string | null
  invoices?: OrderInvoiceLike[] | null
}

const getInvoiceTimestamp = (value?: string | null) => {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const getLatestInvoice = (order: OrderWithInvoices) => {
  const invoices = order.invoices ?? []
  if (invoices.length === 0) return null
  return [...invoices].sort(
    (a, b) => getInvoiceTimestamp(b.invoice_date) - getInvoiceTimestamp(a.invoice_date)
  )[0]
}

export const isOrderPaid = (order: OrderWithInvoices): boolean => {
  const paymentStatus = getLatestInvoice(order)?.payment_status?.toLowerCase()
  return paymentStatus === "paid"
}

export const normalizeOrderStep = (value?: string | null): string => {
  if (!value || value === "-") return ""
  const byLabel = Object.entries(ORDER_STEP_LABELS).find(([, label]) => label === value)
  if (byLabel) return byLabel[0]
  return value
}

export const getStoredOrderStep = (order: OrderWithInvoices): string => {
  return normalizeOrderStep(order.step ?? order.delivery_status)
}

export const getEffectiveOrderStep = (order: OrderWithInvoices): string => {
  if (!isOrderPaid(order)) return "waiting_payment"
  return getStoredOrderStep(order)
}

export const getOrderStatusLabel = (order: OrderWithInvoices): string => {
  const step = getEffectiveOrderStep(order)
  if (!step) return "-"
  return ORDER_STEP_LABELS[step] ?? step
}

export const getNextOrderStep = (order: OrderWithInvoices): string | null => {
  if (!isOrderPaid(order)) return null

  const currentStep = getStoredOrderStep(order)
  if (!currentStep) return ORDER_STEP_SEQUENCE[0]

  const currentIndex = ORDER_STEP_SEQUENCE.indexOf(
    currentStep as (typeof ORDER_STEP_SEQUENCE)[number]
  )
  if (currentIndex === -1) return ORDER_STEP_SEQUENCE[0]
  if (currentIndex >= ORDER_STEP_SEQUENCE.length - 1) return null
  return ORDER_STEP_SEQUENCE[currentIndex + 1]
}

export const getNextOrderStepLabel = (order: OrderWithInvoices): string | null => {
  const nextStep = getNextOrderStep(order)
  if (!nextStep) return null
  return ORDER_STEP_LABELS[nextStep] ?? nextStep
}

export type OrderMenuField =
  | "rice"
  | "mainDish"
  | "mainDish2"
  | "mainDish3"
  | "additionalDish"
  | "vegetable"
  | "sauce"
  | "chip"
  | "fruit"
  | "mineralWater"
  | "box"
  | "pudding"
  | "snack"
  | "snack2"
  | "snack3"
  | "snack4"

export const orderMenuFieldLabels: Record<OrderMenuField, string> = {
  rice: "Nasi",
  mainDish: "Lauk Utama",
  mainDish2: "Lauk Utama 2",
  mainDish3: "Lauk Utama 3",
  additionalDish: "Lauk Tambahan",
  vegetable: "Sayur",
  sauce: "Sambal",
  chip: "Kerupuk",
  fruit: "Buah",
  mineralWater: "Air Mineral",
  box: "Kotak",
  pudding: "Puding",
  snack: "Snack",
  snack2: "Snack 2",
  snack3: "Snack 3",
  snack4: "Snack 4",
}

export const orderMenuFields = Object.keys(orderMenuFieldLabels) as OrderMenuField[]

const emptyMenuVisibility = (): Record<OrderMenuField, boolean> => ({
  rice: false,
  mainDish: false,
  mainDish2: false,
  mainDish3: false,
  additionalDish: false,
  vegetable: false,
  sauce: false,
  chip: false,
  fruit: false,
  mineralWater: false,
  box: false,
  pudding: false,
  snack: false,
  snack2: false,
  snack3: false,
  snack4: false,
})

const normalizeValue = (value: string | null | undefined) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()

export const getPackageCode = (packageLabel: string | null | undefined) => {
  if (!packageLabel) return ""
  const normalized = String(packageLabel).trim().toLowerCase()
  
  // Cari kata "paket <kode>" dulu (contoh: "paket a", "paket a+")
  const paketMatch = normalized.match(/paket\s*([a-f]\+?)/i)
  if (paketMatch) {
    return paketMatch[1].toUpperCase()
  }
  
  // Cari kode paket mandiri [a-f] atau [a-f]+
  const singleMatch = normalized.match(/(?:^|\s|\b)([a-f]\+?)(?:\s|$|\(|\b)/i)
  if (singleMatch) {
    return singleMatch[1].toUpperCase()
  }
  
  return ""
}

const enableFields = (
  fields: OrderMenuField[],
  visibility = emptyMenuVisibility()
) => {
  fields.forEach((field) => {
    visibility[field] = true
  })
  return visibility
}

const mealFields = (
  mainDishCount: 1 | 2 | 3,
  includePudding: boolean,
  includeFruit = true,
  includeBox = true
) => {
  const fields: OrderMenuField[] = [
    "rice",
    "mainDish",
    ...(mainDishCount >= 2 ? (["mainDish2"] as OrderMenuField[]) : []),
    ...(mainDishCount >= 3 ? (["mainDish3"] as OrderMenuField[]) : []),
    "additionalDish",
    "vegetable",
    "sauce",
    "chip",
    ...(includeFruit ? (["fruit"] as OrderMenuField[]) : []),
    "mineralWater",
    ...(includeBox ? (["box"] as OrderMenuField[]) : []),
    ...(includePudding ? (["pudding"] as OrderMenuField[]) : []),
  ]

  return enableFields(fields)
}

export const getOrderMenuFieldVisibility = (
  product: string | null | undefined,
  packageLabel: string | null | undefined
) => {
  const normalizedProduct = normalizeValue(product)
  const packageCode = getPackageCode(packageLabel)

  console.log("[DEBUG Menu Field Visibility]", {
    product,
    packageLabel,
    extractedPackageCode: packageCode,
    normalizedProduct
  })

  if (normalizedProduct === "custom") {
    return enableFields(orderMenuFields)
  }

  if (normalizedProduct === "aqiqah" || normalizedProduct === "tumpeng") {
    return enableFields(["box"])
  }

  // Pondokan: tidak ada field menu, hanya pilih paket + detail harga
  if (normalizedProduct === "pondokan" || normalizedProduct === "katering pondokan") {
    return emptyMenuVisibility()
  }

  if (normalizedProduct === "snack kotak" || normalizedProduct === "snack") {
    // Paket A/D → 2 kue | B/E → 3 kue | C/F → 4 kue
    const snackCount =
      packageCode === "C" || packageCode === "F" ? 4
      : packageCode === "B" || packageCode === "E" ? 3
      : 2 // A, D, atau default

    const snackFields: OrderMenuField[] =
      snackCount >= 4 ? ["snack", "snack2", "snack3", "snack4", "mineralWater", "box"]
      : snackCount >= 3 ? ["snack", "snack2", "snack3", "mineralWater", "box"]
      : ["snack", "snack2", "mineralWater", "box"]

    return enableFields(snackFields)
  }

  if (normalizedProduct === "bento") {
    // Paket A: 1 lauk, WITH pudding, WITH buah
    // Paket B: 2 lauk, WITH pudding, WITH buah
    const mainDishCount = packageCode === "B" ? 2 : 1
    return mealFields(mainDishCount as 1 | 2, true, true)
  }

  if (
    normalizedProduct === "nasi kotak" ||
    normalizedProduct === "prasmanan" ||
    normalizedProduct === "prasmanan pernikahan"
  ) {
    // A/B/C → tanpa pudding | A+/B+/C+ → dengan pudding
    const mainDishCount: 1 | 2 | 3 =
      packageCode.startsWith("C") ? 3
      : packageCode.startsWith("B") ? 2
      : 1
    const includePudding = packageCode.endsWith("+")
    return mealFields(mainDishCount, includePudding)
  }

  return mealFields(1, false)
}

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
    pudding: [],
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
    pudding: new Set(),
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
    if (normalizedType === "pudding" || normalizedType === "puding") key = "pudding"

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
