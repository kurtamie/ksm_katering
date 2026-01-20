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
import { IoIosRefresh, IoMdCheckboxOutline } from "react-icons/io"
import { CalendarIcon, X, Printer, Trash2 } from 'lucide-react'
import { FaPlus } from "react-icons/fa"
import OrderTable from '@/components/admin/order-table'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type DateRange } from "react-day-picker"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { fetchOrders, type Order } from '@/features/admin/get-order'
import { getCurrentUser } from '@/features/admin/create-order'
import { deleteOrder } from '@/features/admin/delete-order'
import { generateOrderPdf } from '@/features/admin/generate-pdf-order'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const now = new Date()
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  })
  const [value, setValue] = React.useState(formatDateRange(dateRange))
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [orders, setOrders] = React.useState<Order[]>([])
  const [userPosition, setUserPosition] = React.useState<string | null>(null)
  const [userDepartment, setUserDepartment] = React.useState<string | null>(null)
  const [currentStaffId, setCurrentStaffId] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const documentIdParam = searchParams.get("documentId") ?? searchParams.get("orderId") ?? searchParams.get("id")

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (isMounted) {
        setCurrentStaffId(user?.staff?.id ?? null)
        setUserPosition(user?.staff?.position ?? null)
        setUserDepartment(user?.staff?.department ?? null)
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    setValue(formatDateRange(dateRange))
  }, [dateRange])

  React.useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      const data = await fetchOrders()
      if (isMounted) {
        setOrders(data)
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!documentIdParam || orders.length === 0) return

    const matched = orders.find((order) =>
      order.documentId === documentIdParam || String(order.id) === documentIdParam
    )

    if (matched) {
      setSelectedOrder(matched)
      setDrawerOpen(true)
    }
  }, [documentIdParam, orders])

  const visibleOrders = React.useMemo(() => {
    const isSalesMarketing = userPosition === "sales" && userDepartment === "marketing"
    if (!isSalesMarketing) {
      return orders
    }

    if (!currentStaffId) {
      return []
    }

    return orders.filter((order) => order.staff_id === currentStaffId)
  }, [orders, userPosition, currentStaffId])

  const handleRefreshOrders = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchOrders()
      setOrders(data)
      toast.success("Data pesanan berhasil diperbarui")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui data pesanan"
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) {
      toast.error("Pilih pesanan yang akan dihapus")
      return
    }

    if (isDeleting) return

    const documentId = selectedOrder.documentId

    if (!documentId) {
      toast.error("Data pesanan tidak valid (documentId tidak ditemukan)")
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteOrder(documentId)

      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus pesanan")
        return
      }

      setOrders((prev) => prev.filter((order) => order.documentId !== documentId))
      setSelectedOrder(null)
      setDrawerOpen(false)
      toast.success("Pesanan berhasil dihapus")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditOrder = () => {
    if (!selectedOrder?.documentId) {
      toast.error("Data pesanan tidak valid (documentId tidak ditemukan)")
      return
    }

    router.push(`/admin/order/${selectedOrder.documentId}/edit`)
  }

  const handlePrintOrder = async () => {
    if (!selectedOrder?.documentId) {
      toast.error("Data pesanan tidak valid (documentId tidak ditemukan)")
      return
    }

    setIsGeneratingPdf(true)
    try {
      await generateOrderPdf(selectedOrder.documentId)
      toast.success("File PDF berhasil dibuat")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat PDF pesanan"
      toast.error(message)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="bg-white w-full mx-auto relative">
        <Toaster position="top-right" richColors />
        <div className="border-b border-black w-full">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Pesanan</h1>
              <Button 
                className="cursor-pointer flex items-center p-2 bg-background rounded-lg shadow-sm"
                onClick={handleRefreshOrders}
                disabled={isRefreshing}
              >
                <IoIosRefresh className={`text-black hover:text-white ${isRefreshing ? 'animate-spin' : ''}`}/>
              </Button>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">
              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                <Link href={"/admin/order/add"}>
                  <Button className="bg-gray-400 cursor-pointer">
                    <FaPlus />
                    Tambah Pesanan
                  </Button>
                </Link>
                <Button className="bg-gray-400 cursor-pointer">Ekspor Laporan Pesanan</Button>
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
          <OrderTable orders={visibleOrders} onOrderClick={handleOrderClick} loading={isRefreshing} />
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedOrder?.order_no}
                </DrawerTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="cursor-pointer h-9 whitespace-nowrap"
                        disabled={!selectedOrder || isDeleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus pesanan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Pesanan {selectedOrder?.order_no ?? "-"} akan dihapus. Tindakan ini tidak bisa dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOrder} disabled={isDeleting}>
                          {isDeleting ? "Menghapus..." : "Ya, hapus"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer h-9 whitespace-nowrap"
                    onClick={handleEditOrder}
                    disabled={!selectedOrder}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer h-9 whitespace-nowrap"
                    onClick={handlePrintOrder}
                    disabled={!selectedOrder || isGeneratingPdf}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {isGeneratingPdf ? "Mencetak..." : "Cetak Pesanan"}
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
                    <DetailRow label="Lauk Tambahan" value={selectedOrder.additional_dish} />
                    <DetailRow label="Sayur" value={selectedOrder.vegetable} />
                    <DetailRow label="Sambal" value={selectedOrder.sauce} />
                    <DetailRow label="Kerupuk" value={selectedOrder.chip} />
                    <DetailRow label="Buah" value={selectedOrder.fruit} />
                    <DetailRow label="Air Mineral" value={selectedOrder.mineral_water} />
                    <DetailRow label="Kotak" value={selectedOrder.box} />
                    <DetailRow label="Puding" value={selectedOrder.pudding} />
                    <DetailRow label="Snack" value={selectedOrder.snack} />
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
