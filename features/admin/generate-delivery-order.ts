import React from 'react'
import { pdf } from '@react-pdf/renderer'
import PdfDeliveryOrderDocument from '@/components/custom/pdf-delivery-order'
import type { Order } from '@/features/admin/get-order'
import logoPng from '@/app/asset/logo-pt-monokrom.png'

const getLogoSrc = () => {
  if (typeof logoPng === 'string') {
    return logoPng
  }
  if (logoPng && typeof logoPng === 'object' && 'src' in logoPng) {
    return logoPng.src
  }
  return ''
}

export async function generateDeliveryOrderPdf(orders: Order[]) {
  if (!orders || orders.length === 0) {
    throw new Error('Data pesanan untuk surat jalan tidak tersedia')
  }

  const logoSrc = getLogoSrc()
  const documentNode = React.createElement(PdfDeliveryOrderDocument, {
    orders,
    logoSrc,
  }) as Parameters<typeof pdf>[0]

  const blob = await pdf(documentNode).toBlob()
  const fileName = `surat-jalan-orders-${new Date().toISOString().split('T')[0]}.pdf`

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
