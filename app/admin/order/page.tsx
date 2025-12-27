"use client"

import { Button } from '@/components/ui/button'
import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { IoMdCheckboxOutline } from "react-icons/io"
import { CalendarIcon, X, Printer, Trash2 } from 'lucide-react'
import { FaPlus } from "react-icons/fa"
import OrderTable, { type Order } from '@/components/admin/order-table'
import Link from 'next/link'
import { type DateRange } from "react-day-picker"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

function formatDateRange(dateRange: DateRange | undefined) {
  if (!dateRange?.from) {
    return ""
  }
  
  const formatSingleDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }
  
  if (!dateRange.to) {
    return formatSingleDate(dateRange.from)
  }
  
  return `${formatSingleDate(dateRange.from)} - ${formatSingleDate(dateRange.to)}`
}

export default function Page() {
  const now = new Date()
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  })
  const [value, setValue] = React.useState(formatDateRange(dateRange))
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)

  React.useEffect(() => {
    setValue(formatDateRange(dateRange))
  }, [dateRange])

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  return (
    <div className="bg-white w-full mx-auto relative">
        <div className="border-b border-black w-full">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold">Pesanan</h1>
            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">
              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                <Link href={"/admin/order/add"}>
                  <Button className="bg-gray-400">
                    <FaPlus />
                    Tambah Pesanan
                  </Button>
                </Link>
                <Button className="bg-gray-400">Ekspor Laporan Pesanan</Button>
              </div>
              <div className="hidden h-10 w-px bg-gray-400 md:block" />
              <div className="flex flex-1 items-center gap-2 md:flex-none md:min-w-[340px]">
                <div className="relative flex w-full items-center gap-2">
                  <Input
                    id="date"
                    value={value}
                    placeholder="Pilih Range Tanggal"
                    className="bg-background pr-10 text-sm sm:text-base"
                    readOnly
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setOpen(true)
                      }
                    }}
                  />
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                      id="date-picker"
                      variant="ghost"
                      className="absolute right-2 top-1/2 size-8 -translate-y-1/2"
                      >
                      <CalendarIcon className="size-4" />
                      <span className="sr-only">Pilih Tanggal</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range)
                            // Close popover only when both dates are selected
                            if (range?.from && range?.to) {
                              setOpen(false)
                            }
                          }}
                          numberOfMonths={2}
                        />
                    </PopoverContent>
                  </Popover>
                </div>
                <IoMdCheckboxOutline className="text-2xl sm:text-3xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <OrderTable onOrderClick={handleOrderClick} />
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedOrder?.order_no}
                </DrawerTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 whitespace-nowrap">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 whitespace-nowrap">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 whitespace-nowrap">
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Pesanan
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Tutup detail pesanan">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailRow label="Nomor Order" value={selectedOrder.order_no} />
                    <DetailRow label="Nomor Telepon" value={selectedOrder.phone} />
                    <DetailRow label="Kategori Produk" value={selectedOrder.product_category} />
                    <DetailRow label="Paket" value={selectedOrder.product_package} />
                    <DetailRow label="Jumlah" value={selectedOrder.total_qty} />
                    <DetailRow label="Alamat" value={selectedOrder.address} />
                    <DetailRow label="Tanggal Order" value={selectedOrder.order_date} />
                    <DetailRow label="Status Pengiriman" value={selectedOrder.delivery_status} />
                    <DetailRow label="Jam Sampai" value={selectedOrder.delivery_time} />
                    <DetailRow label="Keterangan" value={selectedOrder.note} />
                    <DetailRow label="Nasi" value={selectedOrder.rice_type} />
                    <DetailRow label="Lauk Utama" value={selectedOrder.side_dish} />
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-normal">{value}</div>
    </div>
  )
}
