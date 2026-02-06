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
import React, { useEffect, useState } from "react"
import { fetchCustomers, fetchPackages } from "@/features/admin/create-order"
import { fetchStaffs, type Staff } from "@/features/admin/get-staff"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useRouter, useParams } from "next/navigation"
import type { Coordinate } from "@/types/coordinate"
import { fetchOrderForEdit, updateOrder } from "@/features/admin/update-order"

type CustomerOption = {
  id: number
  name: string
  phone_no: string
}

type PackageOption = {
  id: number
  package_name: string
  product?: string
}

type FormValues = {
  orderNo: string
  customerId: string
  customerType: string
  executorTeam: string
  supplier: string
  product: string
  packageId: string
  qty: string
  sellingPrice: string
  brokerFee: string
  priceForKsm: string
  minSellingPrice: string
  amount: string
  deliveryCharge: string
  totalAmount: string
  deliveryNote: string
  arriveTime: string
  leaveTime: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  rice: string
  mainDish: string
  additionalDish: string
  vegetable: string
  sauce: string
  chip: string
  fruit: string
  mineralWater: string
  box: string
  pudding: string
  snack: string
  staffDriverId: string
}

const DEFAULT_COORDINATE: Coordinate = { lat: 1.134118, lng: 104.027631 }
const DEFAULT_ORDER_NUMBER = "0001"

const normalizeRoleValue = (value: string | null | undefined) =>
  value?.toLowerCase() ?? ""

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

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.documentId as string
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date>(new Date())
  const [month, setMonth] = React.useState(new Date())
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([])
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([])
  const [productOptions, setProductOptions] = useState<string[]>([])
  const [driverOptions, setDriverOptions] = useState<Staff[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<Coordinate>(DEFAULT_COORDINATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [formValues, setFormValues] = useState<FormValues>({
    orderNo: "",
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
    deliveryNote: "",
    arriveTime: "",
    leaveTime: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    rice: "",
    mainDish: "",
    additionalDish: "",
    vegetable: "",
    sauce: "",
    chip: "",
    fruit: "",
    mineralWater: "",
    box: "",
    pudding: "",
    snack: "",
    staffDriverId: "",
  })
  const [metaIds, setMetaIds] = useState({
    orderId: null as number | null,
    orderDetailId: null as number | null,
    orderMenuId: null as number | null,
  })
  const suppliers = ["Dapur KCI", "Bu Farida", "Bu Anti"]
  const defaultProducts = [
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
  const rices = [
    "Ketupat",
    "Lontong",
    "Lontong Pak Eko",
    "Nasi goreng",
    "Nasi goreng seafood",
    "Nasi kuning",
    "Nasi lemak",
    "Nasi putih",
    "Nasi liwet",
  ]
  const mainDishes = ["Ayam bakar padang", "Ayam geprek", "Ayam fillet", "Semur daging"]
  const additionalDishes = [
    "Bakwan jagung",
    "Bakwan kedelai",
    "Bakwan kentang",
  ]
  const vegetables = ["Tumis", "Bayam", "Kangkung"]
  const sauces = ["Sambal Terasi", "Sambal Ijo", "Sambal"]
  const chips = ["Kerupuk", "Kerupuk udang kecil", "Kerupuk udang besar"]
  const fruits = ["Apel", "Jeruk", "Pisang"]
  const mineralWaters = ["Aqua 220", "Aqua 330", "Aqua 600", "Le Minerale 330", "Sanford 220", "Sanford 330", "Sanford 600"]
  const boxes = [
    "Kotak putih snack",
    "Bungkus ala nasi padang",
    "Kotak bento",
    "Kotak snack ksm",
    "Kotak warna 19x19",
    "Kotak putih 18x18",
    "Mika bento",
  ]
  const arrives = [
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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setOpen(false)
    }
  }

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
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

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true)
      try {
        const [customers, packages, staffs] = await Promise.all([
          fetchCustomers(),
          fetchPackages(),
          fetchStaffs(),
        ])
        setCustomerOptions(customers)
        setPackageOptions(packages)
        setProductOptions(deriveProductsFromPackages(packages))
        const eligibleDrivers = staffs.filter((staff) => {
          const normalizedPosition = normalizeRoleValue(staff.position)
          const normalizedDepartment = normalizeRoleValue(staff.department)
          return normalizedPosition === "driver" && normalizedDepartment === "delivery"
        })
        setDriverOptions(eligibleDrivers.filter((staff) => staff.id !== null))
      } catch (error) {
        toast.error("Gagal memuat data customer, paket, atau driver")
      } finally {
        setOptionsLoading(false)
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const loadOrder = async () => {
      setIsLoadingOrder(true)
      try {
        const order = await fetchOrderForEdit(documentId)
        const parsedDate = new Date(order.deliveryDate)
        const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate

        setFormValues({
          orderNo: order.orderNo || DEFAULT_ORDER_NUMBER,
          customerId: order.customerId,
          customerType: order.customerType,
          executorTeam: order.executorTeam,
          supplier: order.supplier,
          product: order.product,
          packageId: order.packageId,
          qty: order.qty,
          sellingPrice: order.sellingPrice,
          brokerFee: order.brokerFee,
          priceForKsm: order.priceForKsm,
          minSellingPrice: order.minSellingPrice,
          amount: order.amount,
          deliveryCharge: order.deliveryCharge,
          totalAmount: order.totalAmount,
          deliveryNote: order.deliveryNote,
          arriveTime: order.arriveTime,
          leaveTime: order.leaveTime,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          recipientAddress: order.recipientAddress,
          rice: order.rice,
          mainDish: order.mainDish,
          additionalDish: order.additionalDish,
          vegetable: order.vegetable,
          sauce: order.sauce,
          chip: order.chip,
          fruit: order.fruit,
          mineralWater: order.mineralWater,
          box: order.box,
          pudding: order.pudding,
          snack: order.snack,
          staffDriverId: order.staffDriverId,
        })

        setDate(safeDate)
        setMonth(safeDate)
        setCoordinates({
          lat: order.coordinates.lat || DEFAULT_COORDINATE.lat,
          lng: order.coordinates.lng || DEFAULT_COORDINATE.lng,
        })
        setMetaIds({
          orderId: order.orderId,
          orderDetailId: order.orderDetailId,
          orderMenuId: order.orderMenuId,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data pesanan"
        toast.error(message)
      } finally {
        setIsLoadingOrder(false)
      }
    }

    loadOrder()
  }, [documentId])

  useEffect(() => {
    if (!formValues.arriveTime) {
      setFormValues((prev) => (prev.leaveTime === "" ? prev : { ...prev, leaveTime: "" }))
      return
    }

    const nextLeaveTime = calculateLeaveTime(formValues.arriveTime)
    setFormValues((prev) => (prev.leaveTime === nextLeaveTime ? prev : { ...prev, leaveTime: nextLeaveTime }))
  }, [formValues.arriveTime])

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

      const setValue = (key: keyof FormValues, value: string) => {
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

    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const requiredMap: Array<[keyof FormValues, string]> = [
      ["orderNo", "Nomor Order"],
      ["customerId", "Customer"],
      ["customerType", "Golongan Customer"],
      ["executorTeam", "Tim Eksekusi"],
      ["supplier", "Supplier"],
      ["product", "Produk"],
      ["packageId", "Paket"],
      ["qty", "Qty"],
      ["sellingPrice", "Harga Jual"],
      ["brokerFee", "Bayaran Jasa Broker"],
      ["priceForKsm", "Harga untuk KSM"],
      ["minSellingPrice", "Harga Jual Minimal"],
      ["amount", "Jumlah"],
      ["deliveryCharge", "Delivery Charge"],
      ["totalAmount", "Jumlah Total"],
      ["deliveryNote", "Keterangan"],
      ["arriveTime", "Jam Sampai"],
      ["leaveTime", "Jam Berangkat"],
      ["recipientName", "Nama Penerima"],
      ["recipientPhone", "No. HP Penerima"],
      ["recipientAddress", "Alamat Pengiriman"],
      ["rice", "Nasi"],
      ["mainDish", "Lauk Utama"],
      ["additionalDish", "Tambahan"],
      ["vegetable", "Sayur"],
      ["sauce", "Sambal"],
      ["chip", "Kerupuk"],
      ["fruit", "Buah"],
      ["mineralWater", "Air Mineral"],
      ["box", "Kotak"],
      ["pudding", "Puding"],
      ["snack", "Snack"],
    ]

    const missingFields = requiredMap
      .filter(([key]) => !String(formValues[key] ?? "").trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi field: ${missingFields.join(", ")}`)
      return
    }

    const customerIdNumber = Number(formValues.customerId)
    const packageIdNumber = Number(formValues.packageId)
    const staffDriverIdValue = formValues.staffDriverId.trim()
    const staffDriverIdNumber = staffDriverIdValue ? Number(staffDriverIdValue) : null

    if (Number.isNaN(customerIdNumber) || Number.isNaN(packageIdNumber)) {
      toast.error("Customer atau paket tidak valid")
      return
    }

    if (staffDriverIdValue && Number.isNaN(staffDriverIdNumber)) {
      toast.error("Driver tidak valid")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        orderId: metaIds.orderId,
        orderDetailId: metaIds.orderDetailId,
        orderMenuId: metaIds.orderMenuId,
        orderData: {
          order_no: formValues.orderNo || DEFAULT_ORDER_NUMBER,
          created_date: new Date().toISOString(),
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
          staff_driver_id: staffDriverIdNumber,
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
        },
        orderMenuData: {
          rice: formValues.rice,
          main_dish: formValues.mainDish,
          additional_dish: formValues.additionalDish,
          vegetable: formValues.vegetable,
          sauce: formValues.sauce,
          chip: formValues.chip,
          fruit: formValues.fruit,
          mineral_water: formValues.mineralWater,
          box: formValues.box,
          pudding: formValues.pudding,
          snack: formValues.snack,
        },
      }

      const result = await updateOrder(documentId, payload)

      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui pesanan")
      }

      toast.success("Pesanan berhasil diperbarui")
      router.push("/admin/order")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui pesanan"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
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
              <BreadcrumbPage>Edit Pesanan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg">
          <div className="flex flex-col py-4 md:py-6">
            <h1 className="font-bold text-lg md:text-xl text-gray-600">EDIT PESANAN</h1>
            <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
          </div>
          <div className="w-full mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row mb-6 md:mb-8 gap-4 md:gap-8">
              <div className="grid w-full max-w-full items-center gap-1.5">
                <Label htmlFor="order_no">Nomor Order *</Label>
                <Input
                type="text"
                name="order_no"
                id="order_no"
                placeholder="Nomor order"
                required
                value={formValues.orderNo}
                readOnly
              />
            </div>
              <div className="grid w-full max-w-full items-center gap-1.5">
                <Label htmlFor="customer_id">Customer</Label>
                <Select
                  value={formValues.customerId}
                  onValueChange={(value) => updateField("customerId", value)}
                  disabled={optionsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={optionsLoading ? "Memuat..." : "Pilih Customer"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Customer</SelectLabel>
                      {customerOptions.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {`${customer.phone_no || "-"} - ${customer.name || "Tanpa nama"}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="created_by">Bulan</Label>
              <Input type="text" name="created_by" id="created_by" value={currentMonthLabel} readOnly />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="customer_type">Golongan Customer </Label>
              <ToggleGroup
                type="single"
                value={formValues.customerType}
                onValueChange={(value) => updateField("customerType", value ?? "")}
                variant="outline"
                spacing={2}
                size="sm"
              >
                <ToggleGroupItem value="pemerintah" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Pemerintah
                </ToggleGroupItem>
                <ToggleGroupItem value="swasta" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Swasta
                </ToggleGroupItem>
                <ToggleGroupItem value="personal" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Personal
                </ToggleGroupItem>
                <ToggleGroupItem value="bumn" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  BUMN
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="executor_name">Tim Eksekusi </Label>
              <ToggleGroup
                type="single"
                value={formValues.executorTeam}
                onValueChange={(value) => updateField("executorTeam", value ?? "")}
                variant="outline"
                spacing={2}
                size="sm"
              >
                <ToggleGroupItem value="tim_kotak" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Tim Kotak
                </ToggleGroupItem>
                <ToggleGroupItem value="tim_prasmanan" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Tim Prasmanan
                </ToggleGroupItem>
                <ToggleGroupItem value="tim_snack" className="data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800 data-[state=on]:border-gray-300">
                  Tim Snack
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="nama">Supplier</Label>
              <Select value={formValues.supplier} onValueChange={(value) => updateField("supplier", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Supplier</SelectLabel>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="product">Produk</Label>
              <Select value={formValues.product} onValueChange={(value) => updateField("product", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Product" />
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
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="product">Paket</Label>
              <Select value={formValues.packageId} onValueChange={(value) => updateField("packageId", value)} disabled={optionsLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={optionsLoading ? "Memuat..." : "Pilih Paket"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Paket</SelectLabel>
                    {packageOptions.map((packageses) => (
                      <SelectItem key={packageses.id} value={packageses.id.toString()}>
                        {packageses.package_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="qty">Qty *</Label>
              <Input
                type="number"
                name="qty"
                id="qty"
                placeholder="0"
                required
                value={formValues.qty}
                onChange={(e) => updateField("qty", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="selling_price">Harga Jual (dlm ribuan)*</Label>
              <Input
                type="number"
                name="selling_price"
                id="selling_price"
                placeholder="0"
                required
                value={formValues.sellingPrice}
                onChange={(e) => updateField("sellingPrice", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="broker_fee">Bayaran Jasa Broker</Label>
              <Input
                type="number"
                name="broker_fee"
                id="broker_fee"
                placeholder="0"
                value={formValues.brokerFee}
                onChange={(e) => updateField("brokerFee", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="price_for_ksm">Harga untuk KSM</Label>
              <Input
                type="number"
                name="price_for_ksm"
                id="price_for_ksm"
                placeholder="0"
                value={formValues.priceForKsm}
                onChange={(e) => updateField("priceForKsm", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="min_selling_price">Harga jual minimal</Label>
              <Input
                type="number"
                name="min_selling_price"
                id="min_selling_price"
                placeholder="0"
                value={formValues.minSellingPrice}
                onChange={(e) => updateField("minSellingPrice", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                type="number"
                name="amount"
                id="amount"
                placeholder="0"
                required
                value={formValues.amount}
                onChange={(e) => updateField("amount", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="delivery_charge">Delivery Charge</Label>
              <Input
                type="number"
                name="delivery_charge"
                id="delivery_charge"
                placeholder="0"
                value={formValues.deliveryCharge}
                onChange={(e) => updateField("deliveryCharge", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="total_amount">Jumlah Total</Label>
              <Input
                type="number"
                name="total_amount"
                id="total_amount"
                placeholder="0"
                required
                value={formValues.totalAmount}
                onChange={(e) => updateField("totalAmount", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="delivery_note">Keterangan</Label>
              <Textarea
                name="delivery_note"
                id="delivery_note"
                placeholder="Masukkan keterangan"
                required
                value={formValues.deliveryNote}
                onChange={(e) => updateField("deliveryNote", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="rice"> Nasi</Label>
              <Select value={formValues.rice} onValueChange={(value) => updateField("rice", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih nasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nasi</SelectLabel>
                    {rices.map((rice) => (
                      <SelectItem key={rice} value={rice}>
                        {rice}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: Nasi putih, nasi padang</Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="main_dish">Lauk Utama</Label>
              <Select value={formValues.mainDish} onValueChange={(value) => updateField("mainDish", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lauk utama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lauk Utama</SelectLabel>
                    {mainDishes.map((maindish) => (
                      <SelectItem key={maindish} value={maindish}>
                        {maindish}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">
                Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu
              </Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="additional_dish">Tambahan</Label>
              <Select value={formValues.additionalDish} onValueChange={(value) => updateField("additionalDish", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lauk tambahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lauk Tambahan</SelectLabel>
                    {additionalDishes.map((additionaldish) => (
                      <SelectItem key={additionaldish} value={additionaldish}>
                        {additionaldish}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: Bakwan jagung, Bakwan kedelai</Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="vegetable">Sayur</Label>
              <Select value={formValues.vegetable} onValueChange={(value) => updateField("vegetable", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sayur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sayur</SelectLabel>
                    {vegetables.map((vegetable) => (
                      <SelectItem key={vegetable} value={vegetable}>
                        {vegetable}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: Tumis, Bayam</Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="sauce">Sambal</Label>
              <Select value={formValues.sauce} onValueChange={(value) => updateField("sauce", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sambal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sambal</SelectLabel>
                    {sauces.map((sauce) => (
                      <SelectItem key={sauce} value={sauce}>
                        {sauce}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: Sambal Terasi, Sambal Ijo</Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="chip">Kerupuk</Label>
              <Select value={formValues.chip} onValueChange={(value) => updateField("chip", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kerupuk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kerupuk</SelectLabel>
                    {chips.map((chip) => (
                      <SelectItem key={chip} value={chip}>
                        {chip}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">
                Recommend: Kerupuk, Kerupuk udang kecil, kerupuk udang besar
              </Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="fruit">Buah</Label>
              <Select value={formValues.fruit} onValueChange={(value) => updateField("fruit", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih buah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Buah</SelectLabel>
                    {fruits.map((fruit) => (
                      <SelectItem key={fruit} value={fruit}>
                        {fruit}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-xs italic text-gray-500">Recommend: Apel, Jeruk</Label>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="mineral_water">Air Mineral</Label>
              <Select value={formValues.mineralWater} onValueChange={(value) => updateField("mineralWater", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih air mineral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Air Mineral</SelectLabel>
                    {mineralWaters.map((mineralWater) => (
                      <SelectItem key={mineralWater} value={mineralWater}>
                        {mineralWater}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="box">Kotak</Label>
              <Select value={formValues.box} onValueChange={(value) => updateField("box", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kotak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kotak</SelectLabel>
                    {boxes.map((box) => (
                      <SelectItem key={box} value={box}>
                        {box}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="pudding">Puding</Label>
              <Input
                type="text"
                name="pudding"
                id="pudding"
                placeholder="Masukkan puding"
                value={formValues.pudding}
                onChange={(e) => updateField("pudding", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="snack">Snack</Label>
              <Input
                type="text"
                name="snack"
                id="snack"
                placeholder="Masukkan snack"
                value={formValues.snack}
                onChange={(e) => updateField("snack", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="delivery_date">Tanggal Kirim*</Label>
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
                      <span className="sr-only">Pilih tanggal</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} captionLayout="dropdown" month={month} onMonthChange={setMonth} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="arrive_time">Jam Sampai</Label>
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
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="leave">Berangkat</Label>
              <Input
                type="text"
                name="leave"
                id="leave"
                placeholder="Tentukan jam berangkat"
                required
                value={formValues.leaveTime}
                disabled
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="recipient_name">Nama Penerima</Label>
              <Input
                type="text"
                name="recipient_name"
                id="recipient_name"
                placeholder="Masukkan nama penerima"
                required
                value={formValues.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="recipient_phone_no">no. HP Penerima</Label>
              <Input
                type="text"
                name="recipient_phone_no"
                id="recipient_phone_no"
                placeholder="Masukkan no penerima"
                required
                value={formValues.recipientPhone}
                onChange={(e) => updateField("recipientPhone", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="recipient_address">Alamat Pengiriman</Label>
              <Input
                type="text"
                name="recipient_address"
                id="recipient_address"
                placeholder="Masukkan alamat penerima"
                required
                value={formValues.recipientAddress}
                onChange={(e) => updateField("recipientAddress", e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <MapCoordinatePicker value={coordinates} onChange={setCoordinates} />
            </div>
            <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
              <Label htmlFor="staff_driver_id">Driver</Label>
              <Select
                value={formValues.staffDriverId}
                onValueChange={(value) => updateField("staffDriverId", value)}
                disabled={optionsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={optionsLoading ? "Memuat..." : "Pilih driver"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Driver</SelectLabel>
                    {driverOptions.length === 0 ? (
                      <SelectItem value="-" disabled>
                        Belum ada driver
                      </SelectItem>
                    ) : (
                      driverOptions.map((driver) => (
                        <SelectItem key={driver.id ?? driver.documentId ?? driver.name} value={String(driver.id)}>
                          {driver.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full md:w-auto text-white cursor-pointer" onClick={handleSubmit} disabled={isSubmitting || isLoadingOrder}>
              {isSubmitting ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
