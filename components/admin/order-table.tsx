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

type GroupedOrders = Record<string, Order[]>

interface OrderTableProps {
  orders: Order[]
  onOrderClick: (order: Order) => void
  loading?: boolean
}

const isValidDate = (value: string) => {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}

const OrderTableSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <Table className="text-xs sm:text-sm">
        <TableHeader>
          <TableRow>
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


export default function OrderTable({ orders, onOrderClick, loading = false }: OrderTableProps) {
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
  
  if (loading) {
    return <OrderTableSkeleton />
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <Table className="text-xs sm:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px] font-bold whitespace-nowrap">Nomor Order</TableHead>
            <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>Customer ID</TableHead>
            <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Golongan Customer</TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Kategori Produk</TableHead>
            <TableHead className='min-w-[180px] font-bold whitespace-nowrap'>Nama Paket</TableHead>
            <TableHead className='min-w-[120px] font-bold whitespace-nowrap'>Driver</TableHead>
            <TableHead className='min-w-[100px] font-bold whitespace-nowrap'>Jumlah</TableHead>
            <TableHead className='min-w-[150px] font-bold whitespace-nowrap'>Harga Jual KSM</TableHead>
            <TableHead className='min-w-[160px] font-bold whitespace-nowrap'>Harga Pengiriman</TableHead>
            <TableHead className='min-w-[140px] font-bold whitespace-nowrap'>Harga Total</TableHead>
            <TableHead className="min-w-[140px] text-right font-bold whitespace-nowrap">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDates.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                Tidak ada data pesanan
              </TableCell>
            </TableRow>
          )}

          {sortedDates.map((dateKey) => (
            <React.Fragment key={dateKey}>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableCell colSpan={11} className="font-semibold text-gray-700">
                  {dateKey === "no-date" ? "Tanggal Tidak Valid" : formatDate(dateKey)}
                </TableCell>
              </TableRow>
              {groupedOrders[dateKey].map((order, index) => (
                <TableRow 
                  key={`${order.order_no}-${dateKey}-${index}`}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onOrderClick(order)}
                >
                  <TableCell className="whitespace-nowrap">{order.order_no}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.customer}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.customer_type}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.category}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.package}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.driver}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.qty}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.price_ksm}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.price_send}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.price_total}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{order.amount}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}