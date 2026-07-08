import React from 'react'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Order } from '@/features/admin/get-order'
import {
  getLatestInvoice,
  getOrderStatusLabel,
  STEP_LABEL_MAP,
} from '@/const/admin/order'
import Empty from '@/public/lottie/empty.json'
import Lottie from "lottie-react"
import { Button } from '../ui/button'

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Sudah Dibayar",
  overdue: "Jatuh Tempo",
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
}

type GroupedOrders = Record<string, Order[]>

export type OrderInvoice = {
  invoice_no?: string | null
  invoice_date?: string | null
  payment_status?: 'unpaid' | 'paid' | 'overdue' | string | null
}

export type OrderWithExtras = Order

export { getLatestInvoice, STEP_LABEL_MAP }
export const PAYMENT_STATUS_LABEL_MAP = PAYMENT_STATUS_LABELS

interface OrderTableProps {
  orders: Order[]
  onOrderClick: (order: Order) => void
  loading?: boolean
  canAdd?: boolean
  onAddOrder?: () => void
  selectionMode?: boolean
  selectedOrderKeys?: Set<string>
  onToggleSelect?: (order: Order) => void
  onStartSelection?: (order: Order) => void
}


const isValidDate = (value?: string | null) => {
  if (!value) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}

const getTimestamp = (value?: string | null) => {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const renderPaymentStatusBadge = (paymentStatus?: string | null) => {
  if (!paymentStatus) return "-"
  const label = PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus
  const style = PAYMENT_STATUS_STYLES[paymentStatus] ?? "bg-gray-100 text-gray-800"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}>
      {label}
    </span>
  )
}

const OrderTableSkeleton = ({ selectionMode }: { selectionMode: boolean }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <Table className="text-xs sm:text-sm">
        <TableHeader>
          <TableRow>
            {selectionMode && (
              <TableHead className="w-10 font-bold whitespace-nowrap"><Skeleton className="h-4 w-6" /></TableHead>
            )}
            <TableHead className="min-w-[150px] font-bold whitespace-nowrap"><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className='min-w-[120px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className='min-w-[180px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead className='min-w-[180px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead className='min-w-[120px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className='min-w-[100px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead className='min-w-[150px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead className='min-w-[140px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className='min-w-[120px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead className='min-w-[150px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead className="min-w-[140px] text-right font-bold whitespace-nowrap"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              {selectionMode && (
                <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-6" /></TableCell>
              )}
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell className="text-right whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


export default function OrderTable({
  orders,
  onOrderClick,
  loading = false,
  canAdd = false,
  onAddOrder,
  selectionMode = false,
  selectedOrderKeys = new Set(),
  onToggleSelect,
  onStartSelection,
}: OrderTableProps) {
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = React.useRef(false)

  const formatDate = (dateString: string) => {
    if (!isValidDate(dateString)) return "-"
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getDateKey = (dateString: string) => {
    if (!isValidDate(dateString)) return "no-date"
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const groupedOrders = orders.reduce<GroupedOrders>((acc, order) => {
    const dateKey = getDateKey(order.createdAt)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(order)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
    if (a === "no-date") return 1
    if (b === "no-date") return -1
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const sortedGroupedOrders = Object.fromEntries(
    Object.entries(groupedOrders).map(([dateKey, dateOrders]) => [
      dateKey,
      [...dateOrders].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      ),
    ])
  ) as GroupedOrders

  const getOrderKey = (order: Order) =>
    order.documentId ?? String(order.id ?? order.order_no)

  const handleRowClick = (order: Order) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }

    if (selectionMode) {
      onToggleSelect?.(order)
      return
    }

    onOrderClick(order)
  }

  const startLongPress = (order: Order) => {
    if (selectionMode) return
    if (!onStartSelection) return
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      onStartSelection(order)
    }, 450)
  }

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }
  
  if (loading) {
    return <OrderTableSkeleton selectionMode={selectionMode} />
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
        <Table className="text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-10 font-bold whitespace-nowrap"></TableHead>
              )}
              <TableHead className="min-w-[150px] font-bold whitespace-nowrap">Nomor pesanan</TableHead>
              <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>ID Pelanggan</TableHead>
              <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Jenis Pelanggan</TableHead>
              <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Layanan</TableHead>
              <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Nama Paket</TableHead>
              <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>Kurir</TableHead>
              <TableHead className='min-w-[100px] font-bold whitespace-nowrap'>Jumlah</TableHead>
              <TableHead className='min-w-[150px] font-bold whitespace-nowrap'>Harga Jual KSM</TableHead>
              <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Harga Pengiriman</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Harga Total</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 1</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 2</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 3</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Bukti Terima</TableHead>
              <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>Status Pesanan</TableHead>
              {/* <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>No. Invoice</TableHead> */}
              <TableHead className='min-w-[150px] font-bold whitespace-nowrap'>Status Pembayaran</TableHead>
              <TableHead className="min-w-[140px] text-right font-bold whitespace-nowrap">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDates.map((dateKey) => (
              <React.Fragment key={dateKey}>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableCell colSpan={selectionMode ? 18 : 17} className="font-semibold text-gray-700">
                    {dateKey === "no-date" ? "Tanggal Tidak Valid" : formatDate(dateKey)}
                  </TableCell>
                </TableRow>
                {sortedGroupedOrders[dateKey].map((orderItem, index) => {
                const order = orderItem as OrderWithExtras
                return (
                  <TableRow 
                    key={`${order.order_no}-${dateKey}-${index}`}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(order)}
                    onMouseDown={() => startLongPress(order)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(order)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                  >
                    {selectionMode && (
                      <TableCell className="whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedOrderKeys.has(getOrderKey(order))}
                          onChange={() => onToggleSelect?.(order)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap">{order.order_no}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.customer}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.customer_type}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.category}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.package}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.staff_driver_id}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.qty}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.price_ksm}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.price_send}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.price_total}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.payment1}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.payment2}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.payment3}</TableCell>
                    <TableCell
                      className="whitespace-nowrap"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {order.image_receive ? (
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
                              <DialogDescription>{order.order_no}</DialogDescription>
                            </DialogHeader>
                            <div className="relative mx-auto h-[400px] w-full max-w-md overflow-hidden rounded-md">
                              <Image
                                src={order.image_receive}
                                alt={`Bukti terima pesanan ${order.order_no}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getOrderStatusLabel(order)}
                    </TableCell>
                    {/* <TableCell className="whitespace-nowrap">
                      {getLatestInvoice(order)?.invoice_no ?? "-"}
                    </TableCell> */}
                    <TableCell className="whitespace-nowrap">
                      {renderPaymentStatusBadge(getLatestInvoice(order)?.payment_status)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{order.amount}</TableCell>
                  </TableRow>
                )
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {sortedDates.length === 0 && (
        <div className="text-center py-8 text-black">
          <div className='w-[200px] mx-auto'>
            <Lottie animationData={Empty}/>
          </div>
          <h1 className='font-bold text-sm mt-4'>Belum Ada Pesanan Masuk</h1>
          {/*                                                                */}
          {canAdd && (
            <Button className='px-12 py-4 mt-6' onClick={onAddOrder}>
              Tambah Pesanan
            </Button>
          )}
        </div>
      )}
    </div>
  )
}                                                                        