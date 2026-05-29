import type { Order } from '@/features/admin/get-order'

const columns: Array<{ header: string; value: (order: Order) => string }> = [
  { header: 'Tanggal', value: (order) => formatDate(order.createdAt) },
  { header: 'Nomor Order', value: (order) => order.order_no },
  { header: 'Customer ID', value: (order) => order.customer },
  { header: 'Golongan Customer', value: (order) => order.customer_type },
  { header: 'Kategori Produk', value: (order) => order.category },
  { header: 'Nama Paket', value: (order) => order.package },
  { header: 'Driver', value: (order) => order.staff_driver_id },
  { header: 'Jumlah', value: (order) => order.qty },
  { header: 'Harga Jual KSM', value: (order) => order.price_ksm },
  { header: 'Harga Pengiriman', value: (order) => order.price_send },
  { header: 'Harga Total', value: (order) => order.price_total },
  { header: 'Pembayaran 1', value: (order) => order.payment1 },
  { header: 'Pembayaran 2', value: (order) => order.payment2 },
  { header: 'Pembayaran 3', value: (order) => order.payment3 },
  { header: 'Amount', value: (order) => order.amount },
]

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const isValidDate = (value: string) => Number.isFinite(Date.parse(value))

const formatDate = (value: string) => {
  if (!isValidDate(value)) return '-'
  const date = new Date(value)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function generateOrderExcelReport(orders: Order[]) {
  if (!orders || orders.length === 0) {
    throw new Error('Data pesanan untuk laporan tidak tersedia')
  }

  const headerCells = columns
    .map((column) => `<th>${escapeHtml(column.header)}</th>`)
    .join('')
  const rows = orders
    .map((order) => {
      const cells = columns
        .map((column) => `<td>${escapeHtml(column.value(order))}</td>`)
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const worksheet = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([worksheet], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const fileName = `laporan-pesanan-${new Date().toISOString().split('T')[0]}.xls`

  if (typeof window === 'undefined') {
    return blob
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1500)

  return blob
}
