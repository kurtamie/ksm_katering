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

type PdfDeliveryOrderDocumentProps = {
  orders: Order[]
  logoSrc: string
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 28,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111111',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 8,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 8.5,
    marginBottom: 1,
  },
  title: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 25,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCol: {
    width: '48%',
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 82,
  },
  infoColon: {
    width: 8,
    textAlign: 'center',
  },
  infoValue: {
    flexGrow: 1,
  },
  intro: {
    marginBottom: 2,
  },
  courierLine: {
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e5e5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d1d1d1',
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d1d1d1',
  },
  colNo: {
    width: '12%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#d1d1d1',
  },
  colName: {
    width: '52%',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderColor: '#d1d1d1',
  },
  colQty: {
    width: '18%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#d1d1d1',
  },
  colUnit: {
    width: '18%',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureRow: {
    marginTop: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  signatureBlock: {
    width: '34%',
    alignItems: 'center',
  },
  signatureLabel: {
    marginBottom: 40,
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
})

const withFallback = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  return String(value)
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

const getItemName = (order: Order) => {
  if (withFallback(order.menu_product) !== '-') return withFallback(order.menu_product)
  if (withFallback(order.product_package) !== '-') return withFallback(order.product_package)
  return withFallback(order.product_category)
}

const getTravelLetterNumber = (order: Order) => {
  const raw = withFallback(order.travel_letter_no)
  if (raw.startsWith('ORD')) {
    return raw.replace('ORD', '')
  }
  return raw
}

const getPaymentStatus = (order: Order) => {
  const deliveryStatus = withFallback(order.delivery_status, '').toLowerCase()
  if (deliveryStatus.includes('lunas')) return 'Lunas'
  if (deliveryStatus.includes('belum')) return 'Belum Lunas'
  return 'Lunas'
}

const DeliveryOrderPage = ({ order, logoSrc }: { order: Order; logoSrc: string }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.headerRow}>
      <Image style={styles.logo} src={logoSrc} />
      <View>
        <Text style={styles.companyName}>PT KATERING SUKSES MANDIRI</Text>
        <Text style={styles.companyLine}>Shophouse Blok D1 No. 19, Batamindo Industrial Park (BIP) Muka Kuning - Batam 29433</Text>
        <Text style={styles.companyLine}>Telepon : 0770 - 611687</Text>
        <Text style={styles.companyLine}>E-mail : kateringksmmandiri@gmail.com</Text>
      </View>
    </View>

    <Text style={styles.title}>SURAT JALAN</Text>

    <View style={styles.infoRow}>
      <View style={styles.infoCol}>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>No Surat Jalan</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{getTravelLetterNumber(order)}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Tanggal</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{formatDate(withFallback(order.order_date))}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Jam Sampai</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{withFallback(order.delivery_time)}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Kepada</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{withFallback(order.customer)}</Text>
        </View>
      </View>
      <View style={styles.infoCol}>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Alamat</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{withFallback(order.address)}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>No Telepon</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{withFallback(order.phone)}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>No Invoice</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{withFallback(order.order_no)}</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Status Pembayaran</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{getPaymentStatus(order)}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.intro}>Kami kirimkan barang-barang dibawah ini dengan:</Text>
    <Text style={styles.courierLine}>
      Nama pengemudi <Text style={styles.bold}>{withFallback(order.driver)}</Text> No BP <Text style={styles.bold}>{withFallback(order.staff_driver_id)}</Text>
    </Text>

    <View style={styles.tableHeader}>
      <Text style={[styles.colNo, styles.tableHeaderText]}>NO</Text>
      <Text style={[styles.colName, styles.tableHeaderText]}>NAMA BARANG</Text>
      <Text style={[styles.colQty, styles.tableHeaderText]}>JUMLAH</Text>
      <Text style={[styles.colUnit, styles.tableHeaderText]}>SATUAN</Text>
    </View>
    <View style={styles.tableRow}>
      <Text style={styles.colNo}>{withFallback(order.id, withFallback(order.order_no))}</Text>
      <Text style={styles.colName}>{getItemName(order)}</Text>
      <Text style={styles.colQty}>{withFallback(order.total_qty || order.qty)}</Text>
      <Text style={styles.colUnit}>{withFallback(order.box, 'Kotak')}</Text>
    </View>

    <View style={styles.signatureRow}>
      <View style={styles.signatureBlock}>
        <Text style={styles.signatureLabel}>Pengemudi</Text>
        <View style={styles.signatureLine} />
      </View>
      <View style={styles.signatureBlock}>
        <Text style={styles.signatureLabel}>Diterima Oleh</Text>
        <View style={styles.signatureLine} />
      </View>
    </View>
  </Page>
)

export function PdfDeliveryOrderDocument({ orders, logoSrc }: PdfDeliveryOrderDocumentProps) {
  return (
    <Document>
      {orders.map((order, index) => {
        const key = order.documentId ?? String(order.id ?? index)
        return <DeliveryOrderPage key={key} order={order} logoSrc={logoSrc} />
      })}
    </Document>
  )
}

export default PdfDeliveryOrderDocument
