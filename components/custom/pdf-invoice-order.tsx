import React from 'react'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import type { Order } from '@/features/admin/get-order'

type InvoiceLineItem = {
  description: string
  qty: string
  unitPrice: string
  totalPrice: string
}

type InvoiceData = {
  invoiceNo: string
  invoiceDate: string
  dueDate: string
  customerName: string
  customerAddress: string
  customerCity: string
  items: InvoiceLineItem[]
  notes: string
  totalAmount: string
}

type PdfInvoiceOrderDocumentProps = {
  orders: Order[]
  logoSrc: string
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2a44',
  },
  topBar: {
    height: 6,
    backgroundColor: '#1f2f7a',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 9,
    color: '#5b6b8f',
    marginBottom: 1,
  },
  logo: {
    width: 48,
    height: 48,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2f7a',
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 9,
    color: '#d43b3b',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoBlock: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 9,
    color: '#1f2f7a',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: '#4a4a4a',
    marginBottom: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f7',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e6f0',
  },
  colDescription: {
    width: '52%',
  },
  colQty: {
    width: '12%',
    textAlign: 'center',
  },
  colUnit: {
    width: '18%',
    textAlign: 'right',
  },
  colTotal: {
    width: '18%',
    textAlign: 'right',
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  notesBlock: {
    width: '55%',
  },
  totalBlock: {
    width: '40%',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 9,
    color: '#1f2f7a',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d43b3b',
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d7dbe7',
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    fontSize: 8,
    color: '#5b6b8f',
  },
  footerBlock: {
    width: '32%',
  },
  signatureLine: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#d7dbe7',
  },
})

const withFallback = (value: unknown, fallback = '-') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  return String(value)
}

const isFilled = (value: unknown) => {
  const normalized = withFallback(value)
  return normalized !== '-'
}

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^\d.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const formatCurrency = (value: string) => {
  const numeric = parseNumber(value)
  if (numeric === null) return withFallback(value)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numeric)
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return withFallback(value)
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const buildInvoiceData = (order: Order): InvoiceData => {
  const packageDescription =
    withFallback(order.menu_product) !== '-' ? order.menu_product :
    withFallback(order.product_package) !== '-' ? order.product_package :
    withFallback(order.product_category)
  const menuItems = [
    order.rice_type,
    order.side_dish,
    order.side_dish2,
    order.side_dish3,
    order.additional_dish,
    order.vegetable,
    order.sauce,
    order.chip,
    order.fruit,
    order.mineral_water,
    order.box,
    order.pudding,
    order.snack,
  ].filter(isFilled)
  const description = menuItems.length > 0
    ? `${withFallback(packageDescription)}\n${menuItems.join(', ')}`
    : withFallback(packageDescription)

  const qty = withFallback(order.total_qty || order.qty, '-')
  const unitPrice = formatCurrency(withFallback(order.price_ksm, '-'))
  const totalPriceRaw = withFallback(order.price_total || order.amount, '-')
  const totalPrice = formatCurrency(totalPriceRaw)

  const totalAmount = totalPrice

  return {
    invoiceNo: withFallback(order.order_no),
    invoiceDate: formatDate(withFallback(order.order_date)),
    dueDate: '-',
    customerName: withFallback(order.customer),
    customerAddress: withFallback(order.address),
    customerCity: 'Batam',
    items: [
      {
        description,
        qty,
        unitPrice,
        totalPrice,
      },
    ],
    notes: withFallback(order.note),
    totalAmount,
  }
}

const InvoiceHeader = ({ logoSrc }: { logoSrc: string }) => (
  <View>
    <View style={styles.topBar} />
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.companyName}>PT Katering Sukses Mandiri</Text>
        <Text style={styles.companyLine}>Shophouse Blok 01 No. 19</Text>
        <Text style={styles.companyLine}>Batamindo Industrial Park (BIP)</Text>
        <Text style={styles.companyLine}>Muka Kuning - Batam</Text>
        <Text style={styles.companyLine}>Email : kateringksmmandiri@gmail.com</Text>
      </View>
      <Image style={styles.logo} src={logoSrc} />
    </View>

    <Text style={styles.invoiceTitle}>Invoice</Text>
  </View>
)

const InvoiceBody = ({ data }: { data: InvoiceData }) => (
  <View wrap={false}>
    <Text style={styles.invoiceDate}>Tanggal : {data.invoiceDate}</Text>

    <View style={styles.infoRow}>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Kepada</Text>
        <Text style={styles.infoValue}>{data.customerName}</Text>
        <Text style={styles.infoValue}>{data.customerAddress}</Text>
        <Text style={styles.infoValue}>{data.customerCity}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Nomor Invoice</Text>
        <Text style={styles.infoValue}>{data.invoiceNo}</Text>
        <Text style={styles.infoLabel}>Jatuh Tempo</Text>
        <Text style={styles.infoValue}>{data.dueDate}</Text>
      </View>
    </View>

    <View style={styles.tableHeader}>
      <Text style={styles.colDescription}>Description</Text>
      <Text style={styles.colQty}>Qty</Text>
      <Text style={styles.colUnit}>Unit price</Text>
      <Text style={styles.colTotal}>Total price</Text>
    </View>
    {data.items.map((item, index) => (
      <View key={`${item.description}-${index}`} style={styles.tableRow}>
        <Text style={styles.colDescription}>{item.description}</Text>
        <Text style={styles.colQty}>{item.qty}</Text>
        <Text style={styles.colUnit}>{item.unitPrice}</Text>
        <Text style={styles.colTotal}>{item.totalPrice}</Text>
      </View>
    ))}

    <View style={styles.notesRow}>
      <View style={styles.notesBlock}>
        <Text style={styles.infoLabel}>Notes</Text>
        <Text style={styles.infoValue}>{data.notes}</Text>
      </View>
      <View style={styles.totalBlock}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{data.totalAmount}</Text>
      </View>
    </View>
  </View>
)

export function PdfInvoiceOrderDocument({ orders, logoSrc }: PdfInvoiceOrderDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceHeader logoSrc={logoSrc} />
        {orders.map((order, index) => {
          const data = buildInvoiceData(order)
          const key = order.documentId ?? String(order.id ?? index)
          return (
            <View key={key}>
              {index > 0 && <View style={styles.divider} />}
              <InvoiceBody data={data} />
            </View>
          )
        })}

        <View style={styles.footerRow}>
          <View style={styles.footerBlock}>
            <Text style={styles.infoLabel}>Rekening Bank</Text>
            <Text style={styles.infoValue}>Mandiri 1090003113798</Text>
            <Text style={styles.infoValue}>a/n PT Katering Sukses Mandiri</Text>
          </View>
          <View style={styles.footerBlock}>
            <Text style={styles.infoLabel}>Diterima Oleh,</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.footerBlock}>
            <Text style={styles.infoLabel}>Hormat Kami,</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.infoValue}>Yuni Irdayanti</Text>
            <Text style={styles.infoValue}>Marketing</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.infoLabel}>NPWP</Text>
          <Text style={styles.infoValue}>22.469.289-7.225.000</Text>
          <Text style={styles.infoValue}>PT Katering Sukses Mandiri</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PdfInvoiceOrderDocument
