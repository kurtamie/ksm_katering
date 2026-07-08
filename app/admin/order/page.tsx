"use client"

import { Button } from '@/components/ui/button'
import React, { Suspense } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { IoIosRefresh, IoMdCheckboxOutline } from "react-icons/io"
import { Edit, CalendarIcon, X, Printer, Trash2 } from 'lucide-react'
import { FaPlus } from "react-icons/fa"
import OrderTable, {
  type OrderWithExtras,
  getLatestInvoice,
  renderPaymentStatusBadge,
} from '@/components/admin/order-table'
import { getOrderStatusLabel } from '@/const/admin/order'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { generateInvoiceOrderPdf } from '@/features/admin/generate-invoice-order'
import { generateDeliveryOrderPdf } from '@/features/admin/generate-delivery-order'
import { generateOrderExcelReport } from '@/features/admin/generate-order-excel-report'
import { getOrderMenuFieldVisibility, orderMenuFieldLabels, type OrderMenuField } from '@/const/admin/order'
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
import {
  getOrderPermissions,
  isDriverStaff,
} from "@/const/permissions"
import { normalizeRoleValue } from "@/const/misc"

function formatDateRange(dateRange: DateRange | undefined) {
  if (!dateRange?.from) {
    return ""
  }
  
  const formatSingleDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
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

const getGoogleMapsUrl = (
  latitude?: string | null,
  longitude?: string | null
) => {
  if (!latitude || !longitude) {
    return null
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return `https://www.google.com/maps?q=${lat},${lng}`
}

function OrderPageInner() {
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
  const [currentStaffDocumentId, setCurrentStaffDocumentId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false)
  const [isGeneratingDeliveryOrder, setIsGeneratingDeliveryOrder] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [selectionMode, setSelectionMode] = React.useState(false)
  const [selectedOrderKeys, setSelectedOrderKeys] = React.useState<Set<string>>(new Set())
  const documentIdParam = searchParams.get("documentId") ?? searchParams.get("orderId") ?? searchParams.get("id")

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (isMounted) {
        setCurrentStaffId(user?.staff?.id ?? null)
        setCurrentStaffDocumentId(user?.staff?.documentId ?? null)
        setUserPosition(normalizeRoleValue(user?.staff?.position) || null)
        setUserDepartment(normalizeRoleValue(user?.staff?.department) || null)
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

  const permissions = React.useMemo(
    () => getOrderPermissions(userPosition, userDepartment),
    [userPosition, userDepartment]
  )

  const visibleOrders = React.useMemo(() => {
    const isDriver = isDriverStaff(userPosition, userDepartment)
    if (!isDriver) {
      return orders
    }

    if (!currentStaffId) {
      if (currentStaffDocumentId) {
        return orders.filter((order) => order.staff_driver_document_id === currentStaffDocumentId)
      }
      return []
    }

    return orders.filter((order) => {
      if (currentStaffId && order.staff_driver_staff_id === currentStaffId) return true
      if (currentStaffDocumentId && order.staff_driver_document_id === currentStaffDocumentId) return true
      if (currentStaffId && order.staff_id === currentStaffId) return true
      if (currentStaffDocumentId && order.staff_document_id === currentStaffDocumentId) return true
      return false
    })
  }, [orders, userPosition, userDepartment, currentStaffId, currentStaffDocumentId])

  const dateFilteredVisibleOrders = React.useMemo(() => {
    if (!dateRange?.from) return visibleOrders

    const start = new Date(dateRange.from)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateRange.to ?? dateRange.from)
    end.setHours(23, 59, 59, 999)

    return visibleOrders.filter((order) => {
      const timestamp = Date.parse(order.createdAt)
      if (!Number.isFinite(timestamp)) return false
      return timestamp >= start.getTime() && timestamp <= end.getTime()
    })
  }, [visibleOrders, dateRange])

  const getOrderKey = React.useCallback((order: Order) => {
    return order.documentId ?? String(order.id ?? order.order_no)
  }, [])

  const selectedOrders = React.useMemo(
    () => dateFilteredVisibleOrders.filter((order) => selectedOrderKeys.has(getOrderKey(order))),
    [dateFilteredVisibleOrders, selectedOrderKeys, getOrderKey]
  )

  const hasSelectedOrders = selectedOrders.length > 0
  const reportTargetOrders = hasSelectedOrders ? selectedOrders : dateFilteredVisibleOrders
  const canShowSelectedActions =
    permissions.canExport ||
    (hasSelectedOrders &&
      (permissions.canInvoice || permissions.canDeliveryOrder))

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

  const toggleOrderSelection = React.useCallback((order: Order) => {
    const key = getOrderKey(order)
    setSelectedOrderKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [getOrderKey])

  const startSelectionMode = React.useCallback((order: Order) => {
    setSelectionMode(true)
    toggleOrderSelection(order)
  }, [toggleOrderSelection])

  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev
      if (!next) {
        setSelectedOrderKeys(new Set())
      }
      return next
    })
  }

  const handleAddOrder = () => {
    if (!permissions.canAdd) return
    router.push("/admin/order/add")
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

  const handlePrintInvoiceReport = async () => {
    if (isGeneratingInvoice) return

    if (reportTargetOrders.length === 0) {
      toast.error("Tidak ada data pesanan untuk dicetak")
      return
    }

    setIsGeneratingInvoice(true)
    try {
      await generateInvoiceOrderPdf(reportTargetOrders)
      toast.success("Tagihan PDF berhasil dibuat")
      if (hasSelectedOrders) {
        setSelectedOrderKeys(new Set())
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat tagihan PDF"
      toast.error(message)
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

  const handleExportOrderReport = () => {
    if (isGeneratingReport) return

    if (reportTargetOrders.length === 0) {
      toast.error("Tidak ada data pesanan untuk diekspor")
      return
    }

    setIsGeneratingReport(true)
    try {
      generateOrderExcelReport(reportTargetOrders)
      toast.success("Laporan pesanan Excel berhasil dibuat")
      if (hasSelectedOrders) {
        setSelectedOrderKeys(new Set())
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat laporan pesanan Excel"
      toast.error(message)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (isGeneratingInvoice) return

    if (selectedOrders.length === 0) {
      toast.error("Pilih data pesanan yang akan dibuat tagihan")
      return
    }

    setIsGeneratingInvoice(true)
    try {
      await generateInvoiceOrderPdf(selectedOrders)
      toast.success("Tagihan PDF berhasil dibuat")
      setSelectedOrderKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat tagihan PDF"
      toast.error(message)
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

  const handleGenerateDeliveryOrder = async () => {
    if (isGeneratingDeliveryOrder) return

    if (selectedOrders.length === 0) {
      toast.error("Pilih data pesanan untuk surat jalan")
      return
    }

    setIsGeneratingDeliveryOrder(true)
    try {
      await generateDeliveryOrderPdf(selectedOrders)
      toast.success("Surat jalan PDF berhasil dibuat")
      setSelectedOrderKeys(new Set())
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat surat jalan PDF"
      toast.error(message)
    } finally {
      setIsGeneratingDeliveryOrder(false)
    }
  }

  const selectedMenuFields = selectedOrder
    ? getOrderMenuFieldVisibility(
        selectedOrder.product_category,
        selectedOrder.product_package || selectedOrder.package
      )
    : null
  const canShowMenuField = (field: OrderMenuField) => Boolean(selectedMenuFields?.[field])
  const selectedMenuValues: Record<OrderMenuField, React.ReactNode> | null = selectedOrder
    ? {
        rice: selectedOrder.rice_type,
        mainDish: selectedOrder.side_dish,
        mainDish2: selectedOrder.side_dish2,
        mainDish3: selectedOrder.side_dish3,
        additionalDish: selectedOrder.additional_dish,
        vegetable: selectedOrder.vegetable,
        sauce: selectedOrder.sauce,
        chip: selectedOrder.chip,
        fruit: selectedOrder.fruit,
        mineralWater: selectedOrder.mineral_water,
        box: selectedOrder.box,
        pudding: selectedOrder.pudding,
        snack: selectedOrder.snack,
        snack2: selectedOrder.snack2,
        snack3: selectedOrder.snack3,
        snack4: selectedOrder.snack4,
      }
    : null

  return (
    <div className="bg-white w-full mx-auto relative">
        <Toaster position="top-right" richColors />
        <div className="border-b border-black w-full py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 md:flex-row md:items-center md:justify-between">
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
                            onSelect={(range, selectedDay) => {
                            const wasRangeComplete = Boolean(dateRange?.from && dateRange?.to)

                            if (wasRangeComplete) {
                              setDateRange({ from: selectedDay, to: undefined })
                              return
                            }

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
              </div>
              {permissions.canAdd && (
                <Link href={"/admin/order/add"}>
                  <Button variant="default">
                    <FaPlus />
                    Tambah Pesanan
                  </Button>
                </Link>
              )}
            </div>
          </div>
          {canShowSelectedActions && (
            <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 p-4'>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${selectionMode ? "bg-gray-200" : ""}`}
                onClick={handleToggleSelectionMode}
                aria-label="Pilih data pesanan"
              >
                <IoMdCheckboxOutline className="text-2xl sm:text-3xl" />
              </Button>
              <div className="flex flex-wrap items-center gap-2">
              {permissions.canExport && (
                <Button
                  variant="default"
                  onClick={handlePrintInvoiceReport}
                  disabled={isGeneratingInvoice || reportTargetOrders.length === 0}
                >
                  {isGeneratingInvoice ? "Mencetak..." : "Cetak Tagihan"}
                </Button>
              )}
              {permissions.canExport && (
                <Button
                  variant="default"
                  onClick={handleExportOrderReport}
                  disabled={isGeneratingReport || reportTargetOrders.length === 0}
                >
                  {isGeneratingReport ? "Mengekspor..." : "Ekspor Laporan Pesanan"}
                </Button>
              )}
              {permissions.canInvoice && (
                <Button
                  variant="default"
                  onClick={handleGenerateInvoice}
                  disabled={isGeneratingInvoice}
                >
                  {isGeneratingInvoice ? "Membuat..." : "Tagihan"}
                </Button>
              )}
              {permissions.canDeliveryOrder && (
                <Button
                  variant="default"
                  onClick={handleGenerateDeliveryOrder}
                  disabled={isGeneratingDeliveryOrder}
                >
                  {isGeneratingDeliveryOrder ? "Membuat..." : "Surat Jalan"}
                </Button>
              )}
              </div>
            </div>
          )}
          {!canShowSelectedActions && (
            <div className='mx-auto flex max-w-7xl p-4'>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${selectionMode ? "bg-gray-200" : ""}`}
                onClick={handleToggleSelectionMode}
                aria-label="Pilih data pesanan"
              >
                <IoMdCheckboxOutline className="text-2xl sm:text-3xl" />
              </Button>
            </div>
          )}
        </div>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <OrderTable
            orders={dateFilteredVisibleOrders}
            onOrderClick={handleOrderClick}
            loading={isRefreshing}
            canAdd={permissions.canAdd}
            onAddOrder={handleAddOrder}
            selectionMode={selectionMode}
            selectedOrderKeys={selectedOrderKeys}
            onToggleSelect={toggleOrderSelection}
            onStartSelection={startSelectionMode}
          />
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedOrder?.order_no}
                </DrawerTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {permissions.canDelete && (
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
                  )}
                  {permissions.canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer h-9 whitespace-nowrap"
                      onClick={handleEditOrder}
                      disabled={!selectedOrder}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Ubah
                    </Button>
                  )}
                  {permissions.canPrint && (
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
                  )}
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
                    <DetailRow label="Nomor Pesanan" value={selectedOrder.order_no} />
                    <DetailRow label="Nomor Telepon" value={selectedOrder.phone} />
                    <DetailRow label="Kategori Produk" value={selectedOrder.product_category} />
                    <DetailRow label="Paket" value={selectedOrder.product_package} />
                    <DetailRow label="Jumlah" value={selectedOrder.total_qty} />
                    <DetailRow label="Alamat" value={selectedOrder.address} />
                    <DetailRow
                      label="Lokasi"
                      value={
                        (() => {
                          const locationUrl = getGoogleMapsUrl(
                            selectedOrder.latitude,
                            selectedOrder.longitude
                          )
                          if (!locationUrl) return "-"
                          return (
                            <a
                              href={locationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              Lihat lokasi
                            </a>
                          )
                        })()
                      }
                    />
                    <DetailRow label="Tanggal Order" value={selectedOrder.order_date} />
                    <DetailRow label="Status Pengiriman" value={getOrderStatusLabel(selectedOrder)} />
                    <DetailRow label="Jam Sampai" value={selectedOrder.delivery_time} />
                    <DetailRow label="Keterangan" value={selectedOrder.note} />
                    {(() => {
                      const extendedOrder = selectedOrder as OrderWithExtras
                      const latestInvoice = getLatestInvoice(extendedOrder)
                      return (
                        <>
                          <DetailRow
                            label="Bukti Terima"
                            value={
                              extendedOrder.image_receive ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                                    >
                                      Lihat Bukti
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Bukti Terima Pesanan</DialogTitle>
                                      <DialogDescription>{extendedOrder.order_no}</DialogDescription>
                                    </DialogHeader>
                                    <div className="relative mx-auto h-[400px] w-full max-w-md overflow-hidden rounded-md">
                                      <Image
                                        src={extendedOrder.image_receive}
                                        alt={`Bukti terima pesanan ${extendedOrder.order_no}`}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                "-"
                              )
                            }
                          />
                          <DetailRow
                            label="Status Pesanan"
                            value={getOrderStatusLabel(extendedOrder)}
                          />
                          {/* <DetailRow
                            label="No. Invoice"
                            value={latestInvoice?.invoice_no ?? "-"}
                          /> */}
                          <DetailRow
                            label="Status Pembayaran"
                            value={renderPaymentStatusBadge(latestInvoice?.payment_status)}
                          />
                        </>
                      )
                    })()}
                    {selectedMenuValues && (
                      (Object.keys(orderMenuFieldLabels) as OrderMenuField[])
                        .filter(canShowMenuField)
                        .map((field) => (
                          <DetailRow
                            key={field}
                            label={orderMenuFieldLabels[field]}
                            value={selectedMenuValues[field]}
                          />
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderPageInner />
    </Suspense>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-normal">{value}</div>
    </div>
  )
}                                                                                       