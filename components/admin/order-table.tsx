import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Order } from '@/features/admin/get-order'
import Empty from '@/public/lottie/empty.json'
import Lottie from "lottie-react"
import { Button } from '../ui/button'

type GroupedOrders = Record<string, Order[]>

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

const isValidDate = (value: string) => {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}

const getTimestamp = (value: string) => {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
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
              <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Golongan Pelanggan</TableHead>
              <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Kategori Produk</TableHead>
              <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Nama Paket</TableHead>
              <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>Kurir</TableHead>
              <TableHead className='min-w-[100px] font-bold whitespace-nowrap'>Jumlah</TableHead>
              <TableHead className='min-w-[150px] font-bold whitespace-nowrap'>Harga Jual KSM</TableHead>
              <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Harga Pengiriman</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Harga Total</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 1</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 2</TableHead>
              <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Pembayaran 3</TableHead>
              <TableHead className="min-w-[140px] text-right font-bold whitespace-nowrap">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDates.map((dateKey) => (
              <React.Fragment key={dateKey}>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableCell colSpan={selectionMode ? 15 : 14} className="font-semibold text-gray-700">
                    {dateKey === "no-date" ? "Tanggal Tidak Valid" : formatDate(dateKey)}
                  </TableCell>
                </TableRow>
                {sortedGroupedOrders[dateKey].map((order, index) => (
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
                    <TableCell className="text-right whitespace-nowrap">{order.amount}</TableCell>
                  </TableRow>
                ))}
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
          <p className='mt-2 text-sm'>Data pesanan akan otomatis dibuat oleh AI</p>
          <p className='mt-2 text-sm'>atau dapat ditambahkan manual oleh sales.</p>
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
