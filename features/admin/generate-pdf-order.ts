import React from 'react'
import { pdf } from '@react-pdf/renderer'
import PdfOrderDocument, {
  type PdfOrderData,
} from '@/components/custom/pdf-order'
import { getStrapiURL } from '@/lib/utils'
import QRCode from 'qrcode'

type PdfLineItem = {
  name: string
  qty: string
}

const apiBaseUrl = getStrapiURL()
const getAppBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000'
  )
}

const withFallback = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  return String(value)
}

const getRelationData = (relation: any) => {
  if (Array.isArray(relation)) {
    return relation
  }

  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return relation.data
    }
    return [relation.data]
  }

  return relation ? [relation] : []
}

const getAttributes = (item: any) => item?.attributes ?? item ?? {}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatDayName = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleDateString('id-ID', { weekday: 'long' })
}

const buildLineItems = (
  menuAttrs: Record<string, any>,
  totalQty: string
): { detailItems: PdfLineItem[]; additionalItems: PdfLineItem[] } => {
  const qty = totalQty || '-'

  const detailItems: PdfLineItem[] = [
    menuAttrs.rice && { name: menuAttrs.rice, qty },
    menuAttrs.main_dish && { name: menuAttrs.main_dish, qty },
    menuAttrs.main_dish2 && { name: menuAttrs.main_dish2, qty },
    menuAttrs.main_dish3 && { name: menuAttrs.main_dish3, qty },
    menuAttrs.additional_dish && { name: menuAttrs.additional_dish, qty },
    menuAttrs.vegetable && { name: menuAttrs.vegetable, qty },
    menuAttrs.sauce && { name: menuAttrs.sauce, qty },
  ].filter(Boolean) as PdfLineItem[]

  const additionalItems: PdfLineItem[] = [
    menuAttrs.chip && { name: menuAttrs.chip, qty },
    menuAttrs.fruit && { name: menuAttrs.fruit, qty },
    menuAttrs.mineral_water && { name: menuAttrs.mineral_water, qty },
    menuAttrs.box && { name: menuAttrs.box, qty },
    menuAttrs.pudding && { name: menuAttrs.pudding, qty },
    menuAttrs.snack && { name: menuAttrs.snack, qty },
  ].filter(Boolean) as PdfLineItem[]

  return { detailItems, additionalItems }
}

const normalizeOrder = (payload: any): PdfOrderData => {
  const data = payload?.data ?? payload
  const attributes = getAttributes(data)

  const customerData = getRelationData(attributes.customer_id)
  const customerAttrs = getAttributes(customerData[0])

  const staffData = getRelationData(attributes.staff_id)
  const staffAttrs = getAttributes(staffData[0])

  const detailData = getRelationData(attributes.order_details)
  const detailAttrs = getAttributes(detailData[0])

  const menuData = getRelationData(attributes.order_menus)
  const menuAttrs = getAttributes(menuData[0])

  const totalQty = withFallback(detailAttrs.qty, '-')

  const { detailItems, additionalItems } = buildLineItems(menuAttrs, totalQty)

  const orderDateRaw =
    attributes.delivery_date || attributes.createdAt || attributes.created_at

  return {
    orderNo: withFallback(
      attributes.order_no ||
        attributes.orderNo ||
        data?.order_no ||
        data?.orderNo
    ),
    customerName: withFallback(
      customerAttrs.name ||
        customerAttrs.customer_name ||
        attributes.recipient_name
    ),
    salesName: withFallback(
      staffAttrs.name ||
        staffAttrs.staff_name ||
        '-'
    ),
    orderDate: formatDate(withFallback(orderDateRaw, '')),
    orderDay: formatDayName(withFallback(orderDateRaw, '')),
    deliveryTime: withFallback(attributes.arrive_time),
    detailItems,
    additionalItems,
  }
}

const fetchOrderByDocumentId = async (
  documentId: string
): Promise<PdfOrderData> => {
  const trimmed = documentId.trim()
  if (!trimmed) throw new Error('Document ID pesanan tidak valid')

  const url = new URL(`/api/orders/${trimmed}`, apiBaseUrl)
  url.searchParams.set('populate[customer_id][populate]', '*')
  url.searchParams.set('populate[staff_id][populate]', '*')
  url.searchParams.set('populate[package_id][populate]', '*')
  url.searchParams.set('populate[order_details][populate]', '*')
  url.searchParams.set('populate[order_menus][populate]', '*')

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data pesanan')
  }

  const result = await response.json()
  const data = result?.data ?? result

  if (!data) {
    throw new Error('Data pesanan tidak ditemukan')
  }

  return normalizeOrder(result)
}

export async function generateOrderPdf(documentId: string) {
  const orderData = await fetchOrderByDocumentId(documentId)
  const appBaseUrl = getAppBaseUrl()
  const statusUrl = `${appBaseUrl}/order/${encodeURIComponent(
    documentId
  )}/status`
  const qrPayload = statusUrl
  try {
    orderData.qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      scale: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    console.error('Gagal membuat QR code:', error)
  }

  const documentNode = React.createElement(PdfOrderDocument, { order: orderData }) as Parameters<typeof pdf>[0]

  const blob = await pdf(documentNode).toBlob()
  const fileName = `order-${orderData.orderNo || documentId}.pdf`

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
}
