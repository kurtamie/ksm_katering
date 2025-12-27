import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const orders = [
  {
    order_no: "ORD2838-8382",
    customer: "111",
    customer_type: "BUMN",
    category: "Prasmanan",
    package: "Prasmanan Paket A",
    driver: "Budi",
    qty: "80",
    price_ksm: "25",
    price_send: "-",
    price_total: "-",
    amount: "-",
    created_at: "2025-12-14",
    phone: "08953285739820",
    product_category: "Nasi Kotak",
    product_package: "Nasi Kotak Paket A (Menu Ayam)",
    total_qty: "90",
    address: "Perum Gmp, Blok n, RT.1/RW.2, Tanjung Piayu Sei Beduk, Sei/Sungai Beduk (No. 120), KOTA BATAM - SEI/SUNGAI BEDUK, KEPULAUAN RIAU, ID 29433",
    order_date: "14 Desember 2025",
    delivery_status: "DImasak",
    delivery_time: "09.00",
    note: "Dikantongi satu per satu",
    rice_type: "Nasi Putih",
    side_dish: "Ayam Goreng Kalasan"
  },
  {
    order_no: "ORD2838-R302",
    customer: "111",
    customer_type: "BUMN",
    category: "Prasmanan",
    package: "Prasmanan Paket A",
    driver: "Budi",
    qty: "80",
    price_ksm: "25",
    price_send: "-",
    price_total: "-",
    amount: "-",
    created_at: "2025-12-14",
    phone: "08953285739820",
    product_category: "Nasi Kotak",
    product_package: "Nasi Kotak Paket A (Menu Ayam)",
    total_qty: "90",
    address: "Perum Gmp, Blok n, RT.1/RW.2, Tanjung Piayu Sei Beduk, Sei/Sungai Beduk (No. 120), KOTA BATAM - SEI/SUNGAI BEDUK, KEPULAUAN RIAU, ID 29433",
    order_date: "14 Desember 2025",
    delivery_status: "DImasak",
    delivery_time: "09.00",
    note: "Dikantongi satu per satu",
    rice_type: "Nasi Putih",
    side_dish: "Ayam Goreng Kalasan"
  },
  {
    order_no: "ORD2838-R303",
    customer: "111",
    customer_type: "BUMN",
    category: "Prasmanan",
    package: "Prasmanan Paket A",
    driver: "Budi",
    qty: "80",
    price_ksm: "25",
    price_send: "-",
    price_total: "-",
    amount: "-",
    created_at: "2025-12-15",
    phone: "08953285739820",
    product_category: "Nasi Kotak",
    product_package: "Nasi Kotak Paket A (Menu Ayam)",
    total_qty: "90",
    address: "Perum Gmp, Blok n, RT.1/RW.2, Tanjung Piayu Sei Beduk, Sei/Sungai Beduk (No. 120), KOTA BATAM - SEI/SUNGAI BEDUK, KEPULAUAN RIAU, ID 29433",
    order_date: "15 Desember 2025",
    delivery_status: "DImasak",
    delivery_time: "09.00",
    note: "Dikantongi satu per satu",
    rice_type: "Nasi Putih",
    side_dish: "Ayam Goreng Kalasan"
  },
]

type Order = typeof orders[0]
type GroupedOrders = Record<string, Order[]>

interface OrderTableProps {
  onOrderClick: (order: Order) => void
}

export default function OrderTable({ onOrderClick }: OrderTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const groupedOrders = orders.reduce<GroupedOrders>((acc, order) => {
    const date = order.created_at
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(order)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )

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
          {sortedDates.map((date) => (
            <React.Fragment key={date}>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableCell colSpan={11} className="font-semibold text-gray-700">
                  {formatDate(date)}
                </TableCell>
              </TableRow>
              {groupedOrders[date].map((order, index) => (
                <TableRow 
                  key={`${order.order_no}-${date}-${index}`}
                  className="cursor-pointer hover:bg-gray-50"
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

export type { Order }
