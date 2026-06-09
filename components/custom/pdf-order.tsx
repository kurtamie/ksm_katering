import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from '@react-pdf/renderer'

type PdfLineItem = {
  name: string
  qty: string
}

export type PdfOrderData = {
  orderNo: string
  customerName: string
  salesName: string
  orderDate: string
  orderDay: string
  deliveryTime: string
  detailItems: PdfLineItem[]
  additionalItems: PdfLineItem[]
  qrDataUrl?: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    padding: 24,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontWeight: 'normal',
  },
  value: {
    width: 140,
  },
  tableWrapper: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e5e5',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
  },
  headerCellNo: {
    width: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#c0c0c0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerCellLabel: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#c0c0c0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerCellQty: {
    width: 80,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
  },
  cellNo: {
    width: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#c0c0c0',
    textAlign: 'center',
  },
  cellLabel: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#c0c0c0',
  },
  cellQty: {
    width: 80,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  qrSection: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  qrText: {
    fontSize: 11,
    color: '#333333',
    flex: 1,
  },
  qrImage: {
    width: 70,
    height: 70,
  },
})

const renderTable = (title: string, items: PdfLineItem[]) => (
  <View key={title} style={styles.tableWrapper}>
    <View style={styles.tableHeader}>
      <Text style={styles.headerCellNo}>No</Text>
      <Text style={styles.headerCellLabel}>{title}</Text>
      <Text style={styles.headerCellQty}>Jumlah</Text>
    </View>
    {items.length === 0 ? (
      <View style={styles.bodyRow}>
        <Text style={styles.cellNo}>-</Text>
        <Text style={styles.cellLabel}>Tidak ada data</Text>
        <Text style={styles.cellQty}>-</Text>
      </View>
    ) : (
      items.map((item, index) => (
        <View style={styles.bodyRow} key={`${title}-${index}`}>
          <Text style={styles.cellNo}>{index + 1}</Text>
          <Text style={styles.cellLabel}>{item.name}</Text>
          <Text style={styles.cellQty}>{item.qty}</Text>
        </View>
      ))
    )}
  </View>
)

export function PdfOrderDocument({ order }: { order: PdfOrderData }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={{ marginBottom: 12 }}>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Nomor pesanan</Text>
            <Text style={styles.value}>: {order.orderNo}</Text>
            <Text style={styles.label}>Jam Sampai</Text>
            <Text style={styles.value}>: {order.deliveryTime}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Nama Pelanggan</Text>
            <Text style={styles.value}>: {order.customerName}</Text>
            <Text style={styles.label}>Nama Sales</Text>
            <Text style={styles.value}>: {order.salesName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Tanggal Order</Text>
            <Text style={styles.value}>: {order.orderDate}</Text>
            <Text style={styles.label}>Hari Order</Text>
            <Text style={styles.value}>: {order.orderDay}</Text>
          </View>
        </View>

        {renderTable('Detail Menu', order.detailItems)}
        {renderTable('Item Tambahan', order.additionalItems)}

        {order.qrDataUrl && (
          <View style={styles.qrSection}>
            {/* <Text style={styles.qrText}>
              Scan QR untuk verifikasi pesanan
            </Text> */}
            <Image style={styles.qrImage} src={order.qrDataUrl} />
          </View>
        )}
      </Page>
    </Document>
  )
}

export default PdfOrderDocument
