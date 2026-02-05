"use client"
import React, { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchOrders, type Order } from "@/features/admin/get-order"
import { fetchStaffs, type Staff } from "@/features/admin/get-staff"
import { getStrapiURL } from "@/lib/utils"

type Invoice = {
  id: number | null
  paymentStatus: string
  totalAmount: number
  invoiceDate: string
}

const CACHE_TTL_MS = 60_000

type CacheEntry<T> = {
  data: T | null
  promise: Promise<T> | null
  timestamp: number
}

const ordersCache: CacheEntry<Order[]> = { data: null, promise: null, timestamp: 0 }
const staffsCache: CacheEntry<Staff[]> = { data: null, promise: null, timestamp: 0 }
const invoicesCache: CacheEntry<Invoice[]> = { data: null, promise: null, timestamp: 0 }

const isCacheFresh = (timestamp: number) => Date.now() - timestamp < CACHE_TTL_MS

const getCachedValue = async <T,>(
  cache: CacheEntry<T>,
  loader: () => Promise<T>
): Promise<T> => {
  if (cache.data && isCacheFresh(cache.timestamp)) {
    return cache.data
  }
  if (cache.promise) {
    return cache.promise
  }
  cache.promise = loader()
    .then((data) => {
      cache.data = data
      cache.timestamp = Date.now()
      return data
    })
    .finally(() => {
      cache.promise = null
    })
  return cache.promise
}

const normalizeInvoiceItems = (result: any): Invoice[] => {
  const items = Array.isArray(result?.data)
    ? result.data
    : result?.data
      ? [result.data]
      : Array.isArray(result)
        ? result
        : []

  return items.map((item: any) => {
    const attributes = item?.attributes ?? item ?? {}
    const rawAmount =
      attributes?.total_amount ??
      attributes?.amount ??
      attributes?.total ??
      attributes?.total_price ??
      attributes?.price_total
    const amountNumeric =
      typeof rawAmount === "number"
        ? rawAmount
        : Number(String(rawAmount ?? "").replace(/[^0-9]/g, "")) || 0

    return {
      id: typeof item?.id === "number" ? item.id : null,
      paymentStatus: String(
        attributes?.payment_status ??
          attributes?.paymentStatus ??
          attributes?.status ??
          ""
      ),
      totalAmount: amountNumeric,
      invoiceDate: String(
        attributes?.invoice_date ??
          attributes?.createdAt ??
          attributes?.created_at ??
          item?.createdAt ??
          ""
      ),
    }
  })
}

const fetchInvoices = async (): Promise<Invoice[]> => {
  try {
    const url = new URL("/api/invoices", getStrapiURL())
    url.searchParams.set("pagination[pageSize]", "1000")
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return []
    }

    const result = await response.json().catch(() => ({}))
    return normalizeInvoiceItems(result)
  } catch {
    return []
  }
}

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const chartConfig = {
  nasiKotak: { label: "Nasi Kotak", color: "#2563eb" },
  prasmanan: { label: "Prasmanan", color: "#16a34a" },
  snack: { label: "Snack", color: "#f97316" },
  bento: { label: "Bento", color: "#dc2626" },
  custom: { label: "Custom", color: "#4b5563" },
  aqiqah: { label: "Aqiqah", color: "#9333ea" },
  tumpeng: { label: "Tumpeng", color: "#ec4899" },
  weddingCatering: { label: "Wedding Catering", color: "#f59e0b" },
  kateringKorporat: { label: "Katering Korporat", color: "#4f46e5" },
} satisfies Record<string, { label: string; color: string }>

const chartTypeConfig = {
  pemerintah: { label: "Pemerintah", color: "#2563eb" },
  swasta: { label: "Swasta", color: "#16a34a" },
  bumn: { label: "BUMN", color: "#f97316" },
  personal: { label: "Personal", color: "#dc2626" },
} satisfies Record<string, { label: string; color: string }>

const chartInvoiceConfig = {
  lunas: { label: "Tagihan Lunas", color: "#16a34a" },
  belumLunas: { label: "Tagihan Belum Lunas", color: "#dc2626" },
} satisfies Record<string, { label: string; color: string }>

type ChartKey = keyof typeof chartConfig
type ChartTypeKey = keyof typeof chartTypeConfig
type ChartInvoiceKey = keyof typeof chartInvoiceConfig

const chartLegendItems: { key: ChartKey; label: string }[] = [
  { key: "nasiKotak", label: "Nasi Kotak" },
  { key: "prasmanan", label: "Prasmanan" },
  { key: "snack", label: "Snack" },
  { key: "bento", label: "Bento" },
  { key: "custom", label: "Custom" },
  { key: "aqiqah", label: "Aqiqah" },
  { key: "tumpeng", label: "Tumpeng" },
  { key: "weddingCatering", label: "Wedding Catering" },
  { key: "kateringKorporat", label: "Katering Korporat" },
]

const chartTypeItems: { key: ChartTypeKey; label: string }[] = [
  { key: "pemerintah", label: "Pemerintah" },
  { key: "swasta", label: "Swasta" },
  { key: "bumn", label: "BUMN" },
  { key: "personal", label: "Personal" },
]

const chartInvoiceItems: { key: ChartInvoiceKey; label: string }[] = [
  { key: "lunas", label: "Tagihan Lunas" },
  { key: "belumLunas", label: "Tagihan Belum Lunas" },
]

const monthLabelsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

const moneyTicks = [0, 5_000_000, 10_000_000, 15_000_000, 20_000_000]

function page() {
    const [selectedMonth, setSelectedMonth] = useState('all')
    const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()))
  const [orders, setOrders] = useState<Order[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const [ordersData, staffsData, invoicesData] = await Promise.all([
        getCachedValue(ordersCache, () => fetchOrders()),
        getCachedValue(staffsCache, () => fetchStaffs()),
        getCachedValue(invoicesCache, () => fetchInvoices()),
      ])

      if (!isMounted) return
      setOrders(ordersData)
      setStaffs(staffsData)
      setInvoices(invoicesData)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedMonthIndex = useMemo(() => {
    if (selectedMonth === "all") return null
    const parsed = Number(selectedMonth)
    return Number.isFinite(parsed) ? parsed : null
  }, [selectedMonth])

  const selectedYearNumber = useMemo(() => {
    const parsed = Number(selectedYear)
    return Number.isFinite(parsed) ? parsed : new Date().getFullYear()
  }, [selectedYear])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
  }

  const parsedOrdersByMonth = useMemo(() => {
    return orders.filter((order) => {
      const rawDate = order.createdAt && order.createdAt !== "-" ? order.createdAt : order.order_date
      const date = new Date(rawDate)
      if (Number.isNaN(date.getTime())) return false
      const yearMatches = date.getFullYear() === selectedYearNumber
      const monthMatches = selectedMonthIndex === null || date.getMonth() === selectedMonthIndex
      return yearMatches && monthMatches
    })
  }, [orders, selectedMonthIndex, selectedYearNumber])

  const parsedInvoicesByMonth = useMemo(() => {
    return invoices.filter((invoice) => {
      const date = new Date(invoice.invoiceDate)
      if (Number.isNaN(date.getTime())) return false
      const yearMatches = date.getFullYear() === selectedYearNumber
      const monthMatches = selectedMonthIndex === null || date.getMonth() === selectedMonthIndex
      return yearMatches && monthMatches
    })
  }, [invoices, selectedMonthIndex, selectedYearNumber])

  const normalizeChartLabel = (value: unknown) => {
    if (value === null || value === undefined) return null
    const text = String(value).trim()
    if (!text || text === "-") return null
    return text.toLowerCase()
  }

  const getOrderDate = (order: Order) => {
    const rawDate = order.createdAt && order.createdAt !== "-" ? order.createdAt : order.order_date
    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return null
    return date
  }

  const parseMoneyValue = (...values: Array<unknown>) => {
    for (const value of values) {
      if (value === null || value === undefined) continue
      const text = String(value)
      const digits = text.replace(/[^0-9]/g, "")
      if (digits.length === 0) continue
      const numeric = Number(digits)
      if (Number.isFinite(numeric)) {
        return numeric
      }
    }
    return 0
  }

  const activeStaffCount = useMemo(() => {
    return staffs.filter((staff) => {
      const status = String(staff.staff_status ?? "").toLowerCase()
      return status === "active" || status === "aktif"
    }).length
  }, [staffs])

  const ordersThisMonth = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return orders.filter((order) => {
      const date = getOrderDate(order)
      if (!date) return false
      return date.getFullYear() === year && date.getMonth() === month
    })
  }, [orders])

  const topServiceThisMonth = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    ordersThisMonth.forEach((order) => {
      const label =
        normalizeChartLabel(order.menu_product) ||
        normalizeChartLabel(order.category) ||
        normalizeChartLabel(order.product_category) ||
        normalizeChartLabel(order.package) ||
        normalizeChartLabel(order.product_package)
      if (!label) return
      const existing = counts.get(label)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(label, { label, count: 1 })
      }
    })
    let top: { label: string; count: number } | null = null
    for (const value of counts.values()) {
      if (!top || value.count > top.count) {
        top = value
      }
    }
    if (!top) return "-"
    return top.label 
      .split(" ")
      .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(" ")
  }, [ordersThisMonth])

  const topMenuThisMonth = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    ordersThisMonth.forEach((order) => {
      const label =
        normalizeChartLabel(order.package) ||
        normalizeChartLabel(order.product_package)
      if (!label) return
      const existing = counts.get(label)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(label, { label, count: 1 })
      }
    })
    let top: { label: string; count: number } | null = null
    for (const value of counts.values()) {
      if (!top || value.count > top.count) {
        top = value
      }
    }
    if (!top) return "-"
    return top.label
      .split(" ")
      .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(" ")
  }, [ordersThisMonth])

  const orderChartData = useMemo(() => {
    const packageKeyByLabel = new Map(
      Object.keys(chartConfig).map((key) => {
        const config = chartConfig[key as ChartKey]
        return [config.label.toLowerCase(), key]
      })
    )

    if (selectedMonthIndex !== null) {
      const counts = Object.keys(chartConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartKey, number>
      )

      parsedOrdersByMonth.forEach((order) => {
        const packageName =
          normalizeChartLabel(order.category) ||
          normalizeChartLabel(order.product_category) ||
          normalizeChartLabel(order.package) ||
          normalizeChartLabel(order.product_package)
        const mappedKey = packageName
          ? (packageKeyByLabel.get(packageName) as ChartKey | undefined)
          : undefined
        const targetKey = mappedKey ?? ("custom" in chartConfig ? ("custom" as ChartKey) : undefined)
        if (!targetKey) return
        counts[targetKey] += 1
      })

      return [{ month: monthLabelsShort[selectedMonthIndex] ?? "-", ...counts }]
    }

    const byMonth = monthLabelsShort.map((label) => {
      const counts = Object.keys(chartConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartKey, number>
      )
      return { month: label, ...counts }
    })

    orders.forEach((order) => {
      const rawDate = order.createdAt && order.createdAt !== "-" ? order.createdAt : order.order_date
      const date = new Date(rawDate)
      if (Number.isNaN(date.getTime())) return
      if (date.getFullYear() !== selectedYearNumber) return
      const monthIndex = date.getMonth()
      const packageName =
        normalizeChartLabel(order.category) ||
        normalizeChartLabel(order.product_category) ||
        normalizeChartLabel(order.package) ||
        normalizeChartLabel(order.product_package)
      const mappedKey = packageName
        ? (packageKeyByLabel.get(packageName) as ChartKey | undefined)
        : undefined
      const targetKey = mappedKey ?? ("custom" in chartConfig ? ("custom" as ChartKey) : undefined)
      if (!targetKey || !byMonth[monthIndex]) return
      byMonth[monthIndex][targetKey] += 1
    })

    return byMonth
  }, [orders, parsedOrdersByMonth, selectedMonthIndex, selectedYearNumber])

  const customerTypeChartData = useMemo(() => {
    if (selectedMonthIndex !== null) {
      const sums = Object.keys(chartTypeConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartTypeKey, number>
      )

      parsedOrdersByMonth.forEach((order) => {
        const amountNumeric = parseMoneyValue(order.price_total, order.amount, order.price_ksm)
        const key = String(order.customer_type ?? "").toLowerCase() as ChartTypeKey
        if (!Object.prototype.hasOwnProperty.call(chartTypeConfig, key)) return
        sums[key] += amountNumeric
      })

      return [{ month: monthLabelsShort[selectedMonthIndex] ?? "-", ...sums }]
    }

    const byMonth = monthLabelsShort.map((label) => {
      const sums = Object.keys(chartTypeConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartTypeKey, number>
      )
      return { month: label, ...sums }
    })

    orders.forEach((order) => {
      const rawDate = order.createdAt && order.createdAt !== "-" ? order.createdAt : order.order_date
      const date = new Date(rawDate)
      if (Number.isNaN(date.getTime())) return
      if (date.getFullYear() !== selectedYearNumber) return
      const monthIndex = date.getMonth()
      const amountNumeric = parseMoneyValue(order.price_total, order.amount, order.price_ksm)
      const key = String(order.customer_type ?? "").toLowerCase() as ChartTypeKey
      if (!Object.prototype.hasOwnProperty.call(chartTypeConfig, key)) return
      if (!byMonth[monthIndex]) return
      byMonth[monthIndex][key] += amountNumeric
    })

    return byMonth
  }, [orders, parsedOrdersByMonth, selectedMonthIndex, selectedYearNumber])

  const invoiceChartData = useMemo(() => {
    if (selectedMonthIndex !== null) {
      const sums = Object.keys(chartInvoiceConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartInvoiceKey, number>
      )

      parsedInvoicesByMonth.forEach((invoice) => {
        const status = invoice.paymentStatus.toLowerCase()
        const key: ChartInvoiceKey =
          status === "paid" ? "lunas" : status === "unpaid" || status === "overdue" ? "belumLunas" : "belumLunas"
        sums[key] += invoice.totalAmount
      })

      return [{ month: monthLabelsShort[selectedMonthIndex] ?? "-", ...sums }]
    }

    const byMonth = monthLabelsShort.map((label) => {
      const sums = Object.keys(chartInvoiceConfig).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Record<ChartInvoiceKey, number>
      )
      return { month: label, ...sums }
    })

    invoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate)
      if (Number.isNaN(date.getTime())) return
      if (date.getFullYear() !== selectedYearNumber) return
      const monthIndex = date.getMonth()
      const status = invoice.paymentStatus.toLowerCase()
      const key: ChartInvoiceKey =
        status === "paid" ? "lunas" : status === "unpaid" || status === "overdue" ? "belumLunas" : "belumLunas"
      if (!byMonth[monthIndex]) return
      byMonth[monthIndex][key] += invoice.totalAmount
    })

    return byMonth
  }, [invoices, parsedInvoicesByMonth, selectedMonthIndex, selectedYearNumber])

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    orders.forEach((order) => {
      const rawDate = order.createdAt && order.createdAt !== "-" ? order.createdAt : order.order_date
      const date = new Date(rawDate)
      if (!Number.isNaN(date.getTime())) {
        yearSet.add(date.getFullYear())
      }
    })
    invoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate)
      if (!Number.isNaN(date.getTime())) {
        yearSet.add(date.getFullYear())
      }
    })
    if (yearSet.size === 0) {
      yearSet.add(new Date().getFullYear())
    }
    return Array.from(yearSet).sort((a, b) => b - a).map(String)
  }, [orders, invoices])
  
  return (
    <div className="bg-white w-full mx-auto relative">
        <div className="border-b border-black w-full">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Grafik</h1>
            </div>
          </div>
        </div>
        <div className='px-6 py-4 flex flex-col'>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Bulan</SelectLabel>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tahun</SelectLabel>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='bg-white border border-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Pengguna Aktif</h1>
              <h1 className='text-lg font-semibold'>{activeStaffCount}</h1>
            </div>
            <div className='bg-white border border-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Total Pesanan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>{ordersThisMonth.length}</h1>
            </div>
            <div className='bg-white border border-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Top Layanan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>{topServiceThisMonth}</h1>
            </div>
            <div className='bg-white border border-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Top Menu Masakan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>{topMenuThisMonth}</h1>
            </div>
          </div>

          <div className='mt-4'>
            <div className='bg-white border border-gray-300 p-4 gap-4 rounded-xl flex flex-col'>
              <h1 className='text-lg'>Pesanan Bulan Ini</h1>
              <div className='grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9'>
                {chartLegendItems.map((item) => (
                  <div key={item.key} className='flex gap-4 items-center justify-center'>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartConfig[item.key].color }}
                    />
                    <h1 className='text-sm text-gray-600'>{item.label}</h1>
                  </div>
                ))}
              </div>
              <ChartContainer config={chartConfig} className="mt-6 h-[320px] w-full">
                <BarChart data={orderChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  {(Object.keys(chartConfig) as ChartKey[]).map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="total"
                      fill={`var(--color-${key})`}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className='mt-4'>
            <div className='bg-white border border-gray-300 p-4 gap-4 rounded-xl flex flex-col'>
              <h1 className='text-lg'>Pendapatan per Tipe Pelanggan</h1>
              <div className='grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9'>
                {chartTypeItems.map((item) => (
                  <div key={item.key} className='flex gap-4 items-center justify-center'>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartTypeConfig[item.key].color }}
                    />
                    <h1 className='text-sm text-gray-600'>{item.label}</h1>
                  </div>
                ))}
              </div>
              <ChartContainer config={chartTypeConfig} className="mt-6 h-[320px] w-full">
                <BarChart data={customerTypeChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={moneyTicks}
                    domain={[0, 20_000_000]}
                    tickFormatter={(value) => `${Math.round(value / 1_000_000)} JT`}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  {(Object.keys(chartTypeConfig) as ChartTypeKey[]).map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="total"
                      fill={`var(--color-${key})`}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className='mt-4'>
            <div className='bg-white border border-gray-300 p-4 gap-4 rounded-xl flex flex-col'>
              <h1 className='text-lg'>Tagihan Per Bulan</h1>
              <div className='grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9'>
                {chartInvoiceItems.map((item) => (
                  <div key={item.key} className='flex gap-4 items-center justify-center'>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartInvoiceConfig[item.key].color }}
                    />
                    <h1 className='text-sm text-gray-600'>{item.label}</h1>
                  </div>
                ))}
              </div>
              <ChartContainer config={chartInvoiceConfig} className="mt-6 h-[320px] w-full">
                <BarChart data={invoiceChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={moneyTicks}
                    domain={[0, 20_000_000]}
                    tickFormatter={(value) => `${Math.round(value / 1_000_000)} JT`}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  {(Object.keys(chartInvoiceConfig) as ChartInvoiceKey[]).map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="total"
                      fill={`var(--color-${key})`}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
    </div>
  )
}

export default page
