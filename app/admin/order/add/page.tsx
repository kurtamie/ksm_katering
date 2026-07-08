"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import MapCoordinatePicker from "@/components/custom/Coordinate-input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import React, { useEffect, useState } from "react"
import { createOrder, fetchCustomers, fetchNextTravelLetterNumber, fetchPackages, getCurrentUser } from "@/features/admin/create-order"
import { createCustomer } from "@/features/admin/create-customer"
import { fetchStaffs, type Staff } from "@/features/admin/get-staff"
import { fetchOrderMenuRecommendations, type MenuRecommendations } from "@/features/admin/get-order-menu"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import type { Coordinate } from "@/types/coordinate"
import { fetchDishes } from "@/features/admin/get-dish"
import { CustomerOption, OrderDishOptions, OrderFormValues, PackageOption } from "@/types/admin/order";
import { CustomerFormValues } from "@/types/admin/customer";
import { normalizeRoleValue } from "@/const/misc";
import { getOrderPermissions } from "@/const/permissions";
import { CurrentUser } from "@/types/admin/user";
import { DEFAULT_DISH_OPTIONS } from "@/const/admin/dish";
import { arrives, DEFAULT_ORDER_NUMBER, defaultProducts, getOrderMenuFieldVisibility, mapDishesToOrderOptions, orderMenuFieldLabels, orderMenuFields, type OrderMenuField, suppliers } from "@/const/admin/order";
import { DEFAULT_COORDINATE } from "@/const/default-coordinates";
import { FaPlus } from "react-icons/fa";

const canAddOrder = (position: string | null, department: string | null) =>
  getOrderPermissions(position, department).canAdd

const calculateLeaveTime = (arrivalTime: string) => {
  const [hours, minutes, seconds = "0"] = arrivalTime.split(":")
  const h = Number(hours)
  const m = Number(minutes)
  const s = Number(seconds)

  if ([h, m, s].some((value) => Number.isNaN(value))) {
    return ""
  }

  const date = new Date()
  date.setHours(h, m, s, 0)
  date.setHours(date.getHours() - 1)

  const toTwoDigits = (value: number) => value.toString().padStart(2, "0")

  return `${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())}:${toTwoDigits(date.getSeconds())}`
}

const normalizePriceToThousands = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return ""
  const raw = String(value).trim()
  if (!raw) return ""
  const digitsOnly = raw.replace(/[^\d]/g, "")
  if (!digitsOnly) return ""
  const numeric = Number(digitsOnly)
  if (Number.isNaN(numeric)) return ""
  const inThousands = numeric / 1000
  return Number.isInteger(inThousands) ? String(inThousands) : String(inThousands)
}

const normalizeId = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (!raw) return null
  const numeric = Number(raw)
  return Number.isFinite(numeric) ? numeric : null
}

const normalizeDocumentId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  return raw.length > 0 ? raw : null
}

const formatPackageLabel = (pkg: PackageOption) => {
  const name = pkg.package_name?.trim() ?? ""
  const subname = pkg.subname?.trim()
  const base = name || `Paket ${pkg.id}`
  return subname ? `${base} - ${subname}` : base
}

const getMainDishFromSubname = (subname: string | null | undefined, dishes: string[]) => {
  if (!subname) return ""
  const normalized = subname.toLowerCase()
  const findDish = (keyword: string) =>
    dishes.find((dish) => dish.toLowerCase().includes(keyword)) ?? ""

  if (normalized.includes("ayam")) return findDish("ayam")
  if (normalized.includes("ikan")) return findDish("ikan")
  if (normalized.includes("daging")) return findDish("daging")
  if (normalized.includes("seafood")) return findDish("seafood")

  return ""
}

const filterMainDishesBySubname = (subname: string | null | undefined, dishes: string[]) => {
  if (!subname) return dishes
  const normalized = subname.toLowerCase()
  const keywords: string[] = []
  if (normalized.includes("ayam")) keywords.push("ayam")
  if (normalized.includes("ikan")) keywords.push("ikan")
  if (normalized.includes("daging")) keywords.push("daging")
  if (normalized.includes("seafood")) keywords.push("seafood")

  if (keywords.length === 0) return dishes

  return dishes.filter((dish) =>
    keywords.some((keyword) => dish.toLowerCase().includes(keyword))
  )
}

export default function Page() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [date, setDate] = React.useState<Date>(new Date())
  const [month, setMonth] = React.useState(new Date())
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([])
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([])
  const [productOptions, setProductOptions] = useState<string[]>([])
  const [dishOptions, setDishOptions] = useState<OrderDishOptions>(DEFAULT_DISH_OPTIONS)
  const [salesStaffOptions, setSalesStaffOptions] = useState<Staff[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [staffOptionsLoading, setStaffOptionsLoading] = useState(false)
  const [menuRecommendations, setMenuRecommendations] = useState<MenuRecommendations>({
    rice: "-",
    mainDish: "-",
    additionalDish: "-",
    vegetable: "-",
    sauce: "-",
    chip: "-",
    fruit: "-",
    mineralWater: "-",
    box: "-",
    pudding: "-",
    snack: "-",
  })
  const [coordinates, setCoordinates] = useState<Coordinate>(DEFAULT_COORDINATE)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [customerCoordinates, setCustomerCoordinates] = useState<Coordinate>(DEFAULT_COORDINATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingCustomer, setIsSavingCustomer] = useState(false)
  const [newCustomerValues, setNewCustomerValues] = useState<CustomerFormValues>({
    salesName: "",
    staffId: "",
    gender: "",
    name: "",
    companyName: "",
    phoneNo: "",
    company: "",
    address: "",
  })
  const [formValues, setFormValues] = useState<OrderFormValues>({
    travelLetterNo: "",
    staffId: "",
    customerId: "",
    customerType: "",
    executorTeam: "",
    supplier: "",
    product: "",
    packageId: "",
    qty: "",
    sellingPrice: "",
    brokerFee: "",
    priceForKsm: "",
    minSellingPrice: "",
    amount: "",
    deliveryCharge: "",
    totalAmount: "",
    payment1: "",
    payment2: "",
    payment3: "",
    deliveryNote: "",
    arriveTime: "",
    leaveTime: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    rice: "",
    mainDish: "",
    mainDish2: "",
    mainDish3: "",
    additionalDish: "",
    vegetable: "",
    sauce: "",
    chip: "",
    fruit: "",
    mineralWater: "",
    box: "",
    pudding: "",
    snack: "",
    snack2: "",
    snack3: "",
    snack4: "",
    staffDriverId: "",
  })
  
  useEffect(() => {
    let isMounted = true

    const checkAccess = async () => {
      const user = await getCurrentUser()
      if (!isMounted) return
      setCurrentUser(user)
      const allowed = canAddOrder(user?.staff?.position ?? null, user?.staff?.department ?? null)

      setHasAccess(allowed)
      if (!allowed) {
        toast.error("Anda tidak memiliki akses untuk menambah pesanan")
        router.replace("/admin/order")
      }
    }

    checkAccess()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setOpen(false)
    }
  }

  const updateField = <K extends keyof OrderFormValues>(field: K, value: OrderFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const updateNewCustomerField = <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => {
    setNewCustomerValues((prev) => ({ ...prev, [field]: value }))
  }

  const normalizePhoneNumber = (value: string) => {
    const trimmed = value.replace(/\s+/g, "")
    if (trimmed.startsWith("08")) return `628${trimmed.slice(2)}`
    return trimmed
  }

  const toNullable = (value: string) => {
    const trimmed = value.trim()
    return trimmed === "" ? null : trimmed
  }

  const currentMonthLabel = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  })

  const deriveProductsFromPackages = (packages: PackageOption[]) => {
    const uniqueProducts = new Map<string, string>()

    packages.forEach((pkg) => {
      const name = pkg.product?.trim()
      if (!name) return

      const key = name.toLowerCase()
      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, name)
      }
    })

    return Array.from(uniqueProducts.values())
  }

  const normalizedProduct = formValues.product.trim().toLowerCase()
  const filteredPackageOptions = normalizedProduct
    ? packageOptions.filter((pkg) => pkg.product?.trim().toLowerCase() === normalizedProduct)
    : packageOptions
  const selectedPackage = formValues.packageId
    ? packageOptions.find((pkg) => pkg.id.toString() === formValues.packageId)
    : undefined
  const selectedPackageLabel = selectedPackage ? formatPackageLabel(selectedPackage) : ""
  const visibleMenuFields = React.useMemo(
    () => getOrderMenuFieldVisibility(formValues.product, selectedPackageLabel),
    [formValues.product, selectedPackageLabel]
  )
  const hasMenuField = (field: OrderMenuField) => visibleMenuFields[field]
  const fieldClass = (field: OrderMenuField, className: string) =>
    hasMenuField(field) ? className : `${className} hidden`
  const mainDishFieldCount =
    hasMenuField("mainDish3") ? 3 : hasMenuField("mainDish2") ? 2 : hasMenuField("mainDish") ? 1 : 0
  const filteredMainDishes = filterMainDishesBySubname(selectedPackage?.subname, dishOptions.mainDish)

  const currentStaffId = normalizeId(currentUser?.staff?.id ?? null)
  const currentStaffDocumentId = normalizeDocumentId(currentUser?.staff?.documentId ?? null)
  const activeStaffId = currentStaffId
  const activeStaffDocumentId = currentStaffDocumentId
  const filteredCustomerOptions = customerOptions.filter((customer) => {
      const customerStaffId = normalizeId(customer.staff_id)
      const customerStaffDocumentId = normalizeDocumentId(customer.staff_document_id ?? null)
      const isUnassigned = !customerStaffId && !customerStaffDocumentId
      if (!activeStaffId && !activeStaffDocumentId) return isUnassigned
      return (
        isUnassigned ||
        (activeStaffId && customerStaffId === activeStaffId) ||
        (activeStaffDocumentId && customerStaffDocumentId === activeStaffDocumentId)
      )
    })

  useEffect(() => {
    let isMounted = true

    const loadCustomers = async () => {
      setCustomersLoading(true)
      try {
        const customers = await fetchCustomers()
        if (!isMounted) return
        setCustomerOptions(customers)
      } catch (error) {
        if (!isMounted) return
        toast.error("Gagal memuat data customer")
      } finally {
        if (isMounted) {
          setCustomersLoading(false)
        }
      }
    }

    const loadPackages = async () => {
      setPackagesLoading(true)
      try {
        const packages = await fetchPackages()
        if (!isMounted) return
        setPackageOptions(packages)
        setProductOptions(deriveProductsFromPackages(packages))
      } catch (error) {
        if (!isMounted) return
        toast.error("Gagal memuat data paket")
      } finally {
        if (isMounted) {
          setPackagesLoading(false)
        }
      }
    }

    const loadDishes = async () => {
      try {
        const dishes = await fetchDishes({ page: 1, pageSize: 500 })
        if (!isMounted) return
        setDishOptions(mapDishesToOrderOptions(dishes.data))
      } catch (error) {
        if (!isMounted) return
        toast.error("Gagal memuat data dish")
      }
    }

    loadCustomers()
    loadPackages()
    loadDishes()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setNewCustomerValues((prev) => ({
      ...prev,
      staffId: activeStaffId ? String(activeStaffId) : "",
    }))
  }, [activeStaffId])

  useEffect(() => {
    const loadRecommendations = async () => {
      const recommendations = await fetchOrderMenuRecommendations()
      setMenuRecommendations(recommendations)
      setFormValues((prev) => ({
        ...prev,
        rice: prev.rice || (recommendations.rice !== "-" ? recommendations.rice : ""),
        mainDish: prev.mainDish || (recommendations.mainDish !== "-" ? recommendations.mainDish : ""),
        additionalDish: prev.additionalDish || (recommendations.additionalDish !== "-" ? recommendations.additionalDish : ""),
        vegetable: prev.vegetable || (recommendations.vegetable !== "-" ? recommendations.vegetable : ""),
        sauce: prev.sauce || (recommendations.sauce !== "-" ? recommendations.sauce : ""),
        chip: prev.chip || (recommendations.chip !== "-" ? recommendations.chip : ""),
        fruit: prev.fruit || (recommendations.fruit !== "-" ? recommendations.fruit : ""),
      }))
    }

    loadRecommendations()
  }, [])

  // Order number is generated server-side; do not fetch or set it here.

  useEffect(() => {
    const loadTravelLetterNumber = async () => {
      try {
        const nextTravelLetterNo = await fetchNextTravelLetterNumber()
        setFormValues((prev) => ({ ...prev, travelLetterNo: nextTravelLetterNo || DEFAULT_ORDER_NUMBER }))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat nomor surat jalan")
        setFormValues((prev) => ({ ...prev, travelLetterNo: DEFAULT_ORDER_NUMBER }))
      }
    }

    loadTravelLetterNumber()
  }, [])

  useEffect(() => {
    if (!formValues.arriveTime) {
      setFormValues((prev) => (prev.leaveTime === "" ? prev : { ...prev, leaveTime: "" }))
      return
    }

    const nextLeaveTime = calculateLeaveTime(formValues.arriveTime)
    setFormValues((prev) => (prev.leaveTime === nextLeaveTime ? prev : { ...prev, leaveTime: nextLeaveTime }))
  }, [formValues.arriveTime])

  useEffect(() => {
    if (!formValues.packageId) return

    const isValid = filteredPackageOptions.some((pkg) => pkg.id.toString() === formValues.packageId)
    if (!isValid) {
      setFormValues((prev) => ({ ...prev, packageId: "" }))
    }
  }, [filteredPackageOptions, formValues.packageId])

  useEffect(() => {
    if (!formValues.customerId) return

    const isValid = filteredCustomerOptions.some(
      (customer) => customer.id.toString() === formValues.customerId
    )
    if (!isValid) {
      setFormValues((prev) => ({ ...prev, customerId: "" }))
    }
  }, [filteredCustomerOptions, formValues.customerId])

  useEffect(() => {
    if (!formValues.packageId) {
      setFormValues((prev) => (prev.sellingPrice === "" ? prev : { ...prev, sellingPrice: "" }))
      return
    }

    const selectedPackage = packageOptions.find((pkg) => pkg.id.toString() === formValues.packageId)
    const nextSellingPrice = normalizePriceToThousands(selectedPackage?.price)

    setFormValues((prev) => (prev.sellingPrice === nextSellingPrice ? prev : { ...prev, sellingPrice: nextSellingPrice }))
  }, [formValues.packageId, packageOptions])

  useEffect(() => {
    if (!formValues.packageId) return

    const selectedPackage = packageOptions.find((pkg) => pkg.id.toString() === formValues.packageId)
    const nextMainDish = getMainDishFromSubname(selectedPackage?.subname, dishOptions.mainDish)

    if (!nextMainDish) return

    setFormValues((prev) => (prev.mainDish === nextMainDish ? prev : { ...prev, mainDish: nextMainDish }))
  }, [formValues.packageId, packageOptions, dishOptions.mainDish])

  useEffect(() => {
    if (!formValues.mainDish) return
    if (filteredMainDishes.length === 0) return

    setFormValues((prev) => {
      const next = { ...prev }
      let changed = false

      const clearIfInvalid = (key: "mainDish" | "mainDish2" | "mainDish3") => {
        if (!prev[key]) return
        if (filteredMainDishes.some((dish) => dish === prev[key])) return
        next[key] = ""
        changed = true
      }

      clearIfInvalid("mainDish")
      clearIfInvalid("mainDish2")
      clearIfInvalid("mainDish3")

      return changed ? next : prev
    })
  }, [filteredMainDishes, formValues.mainDish, formValues.mainDish2, formValues.mainDish3])

  useEffect(() => {
    setFormValues((prev) => {
      const next = { ...prev }
      let changed = false

      orderMenuFields.forEach((field) => {
        if (visibleMenuFields[field]) return
        if (!next[field]) return
        next[field] = ""
        changed = true
      })

      if (mainDishFieldCount < 2 && prev.mainDish2) {
        next.mainDish2 = ""
        changed = true
      }
      if (mainDishFieldCount < 3 && prev.mainDish3) {
        next.mainDish3 = ""
        changed = true
      }

      return changed ? next : prev
    })
  }, [mainDishFieldCount, visibleMenuFields])

  useEffect(() => {
    const qtyNumber = Number(formValues.qty)
    const sellingPriceNumber = Number(formValues.sellingPrice)
    const brokerFeeNumber = Number(formValues.brokerFee)
    const deliveryChargeNumber = Number(formValues.deliveryCharge)

    const hasQty = formValues.qty.trim() !== "" && !Number.isNaN(qtyNumber)
    const hasSellingPrice = formValues.sellingPrice.trim() !== "" && !Number.isNaN(sellingPriceNumber)
    const amountValue = hasQty && hasSellingPrice ? qtyNumber * sellingPriceNumber : undefined
    const priceForKsmValue = hasSellingPrice ? Math.max(sellingPriceNumber - (Number.isNaN(brokerFeeNumber) ? 0 : brokerFeeNumber), 0) : undefined
    const totalAmountValue = (amountValue ?? 0) + (Number.isNaN(deliveryChargeNumber) ? 0 : deliveryChargeNumber)
    const shouldShowTotal = amountValue !== undefined || formValues.deliveryCharge.trim() !== ""

    setFormValues((prev) => {
      const next = { ...prev }
      let changed = false

      const setValue = (key: keyof OrderFormValues, value: string) => {
        if (prev[key] !== value) {
          next[key] = value
          changed = true
        }
      }

      setValue("priceForKsm", priceForKsmValue !== undefined ? priceForKsmValue.toString() : "")
      setValue("amount", amountValue !== undefined ? amountValue.toString() : "")
      setValue("totalAmount", shouldShowTotal ? totalAmountValue.toString() : "")

      return changed ? next : prev
    })
  }, [formValues.qty, formValues.sellingPrice, formValues.brokerFee, formValues.deliveryCharge])

  const handleSubmit = async () => {
    if (isSubmitting) return

    const requiredMap: Array<[keyof OrderFormValues, string]> = [
      ["customerId", "Pelanggan"],
      // ["customerType", "Jenis Pelanggan"],
      ["executorTeam", "Tim Eksekusi"],
      ["product", "Produk"],
      ["packageId", "Paket"],
      ["qty", "Jumlah Pesanan"],
      ["sellingPrice", "Harga Jual"],
      ["arriveTime", "Jam Sampai"],
      ["recipientName", "Nama Penerima"],
      ["recipientPhone", "Nomor Telepon Penerima"],
      ["recipientAddress", "Alamat Pengiriman"],
    ]

    orderMenuFields.forEach((field) => {
      if (visibleMenuFields[field]) {
        requiredMap.push([field, orderMenuFieldLabels[field]])
      }
    })

    const missingFields = requiredMap
      .filter(([key]) => !String(formValues[key] ?? "").trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi data: ${missingFields.join(", ")}`)
      return
    }

    const customerIdNumber = Number(formValues.customerId)
    const packageIdNumber = Number(formValues.packageId)
    const staffIdNumber = normalizeId(currentUser?.staff?.id ?? null)

    if (Number.isNaN(customerIdNumber) || Number.isNaN(packageIdNumber)) {
      toast.error("Pelanggan atau paket tidak valid")
      return
    }

    if (!staffIdNumber) {
      toast.error("Staf tidak valid")
      return
    }

    setIsSubmitting(true)
    try {
      const createdDate = new Date().toISOString()

      const payload = {
        orderData: {
          travel_letter_no: formValues.travelLetterNo,
          created_date: createdDate,
          customer_id: customerIdNumber,
          customer_type: formValues.customerType,
          executor_name: formValues.executorTeam,
          supplier: formValues.supplier,
          product: formValues.product,
          package_id: [packageIdNumber],
          recipient_name: formValues.recipientName,
          recipient_phone_no: formValues.recipientPhone,
          delivery_note: formValues.deliveryNote,
          delivery_date: date.toISOString(),
          arrive_time: formValues.arriveTime,
          leave: formValues.leaveTime || formValues.arriveTime,
          delivery_address: formValues.recipientAddress,
          latitude: coordinates.lat.toString(),
          longitude: coordinates.lng.toString(),
        },
        orderDetailData: {
          qty: formValues.qty,
          selling_price: formValues.sellingPrice,
          broker_fee: formValues.brokerFee,
          price_for_ksm: formValues.priceForKsm,
          min_selling_price: formValues.minSellingPrice,
          amount: formValues.amount,
          delivery_charge: formValues.deliveryCharge,
          total_amount: formValues.totalAmount,
          payment1: formValues.payment1,
          payment2: formValues.payment2,
          payment3: formValues.payment3,
        },
        orderMenuData: {
          rice: hasMenuField("rice") ? formValues.rice : "",
          main_dish: hasMenuField("mainDish") ? formValues.mainDish : "",
          main_dish2: hasMenuField("mainDish2") ? formValues.mainDish2 : "",
          main_dish3: hasMenuField("mainDish3") ? formValues.mainDish3 : "",
          additional_dish: hasMenuField("additionalDish") ? formValues.additionalDish : "",
          vegetable: hasMenuField("vegetable") ? formValues.vegetable : "",
          sauce: hasMenuField("sauce") ? formValues.sauce : "",
          chip: hasMenuField("chip") ? formValues.chip : "",
          fruit: hasMenuField("fruit") ? formValues.fruit : "",
          mineral_water: hasMenuField("mineralWater") ? formValues.mineralWater : "",
          box: hasMenuField("box") ? formValues.box : "",
          pudding: hasMenuField("pudding") ? formValues.pudding : "",
          snack: hasMenuField("snack") ? formValues.snack : "",
          snack2: hasMenuField("snack2") ? formValues.snack2 : "",
          snack3: hasMenuField("snack3") ? formValues.snack3 : "",
          snack4: hasMenuField("snack4") ? formValues.snack4 : "",
        },
      }

      const result = await createOrder(payload, { staffId: staffIdNumber })

      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan pesanan")
      }

      if (result.resolvedTravelLetterNo && result.resolvedTravelLetterNo !== formValues.travelLetterNo) {
        setFormValues((prev) => ({ ...prev, travelLetterNo: result.resolvedTravelLetterNo ?? prev.travelLetterNo }))
        toast.message(`Nomor surat jalan diubah menjadi ${result.resolvedTravelLetterNo} karena sudah terpakai`)
      }

      toast.success("Pesanan berhasil dibuat")
      router.push("/admin/order")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan pesanan"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveCustomer = async () => {
    if (isSavingCustomer) return

    const requiredMap: Array<[keyof CustomerFormValues, string]> = [
      ["gender", "Sapaan Pelanggan"],
      ["name", "Nama"],
      ["companyName", "Nama Instansi/Perusahaan"],
      ["phoneNo", "No. HP"],
      ["company", "Instansi"],
      ["address", "Alamat"],
    ]
    const missingFields = requiredMap
      .filter(([key]) => !newCustomerValues[key].trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi data pelanggan: ${missingFields.join(", ")}`)
      return
    }

    setIsSavingCustomer(true)
    try {
      const result = await createCustomer({
        gender: toNullable(newCustomerValues.gender),
        name: toNullable(newCustomerValues.name),
        company_name: toNullable(newCustomerValues.companyName),
        phone_no: toNullable(newCustomerValues.phoneNo),
        company: toNullable(newCustomerValues.company),
        address: toNullable(newCustomerValues.address),
        latitude: customerCoordinates.lat.toString(),
        longitude: customerCoordinates.lng.toString(),
        staff_id: activeStaffId ?? null,
        user_id: null,
        orders: null,
      })

      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan pelanggan")
      }

      let createdCustomer = result.customer
      if (createdCustomer) {
        setCustomerOptions((prev) => [...prev, createdCustomer as CustomerOption])
      } else {
        const customers = await fetchCustomers()
        setCustomerOptions(customers)
        createdCustomer = [...customers]
          .reverse()
          .find((customer) => customer.phone_no === newCustomerValues.phoneNo && customer.name === newCustomerValues.name)
      }

      if (createdCustomer?.id) {
        updateField("customerId", String(createdCustomer.id))
      }

      setNewCustomerValues({
        salesName: "",
        staffId: activeStaffId ? String(activeStaffId) : "",
        gender: "",
        name: "",
        companyName: "",
        phoneNo: "",
        company: "",
        address: "",
      })
      setCustomerCoordinates(DEFAULT_COORDINATE)
      setCustomerDialogOpen(false)
      toast.success("Pelanggan berhasil dibuat")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan pelanggan")
    } finally {
      setIsSavingCustomer(false)
    }
  }

  if (hasAccess !== true) {
    return null
  }
  return (
    <div className="w-full bg-[#F5F5F5]">
      <Toaster position="top-right" richColors />
      <div className="container w-full md:w-full mx-auto px-4 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="text-gray-500">
              <BreadcrumbLink href="/admin/order">KSM Katering</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Form Pesanan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-2 md:mt-2 flex flex-col gap-4">
          <div className="flex flex-col py-4 md:py-4">
            <h1 className="font-bold text-lg md:text-xl text-gray-600">FORM PESANAN</h1>
            <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
          </div>
          <div className="w-full mb-6 md:mb-8 -mt-4 flex flex-col gap-0">
            <h2 className="order-[10] rounded-t-lg bg-white px-4 py-3 text-base font-bold text-red-800">Data Pesanan</h2>
            {/* order_no is generated server-side; no input displayed here */}
            <h2 className="order-[20] mt-4 rounded-t-lg bg-white px-4 py-3 font-bold text-red-800">Data Pelanggan</h2>
            <div className="order-[22] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="customer_id">Pelanggan <span className="text-red-500">*</span></Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={formValues.customerId}
                  onValueChange={(value) => updateField("customerId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={customersLoading ? "Memuat..." : "Pilih Pelanggan"} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectGroup>
                      <SelectLabel>Pelanggan</SelectLabel>
                      {customersLoading ? (
                        <SelectItem value="loading" disabled>
                          Memuat pelanggan...
                        </SelectItem>
                      ) : filteredCustomerOptions.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Belum ada pelanggan
                        </SelectItem>
                      ) : (
                        filteredCustomerOptions.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {`${customer.phone_no || "-"} - ${customer.name || "Tanpa nama"}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button type="button" className="shrink-0" onClick={() => setCustomerDialogOpen(true)}>
                  <FaPlus />
                  Tambah Pelanggan
                </Button>
              </div>
            </div>
            <h2 className="order-[30] mt-4 rounded-t-lg bg-white px-4 py-3 text-base font-bold text-red-800">Detail Pesanan</h2>
            <h2 className="order-[50] mt-4 rounded-t-lg bg-white px-4 py-3 text-base font-bold text-red-800">Detail Harga</h2>

            <div className="order-[12] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="created_by">Bulan</Label>
              <Input type="text" name="created_by" id="created_by" value={currentMonthLabel} readOnly />
            </div>
            <div className="order-[23] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="customer_type">Jenis Pelanggan <span className="text-red-500">*</span></Label>
              <ToggleGroup
                type="single"
                value={formValues.customerType}
                onValueChange={(value) => updateField("customerType", value ?? "")}
                variant="outline"
                spacing={2}
                size="sm"
                className="grid grid-cols-2 gap-2 md:grid-cols-4"
              >
                <ToggleGroupItem value="pemerintah" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Pemerintah
                </ToggleGroupItem>
                <ToggleGroupItem value="swasta" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Swasta
                </ToggleGroupItem>
                <ToggleGroupItem value="personal" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Personal
                </ToggleGroupItem>
                <ToggleGroupItem value="bumn" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  BUMN
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="order-[16] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="executor_name">Tim Eksekusi  <span className="text-red-500">*</span></Label>
              <ToggleGroup
                type="single"
                value={formValues.executorTeam}
                onValueChange={(value) => updateField("executorTeam", value ?? "")}
                variant="outline"
                spacing={2}
                size="sm"
                className="grid grid-cols-2 gap-2 md:grid-cols-3"
              >
                <ToggleGroupItem value="tim_kotak" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Tim Kotak
                </ToggleGroupItem>
                <ToggleGroupItem value="tim_prasmanan" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Tim Prasmanan
                </ToggleGroupItem>
                <ToggleGroupItem value="tim_snack" className="data-[state=on]:bg-red-700 data-[state=on]:text-white data-[state=on]:border-gray-300">
                  Tim Snack
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="order-[17] grid w-full max-w-full items-center gap-1.5 rounded-b-lg bg-white px-4 py-3 md:px-6 mb-4">
              <Label htmlFor="nama">Pemasok</Label>
              <Select value={formValues.supplier} onValueChange={(value) => updateField("supplier", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Masukkan pemasok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pemasok</SelectLabel>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="order-[31] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="product">Layanan <span className="text-red-500">*</span></Label>
              <Select value={formValues.product} onValueChange={(value) => updateField("product", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Product</SelectLabel>
                    {(productOptions.length ? productOptions : defaultProducts).map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="order-[32] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="product">Paket <span className="text-red-500">*</span></Label>
              <Select
                value={formValues.packageId}
                onValueChange={(value) => updateField("packageId", value)}
                disabled={packagesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      packagesLoading
                        ? "Memuat..."
                        : formValues.product
                          ? "Pilih Paket"
                          : "Pilih layanan dulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Paket</SelectLabel>
                    {filteredPackageOptions.map((packageses) => (
                      <SelectItem key={packageses.id} value={packageses.id.toString()}>
                        {formatPackageLabel(packageses)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="order-[51] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="qty">Jumlah Pesanan <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                name="qty"
                id="qty"
                placeholder="0"
                value={formValues.qty}
                onChange={(e) => updateField("qty", e.target.value)}
              />
            </div>
            <div className="order-[52] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="selling_price">Harga Jual <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                name="selling_price"
                id="selling_price"
                placeholder="0"
                value={formValues.sellingPrice}
                onChange={(e) => updateField("sellingPrice", e.target.value)}
              />
            </div>
            {/* <div className="grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="broker_fee">Bayaran Jasa Broker</Label>
              <Input
                type="number"
                name="broker_fee"
                id="broker_fee"
                placeholder="0"
                value={formValues.brokerFee}
                onChange={(e) => updateField("brokerFee", e.target.value)}
              />
            </div> */}
            {/* <div className="order-[52] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="price_for_ksm">Harga Untuk KSM</Label>
              <Input
                type="number"
                name="price_for_ksm"
                id="price_for_ksm"
                placeholder="0"
                value={formValues.priceForKsm}
                onChange={(e) => updateField("priceForKsm", e.target.value)}
              />
            </div> */}
            {/* <div className="order-[53] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="min_selling_price">Harga Minimum</Label>
              <Input
                type="number"
                name="min_selling_price"
                id="min_selling_price"
                placeholder="0"
                value={formValues.minSellingPrice}
                onChange={(e) => updateField("minSellingPrice", e.target.value)}
              />
            </div> */}
            <div className="order-[53] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="amount">Subtotal Harga</Label>
              <Input
                type="number"
                name="amount"
                id="amount"
                placeholder="0"
                value={formValues.amount}
                onChange={(e) => updateField("amount", e.target.value)}
              />
            </div>
            <div className="order-[54] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="delivery_charge">Biaya Pengiriman</Label>
              <Input
                type="number"
                name="delivery_charge"
                id="delivery_charge"
                placeholder="0"
                value={formValues.deliveryCharge}
                onChange={(e) => updateField("deliveryCharge", e.target.value)}
              />
            </div>
            <div className="order-[55] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="total_amount">Total Harga</Label>
              <Input
                type="number"
                name="total_amount"
                id="total_amount"
                placeholder="0"
                value={formValues.totalAmount}
                onChange={(e) => updateField("totalAmount", e.target.value)}
              />
            </div>
            <div className="order-[56] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="payment1">Pembayaran 1</Label>
              <Input
                type="number"
                name="payment1"
                id="payment1"
                placeholder="0"
                value={formValues.payment1}
                onChange={(e) => updateField("payment1", e.target.value)}
              />
            </div>
            <div className="order-[57] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="payment2">Pembayaran 2</Label>
              <Input
                type="number"
                name="payment2"
                id="payment2"
                placeholder="0"
                value={formValues.payment2}
                onChange={(e) => updateField("payment2", e.target.value)}
              />
            </div>
            <div className="order-[58] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="payment3">Pembayaran 3</Label>
              <Input
                type="number"
                name="payment3"
                id="payment3"
                placeholder="0"
                value={formValues.payment3}
                onChange={(e) => updateField("payment3", e.target.value)}
              />
            </div>
            <div className="order-[49] grid w-full max-w-full items-center gap-1.5 rounded-b-lg bg-white px-4 py-3 md:px-6 mb-4">
              <Label htmlFor="delivery_note">Keterangan</Label>
              <Textarea
                name="delivery_note"
                id="delivery_note"
                placeholder="Masukkan keterangan"
                value={formValues.deliveryNote}
                onChange={(e) => updateField("deliveryNote", e.target.value)}
              />
            </div>
            <div className={fieldClass("rice", "order-[33] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="rice"> Nasi <span className="text-red-500">*</span></Label>
              <Select value={formValues.rice} onValueChange={(value) => updateField("rice", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih nasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nasi</SelectLabel>
                    {dishOptions.rice.map((rice) => (
                      <SelectItem key={rice} value={rice}>
                        {rice}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: {menuRecommendations.rice}</Label>
            </div>
            <div className={fieldClass("mainDish", "order-[34] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="main_dish">Lauk Utama <span className="text-red-500">*</span></Label>
              <Select value={formValues.mainDish} onValueChange={(value) => updateField("mainDish", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lauk utama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lauk Utama</SelectLabel>
                    {filteredMainDishes.map((maindish) => (
                      <SelectItem key={maindish} value={maindish}>
                        {maindish}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">
                Recommend: {menuRecommendations.mainDish}
              </Label>
            </div>
            {mainDishFieldCount >= 2 ? (
              <div className="order-[35] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
                <Label htmlFor="main_dish2">Lauk Utama 2 <span className="text-red-500">*</span></Label>
                <Select value={formValues.mainDish2} onValueChange={(value) => updateField("mainDish2", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih lauk utama 2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lauk Utama</SelectLabel>
                      {filteredMainDishes.map((maindish) => (
                        <SelectItem key={maindish} value={maindish}>
                          {maindish}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {mainDishFieldCount >= 3 ? (
              <div className="order-[36] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
                <Label htmlFor="main_dish3">Lauk Utama 3 <span className="text-red-500">*</span></Label>
                <Select value={formValues.mainDish3} onValueChange={(value) => updateField("mainDish3", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih lauk utama 3" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lauk Utama</SelectLabel>
                      {filteredMainDishes.map((maindish) => (
                        <SelectItem key={maindish} value={maindish}>
                          {maindish}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className={fieldClass("additionalDish", "order-[37] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="additional_dish">Lauk Tambahan <span className="text-red-500">*</span></Label>
              <Select value={formValues.additionalDish} onValueChange={(value) => updateField("additionalDish", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lauk tambahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lauk Tambahan</SelectLabel>
                    {dishOptions.additionalDish.map((additionaldish) => (
                      <SelectItem key={additionaldish} value={additionaldish}>
                        {additionaldish}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: {menuRecommendations.additionalDish}</Label>
            </div>
            <div className={fieldClass("vegetable", "order-[38] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="vegetable">Sayur <span className="text-red-500">*</span></Label>
              <Select value={formValues.vegetable} onValueChange={(value) => updateField("vegetable", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sayur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sayur</SelectLabel>
                    {dishOptions.vegetable.map((vegetable) => (
                      <SelectItem key={vegetable} value={vegetable}>
                        {vegetable}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: {menuRecommendations.vegetable}</Label>
            </div>
            <div className={fieldClass("sauce", "order-[39] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="sauce">Sambal <span className="text-red-500">*</span></Label>
              <Select value={formValues.sauce} onValueChange={(value) => updateField("sauce", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sambal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sambal</SelectLabel>
                    {dishOptions.sauce.map((sauce) => (
                      <SelectItem key={sauce} value={sauce}>
                        {sauce}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: {menuRecommendations.sauce}</Label>
            </div>
            <div className={fieldClass("chip", "order-[40] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="chip">Kerupuk <span className="text-red-500">*</span></Label>
              <Select value={formValues.chip} onValueChange={(value) => updateField("chip", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kerupuk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kerupuk</SelectLabel>
                    {dishOptions.chip.map((chip) => (
                      <SelectItem key={chip} value={chip}>
                        {chip}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">
                Recommend: {menuRecommendations.chip}
              </Label>
            </div>
            <div className={fieldClass("fruit", "order-[41] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="fruit">Buah <span className="text-red-500">*</span></Label>
              <Select value={formValues.fruit} onValueChange={(value) => updateField("fruit", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih buah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Buah</SelectLabel>
                    {dishOptions.fruit.map((fruit) => (
                      <SelectItem key={fruit} value={fruit}>
                        {fruit}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: {menuRecommendations.fruit}</Label>
            </div>
            <div className={fieldClass("mineralWater", "order-[42] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="mineral_water">Air Mineral <span className="text-red-500">*</span></Label>
              <Select value={formValues.mineralWater} onValueChange={(value) => updateField("mineralWater", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih air mineral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Air Mineral</SelectLabel>
                    {dishOptions.mineralWater.map((mineralWater) => (
                      <SelectItem key={mineralWater} value={mineralWater}>
                        {mineralWater}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className={fieldClass("box", "order-[43] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="box">Kotak</Label>
              <Select value={formValues.box} onValueChange={(value) => updateField("box", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kotak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kotak</SelectLabel>
                    {dishOptions.box.map((box) => (
                      <SelectItem key={box} value={box}>
                        {box}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className={fieldClass("pudding", "order-[44] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="pudding">Puding </Label>
              <Input
                type="text"
                name="pudding"
                id="pudding"
                placeholder="Masukkan puding"
                value={formValues.pudding}
                onChange={(e) => updateField("pudding", e.target.value)}
              />
            </div>
            <div className={fieldClass("snack", "order-[45] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="snack">Snack  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="snack"
                id="snack"
                placeholder="Masukkan snack"
                value={formValues.snack}
                onChange={(e) => updateField("snack", e.target.value)}
              />
            </div>
            <div className={fieldClass("snack2", "order-[46] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="snack2">Snack 2  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="snack2"
                id="snack2"
                placeholder="Masukkan snack 2"
                value={formValues.snack2}
                onChange={(e) => updateField("snack2", e.target.value)}
              />
            </div>
            <div className={fieldClass("snack3", "order-[47] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="snack3">Snack 3  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="snack3"
                id="snack3"
                placeholder="Masukkan snack 3"
                value={formValues.snack3}
                onChange={(e) => updateField("snack3", e.target.value)}
              />
            </div>
             <div className={fieldClass("snack4", "order-[48] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6")}>
              <Label htmlFor="snack4">Snack 4  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="snack4"
                id="snack4"
                placeholder="Masukkan snack 4"
                value={formValues.snack4}
                onChange={(e) => updateField("snack4", e.target.value)}
              />
            </div>
            <div className="order-[13] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="delivery_date">Tanggal Kirim  <span className="text-red-500">*</span></Label>
              <div className="relative flex gap-2">
                <Input
                  id="date"
                  value={date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  placeholder="Pilih tanggal"
                  className="bg-background pr-10"
                  readOnly
                />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button id="date-picker" variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Pilih tanggal </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} captionLayout="dropdown" month={month} onMonthChange={setMonth} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="order-[14] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="arrive_time">Jam Sampai  <span className="text-red-500">*</span></Label>
              <Select value={formValues.arriveTime} onValueChange={(value) => updateField("arriveTime", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tentukan jam sampai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Jam sampai</SelectLabel>
                    {arrives.map((arrive) => (
                      <SelectItem key={arrive} value={arrive}>
                        {arrive}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="order-[15] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="leave">Berangkat</Label>
              <Input
                type="text"
                name="leave"
                id="leave"
                placeholder="Jam berangkat yang ditentukan"
                value={formValues.leaveTime}
                disabled
              />
            </div>
            <div className="order-[24] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="recipient_name">Nama Penerima  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="recipient_name"
                id="recipient_name"
                placeholder="Masukkan nama penerima"
                value={formValues.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value)}
              />
            </div>
            <div className="order-[25] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="recipient_phone_no">Nomor Telepon Penerima  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="recipient_phone_no"
                id="recipient_phone_no"
                placeholder="Masukkan nomor telepon penerima"
                value={formValues.recipientPhone}
                onChange={(e) => updateField("recipientPhone", e.target.value)}
              />
            </div>
            <div className="order-[26] grid w-full max-w-full items-center gap-1.5 bg-white px-4 py-3 md:px-6">
              <Label htmlFor="recipient_address">Alamat  <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="recipient_address"
                id="recipient_address"
                placeholder="Masukkan alamat penerima"
                value={formValues.recipientAddress}
                onChange={(e) => updateField("recipientAddress", e.target.value)}
              />
            </div>
            <div className="order-[27] grid w-full max-w-full items-center gap-1.5 rounded-b-lg bg-white px-4 py-3 md:px-6 mb-4">
              <MapCoordinatePicker value={coordinates} onChange={setCoordinates} />
            </div>
            <div className="order-[60] grid w-full max-w-full items-center gap-1.5 rounded-b-lg bg-white px-4 py-3 md:px-6">
            <Button className="w-full md:w-auto text-white cursor-pointer" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "SIMPAN"}
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {/* <div className="grid gap-1.5">
              <Label htmlFor="modal_staff_id">Nama Sales</Label>
              <Input
                id="modal_staff_id"
                value={newCustomerValues.salesName || "Tanpa sales"}
                readOnly
              />
            </div> */}
            <div className="grid gap-1.5">
              <Label>Sapaan Pelanggan</Label>
              <Select value={newCustomerValues.gender} onValueChange={(value) => updateNewCustomerField("gender", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kak">Kak</SelectItem>
                  <SelectItem value="bang">Bang</SelectItem>
                  <SelectItem value="bu">Bu</SelectItem>
                  <SelectItem value="bp">Pak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="modal_customer_name">Nama Pelanggan</Label>
              <Input id="modal_customer_name" value={newCustomerValues.name} onChange={(event) => updateNewCustomerField("name", event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="modal_phone_no">Nomor Telepon</Label>
              <Input id="modal_phone_no" value={newCustomerValues.phoneNo} onChange={(event) => updateNewCustomerField("phoneNo", normalizePhoneNumber(event.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Jenis Pelanggan</Label>
              <Select value={newCustomerValues.company} onValueChange={(value) => updateNewCustomerField("company", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="bumn">BUMN</SelectItem>
                  <SelectItem value="swasta">Swasta</SelectItem>
                  <SelectItem value="pariwisata">Pariwisata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="modal_company_name">Nama Instansi/Perusahaan</Label>
              <Input id="modal_company_name" value={newCustomerValues.companyName} onChange={(event) => updateNewCustomerField("companyName", event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="modal_address">Alamat</Label>
              <Input id="modal_address" value={newCustomerValues.address} onChange={(event) => updateNewCustomerField("address", event.target.value)} />
            </div>
            <MapCoordinatePicker value={customerCoordinates} onChange={setCustomerCoordinates} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(false)} disabled={isSavingCustomer}>
              Batal
            </Button>
            <Button type="button" onClick={handleSaveCustomer} disabled={isSavingCustomer}>
              {isSavingCustomer ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}

// Force nextjs hot reload trigger 2
