import { getStrapiURL } from '@/lib/utils'
import type { Coordinate } from '@/types/coordinate'

export type OrderForEdit = {
  orderId: number | null
  orderDetailId: number | null
  orderDetailDocumentId: string | null
  orderMenuId: number | null
  orderMenuDocumentId: string | null
  orderNo: string
  customerId: string
  customerType: string
  executorTeam: string
  supplier: string
  product: string
  packageId: string
  packageName: string
  qty: string
  sellingPrice: string
  brokerFee: string
  priceForKsm: string
  minSellingPrice: string
  amount: string
  deliveryCharge: string
  totalAmount: string
  payment1: string
  payment2: string
  payment3: string
  deliveryNote: string
  arriveTime: string
  leaveTime: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  rice: string
  mainDish: string
  mainDish2: string
  mainDish3: string
  additionalDish: string
  vegetable: string
  sauce: string
  chip: string
  fruit: string
  mineralWater: string
  box: string
  pudding: string
  snack: string
  snack2: string
  snack3: string
  snack4: string
  deliveryDate: string
  staffDriverId: string
  invoiceDocumentId: string | null
  invoiceId: number | null
  paymentStatus: string
  coordinates: Coordinate

}

type UpdateOrderResult = {
  success: boolean
  error?: string
}

export type UpdateOrderPayload = {
  orderId?: number | null
  orderDetailId?: number | null
  orderDetailDocumentId?: string | null
  orderMenuId?: number | null
  orderMenuDocumentId?: string | null
  orderData: {
    order_no: string
    created_date: string
    customer_id: number
    customer_type: string
    executor_name: string
    supplier: string
    product: string
    package_id: number[]
    package_name: string
    recipient_name: string
    recipient_phone_no: string
    delivery_note: string
    delivery_date: string
    arrive_time: string
    leave: string
    delivery_address: string
    latitude: string
    longitude: string
    staff_driver_id?: number | null
  }
  orderDetailData: {
    qty: string
    selling_price: string
    broker_fee: string
    price_for_ksm: string
    min_selling_price: string
    amount: string
    delivery_charge: string
    total_amount: string
  }
  orderMenuData: {
    rice: string
    main_dish: string
    main_dish2: string
    main_dish3: string
    additional_dish: string
    vegetable: string
    sauce: string
    chip: string
    fruit: string
    mineral_water: string
    box: string
    pudding: string
    snack: string
    snack2: string
    snack3: string
    snack4: string
  }
  invoiceData?: {
    documentId?: string | null
    payment_status: string
  }
}

const apiBaseUrl = getStrapiURL()

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseNumber = (value: unknown): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const parseDocumentId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const stringValue = String(value).trim()
  return stringValue.length > 0 ? stringValue : null
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

const normalizeCoordinate = (lat: unknown, lng: unknown): Coordinate => {
  const latitude = Number(lat)
  const longitude = Number(lng)

  return {
    lat: Number.isFinite(latitude) ? latitude : 0,
    lng: Number.isFinite(longitude) ? longitude : 0,
  }
}

const extractRelationDocumentIds = (relation: any): string[] => {
  const data = getRelationData(relation)
  const ids = data
    .map((item: any) => {
      const attrs = getAttributes(item)
      return parseDocumentId(
        item?.documentId ??
        attrs?.documentId ??
        attrs?.document_id
      )
    })
    .filter((id: string | null): id is string => typeof id === 'string')
  return Array.from(new Set(ids))
}

const getLatestInvoiceFromAttributes = (attributes: any) => {
  const invoicesRaw = attributes.invoices?.data ?? attributes.invoices ?? []
  const invoicesArray = Array.isArray(invoicesRaw) ? invoicesRaw : []

  if (invoicesArray.length === 0) {
    return null
  }

  const sorted = [...invoicesArray].sort((a, b) => {
    const aAttrs = getAttributes(a)
    const bAttrs = getAttributes(b)
    const aDate = Date.parse(aAttrs?.invoice_date ?? aAttrs?.createdAt ?? "") || 0
    const bDate = Date.parse(bAttrs?.invoice_date ?? bAttrs?.createdAt ?? "") || 0
    return bDate - aDate
  })

  return sorted[0]
}

export async function fetchOrderForEdit(documentId: string): Promise<OrderForEdit> {
  const identifier = documentId?.trim()

  if (!identifier) {
    throw new Error('Document ID pesanan tidak valid')
  }

  const url = new URL(`/api/orders/${identifier}`, apiBaseUrl)
  url.searchParams.set('populate[customer_id][populate]', '*')
  url.searchParams.set('populate[package_id][populate]', '*')
  url.searchParams.set('populate[order_details][populate]', '*')
  url.searchParams.set('populate[order_menus][populate]', '*')
  url.searchParams.set('populate[staff_driver_id][populate]', '*')
  url.searchParams.set('populate[invoices][populate]', '*')

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data pesanan')
  }

  const result = await response.json()
  const data = result?.data ?? result
  const attributes = getAttributes(data)

  const customerData = getRelationData(attributes.customer_id)
  const customerAttrs = getAttributes(customerData[0])

  const packageData = getRelationData(attributes.package_id)
  const packageAttrs = getAttributes(packageData[0])

  // packageId dari relasi (jika ada), packageName langsung dari field order
  const resolvedPackageId: number | null = parseNumber(packageData[0]?.id ?? packageAttrs?.id) ?? null
  const orderPackageName = toStringValue(attributes.package_name ?? packageAttrs?.package_name ?? '')

  const detailData = getRelationData(attributes.order_details)
  const detailAttrs = getAttributes(detailData[0])

  const menuData = getRelationData(attributes.order_menus)
  const menuAttrs = getAttributes(menuData[0])

  const driverData = getRelationData(attributes.staff_driver_id)
  const driverAttrs = getAttributes(driverData[0])
  const latestInvoice = getLatestInvoiceFromAttributes(attributes)
  const latestInvoiceAttrs = getAttributes(latestInvoice)
  const paymentStatus = toStringValue(latestInvoiceAttrs?.payment_status ?? "unpaid").toLowerCase()
  const normalizedPaymentStatus = paymentStatus === "paid" ? "paid" : "unpaid"

  const deliveryDate =
    attributes.delivery_date ||
    attributes.createdAt ||
    attributes.created_at ||
    new Date().toISOString()

  const coords = normalizeCoordinate(attributes.latitude, attributes.longitude)

  return {
    orderId: parseNumber(data?.id ?? attributes.id),
    orderDetailId: parseNumber(detailData[0]?.id ?? detailAttrs.id),
    orderDetailDocumentId: parseDocumentId(
      detailData[0]?.documentId ??
      detailAttrs.documentId ??
      detailAttrs.document_id
    ),
    orderMenuId: parseNumber(menuData[0]?.id ?? menuAttrs.id),
    orderMenuDocumentId: parseDocumentId(
      menuData[0]?.documentId ??
      menuAttrs.documentId ??
      menuAttrs.document_id
    ),
    orderNo: toStringValue(attributes.order_no ?? attributes.orderNo ?? ''),
    customerId: toStringValue(customerAttrs.id ?? ''),
    customerType: toStringValue(attributes.customer_type ?? customerAttrs.customer_type ?? ''),
    executorTeam: toStringValue(attributes.executor_name ?? ''),
    supplier: toStringValue(attributes.supplier ?? ''),
    product: toStringValue(attributes.product ?? packageAttrs?.product ?? ''),
    packageId: toStringValue(resolvedPackageId ?? ''),
    packageName: toStringValue(orderPackageName),
    qty: toStringValue(detailAttrs.qty ?? ''),
    sellingPrice: toStringValue(detailAttrs.selling_price ?? ''),
    brokerFee: toStringValue(detailAttrs.broker_fee ?? ''),
    priceForKsm: toStringValue(detailAttrs.price_for_ksm ?? detailAttrs.selling_price ?? ''),
    minSellingPrice: toStringValue(detailAttrs.min_selling_price ?? ''),
    amount: toStringValue(detailAttrs.amount ?? ''),
    deliveryCharge: toStringValue(detailAttrs.delivery_charge ?? ''),
    totalAmount: toStringValue(detailAttrs.total_amount ?? ''),
    payment1: toStringValue(detailAttrs.payment1 ?? ''),
    payment2: toStringValue(detailAttrs.payment2 ?? ''),
    payment3: toStringValue(detailAttrs.payment3 ?? ''),
    deliveryNote: toStringValue(attributes.delivery_note ?? ''),
    arriveTime: toStringValue(attributes.arrive_time ?? ''),
    leaveTime: toStringValue(attributes.leave ?? attributes.leave_time ?? attributes.arrive_time ?? ''),
    recipientName: toStringValue(attributes.recipient_name ?? ''),
    recipientPhone: toStringValue(attributes.recipient_phone_no ?? customerAttrs.phone_no ?? ''),
    recipientAddress: toStringValue(attributes.delivery_address ?? customerAttrs.address ?? ''),
    rice: toStringValue(menuAttrs.rice ?? ''),
    mainDish: toStringValue(menuAttrs.main_dish ?? ''),
    mainDish2: toStringValue(menuAttrs.main_dish2 ?? ''),
    mainDish3: toStringValue(menuAttrs.main_dish3 ?? ''),
    additionalDish: toStringValue(menuAttrs.additional_dish ?? ''),
    vegetable: toStringValue(menuAttrs.vegetable ?? ''),
    sauce: toStringValue(menuAttrs.sauce ?? ''),
    chip: toStringValue(menuAttrs.chip ?? ''),
    fruit: toStringValue(menuAttrs.fruit ?? ''),
    mineralWater: toStringValue(menuAttrs.mineral_water ?? ''),
    box: toStringValue(menuAttrs.box ?? ''),
    pudding: toStringValue(menuAttrs.pudding ?? ''),
    snack: toStringValue(menuAttrs.snack ?? ''),
    snack2: toStringValue(menuAttrs.snack2 ?? menuAttrs.snack_2 ?? ''),
    snack3: toStringValue(menuAttrs.snack3 ?? menuAttrs.snack_3 ?? ''),
    snack4: toStringValue(menuAttrs.snack4 ?? menuAttrs.snack_4 ?? ''),
    deliveryDate: toStringValue(deliveryDate),
    staffDriverId: toStringValue(driverData[0]?.id ?? driverAttrs?.id ?? ''),
    invoiceDocumentId: parseDocumentId(
      latestInvoice?.documentId ??
      latestInvoiceAttrs?.documentId ??
      latestInvoiceAttrs?.document_id
    ),
    invoiceId: parseNumber(latestInvoice?.id ?? latestInvoiceAttrs?.id),
    paymentStatus: normalizedPaymentStatus,
    coordinates: coords,
  }
}

const fetchOrderRelations = async (documentId: string) => {
  const url = new URL(`/api/orders/${documentId}`, apiBaseUrl)
  url.searchParams.set('populate[order_details][populate]', '*')
  url.searchParams.set('populate[order_menus][populate]', '*')
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    return {
      orderDetailDocumentIds: [] as string[],
      orderMenuDocumentIds: [] as string[],
    }
  }

  const result = await response.json().catch(() => ({}))
  const data = result?.data ?? result
  const attributes = getAttributes(data)

  return {
    orderDetailDocumentIds: extractRelationDocumentIds(attributes.order_details),
    orderMenuDocumentIds: extractRelationDocumentIds(attributes.order_menus),
  }
}

const upsertRelated = async (
  endpoint: string,
  data: Record<string, any>,
  existingDocumentId?: string | null
) => {
  const doRequest = async (url: URL, method: 'PUT' | 'POST') => {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.error?.message ?? errorData?.message ?? 'Gagal memperbarui relasi pesanan'
      const status = response.status
      return { ok: false, status, message }
    }

    return { ok: true }
  }

  if (existingDocumentId) {
    const putUrl = new URL(`${endpoint}/${existingDocumentId}`, apiBaseUrl)
    const putResult = await doRequest(putUrl, 'PUT')

    if (putResult.ok) return
    if (putResult.status !== 404) {
      throw new Error(putResult.message)
    }
  }

  const postUrl = new URL(endpoint, apiBaseUrl)
  const postResult = await doRequest(postUrl, 'POST')
  if (!postResult.ok) {
    throw new Error(postResult.message)
  }
}

export async function updateOrder(documentId: string, payload: UpdateOrderPayload): Promise<UpdateOrderResult> {
  const identifier = documentId?.trim()

  if (!identifier) {
    return { success: false, error: 'Document ID pesanan tidak valid' }
  }

  try {
    let orderDetailDocumentIds = payload.orderDetailDocumentId ? [payload.orderDetailDocumentId] : []
    let orderMenuDocumentIds = payload.orderMenuDocumentId ? [payload.orderMenuDocumentId] : []

    if (orderDetailDocumentIds.length === 0 || orderMenuDocumentIds.length === 0) {
      const relations = await fetchOrderRelations(identifier)
      if (orderDetailDocumentIds.length === 0) {
        orderDetailDocumentIds = relations.orderDetailDocumentIds
      }
      if (orderMenuDocumentIds.length === 0) {
        orderMenuDocumentIds = relations.orderMenuDocumentIds
      }
    }

    const orderUrl = new URL(`/api/orders/${identifier}`, apiBaseUrl)
    const orderResponse = await fetch(orderUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          ...payload.orderData,
          order_details: orderDetailDocumentIds.length > 0
            ? { connect: orderDetailDocumentIds }
            : undefined,
          order_menus: orderMenuDocumentIds.length > 0
            ? { connect: orderMenuDocumentIds }
            : undefined,
        },
      }),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}))
      const message = errorData?.error?.message ?? errorData?.message ?? 'Gagal memperbarui pesanan'
      return { success: false, error: message }
    }

    await orderResponse.json().catch(() => ({}))

    const orderDetailDocumentId =
      payload.orderDetailDocumentId ?? orderDetailDocumentIds[0] ?? null
    const orderMenuDocumentId =
      payload.orderMenuDocumentId ?? orderMenuDocumentIds[0] ?? null

    if (payload.orderDetailData) {
      const detailPayload: Record<string, unknown> = { ...payload.orderDetailData }
      if (!orderDetailDocumentId) {
        detailPayload.order_id = { connect: [identifier] }
      }
      await upsertRelated('/api/order-details', detailPayload, orderDetailDocumentId)
    }

    if (payload.orderMenuData) {
      const menuPayload: Record<string, unknown> = { ...payload.orderMenuData }
      if (!orderMenuDocumentId) {
        menuPayload.order_id = { connect: [identifier] }
      }
      await upsertRelated('/api/order-menus', menuPayload, orderMenuDocumentId)
    }

    if (payload.invoiceData?.payment_status) {
      const invoiceDocumentId = payload.invoiceData.documentId?.trim() ?? ""
      const invoicePayload = {
        payment_status: payload.invoiceData.payment_status,
      }

      if (invoiceDocumentId) {
        const invoiceUrl = new URL(`/api/invoices/${invoiceDocumentId}`, apiBaseUrl)
        const invoiceResponse = await fetch(invoiceUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: invoicePayload }),
        })

        if (!invoiceResponse.ok) {
          const errorData = await invoiceResponse.json().catch(() => ({}))
          const message =
            errorData?.error?.message ??
            errorData?.message ??
            'Gagal memperbarui status pembayaran'
          return { success: false, error: message }
        }
      } else {
        const createInvoiceUrl = new URL('/api/invoices', apiBaseUrl)
        const createInvoiceResponse = await fetch(createInvoiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              ...invoicePayload,
              invoice_date: new Date().toISOString(),
              orders: { connect: [identifier] },
            },
          }),
        })

        if (!createInvoiceResponse.ok) {
          const errorData = await createInvoiceResponse.json().catch(() => ({}))
          const message =
            errorData?.error?.message ??
            errorData?.message ??
            'Gagal membuat data tagihan'
          return { success: false, error: message }
        }
      }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui pesanan'
    return { success: false, error: message }
  }
}
