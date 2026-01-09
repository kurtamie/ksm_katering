import { getStrapiURL } from '@/lib/utils'

export type Order = {
  id: number | null
  documentId: string | null
  order_no: string
  customer: string
  customer_type: string
  category: string
  package: string
  driver: string
  qty: string
  price_ksm: string
  price_send: string
  price_total: string
  amount: string
  createdAt: string
  phone: string
  product_category: string
  product_package: string
  total_qty: string
  address: string
  order_date: string
  delivery_status: string
  delivery_time: string
  note: string
  rice_type: string
  side_dish: string
  additional_dish: string
  vegetable: string
  sauce: string
  chip: string
  fruit: string
  mineral_water: string
  box: string
  pudding: string
  snack: string
}

const apiBaseUrl = getStrapiURL()

const withFallback = (value: unknown): string => {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string" && value.trim() === "") return "-"
  return String(value)
}

const parseId = (value: unknown): number | null => {
  const numeric = typeof value === "string" ? Number(value) : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const parseDocumentId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const stringValue = String(value).trim()
  return stringValue.length > 0 ? stringValue : null
}

const getRelationData = (relation: any) => {
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : null
  }
  
  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return relation.data.length > 0 ? relation.data[0] : null
    }
    return relation.data
  }
  
  return relation
}

const getAttributes = (item: any) => {
  if (!item) return null
  return item.attributes || item
}

const normalizeOrder = (item: any): Order => {
  const attributes = getAttributes(item)
  const orderId = parseId(item?.id ?? attributes?.id ?? attributes?.order_no ?? attributes?.orderNo)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes.delivery_date || attributes.createdAt || attributes.created_at
  
  const customerData = getRelationData(attributes.customer_id)
  const customerAttrs = getAttributes(customerData)
  
  const detailData = getRelationData(attributes.order_details)
  const detailAttrs = getAttributes(detailData)
  
  const menuData = getRelationData(attributes.order_menus)
  const menuAttrs = getAttributes(menuData)
  
  const packageData = getRelationData(attributes.package_id)
  const packageAttrs = getAttributes(packageData)
  
  const staffData = getRelationData(attributes.staff_id)
  const staffAttrs = getAttributes(staffData)

  return {
    id: orderId,
    documentId,
    order_no: withFallback(
      attributes.order_no ||
      attributes.orderNo ||
      item?.order_no ||
      item?.orderNo ||
      item?.id
    ),
    
    customer: withFallback(
      customerAttrs?.name || 
      customerAttrs?.customer_name || 
      customerAttrs?.id
    ),
    
    customer_type: withFallback(
      attributes.customer_type || 
      customerAttrs?.customer_type ||
      customerAttrs?.type
    ),
    
    phone: withFallback(
      attributes.recipient_phone_no ||
      customerAttrs?.phone_no || 
      customerAttrs?.phone
    ),
    
    category: withFallback(
      attributes.product || 
      packageAttrs?.product_category ||
      packageAttrs?.category
    ),
    
    package: withFallback(
      packageAttrs?.package_name || 
      packageAttrs?.name
    ),
    
    product_category: withFallback(
      attributes.product ||
      packageAttrs?.product_category
    ),
    
    product_package: withFallback(
      packageAttrs?.package_name || 
      packageAttrs?.name
    ),
    
    driver: withFallback(
      attributes.driver ||
      attributes.executor_name ||
      staffAttrs?.name ||
      staffAttrs?.staff_name
    ),
    
    qty: withFallback(detailAttrs?.qty),
    
    price_ksm: withFallback(
      detailAttrs?.price_for_ksm || 
      detailAttrs?.selling_price
    ),
    
    price_send: withFallback(detailAttrs?.delivery_charge),
    
    price_total: withFallback(detailAttrs?.total_amount),
    
    amount: withFallback(
      detailAttrs?.amount || 
      detailAttrs?.total_amount
    ),
    
    total_qty: withFallback(detailAttrs?.qty),
    
    // Delivery info
    address: withFallback(
      attributes.delivery_address ||
      customerAttrs?.address
    ),
    
    order_date: withFallback(
      attributes.delivery_date || 
      attributes.createdAt
    ).split('T')[0],
    
    delivery_status: withFallback(attributes.step),
    
    delivery_time: withFallback(attributes.arrive_time),
    
    note: withFallback(attributes.delivery_note),
    
    rice_type: withFallback(menuAttrs?.rice),
    
    side_dish: withFallback(menuAttrs?.main_dish),

    additional_dish: withFallback(menuAttrs?.additional_dish),

    vegetable: withFallback(menuAttrs?.vegetable),

    sauce: withFallback(menuAttrs?.sauce),

    chip: withFallback(menuAttrs?.chip),

    fruit: withFallback(menuAttrs?.fruit),

    mineral_water: withFallback(menuAttrs?.mineral_water),

    box: withFallback(menuAttrs?.box),

    pudding: withFallback(menuAttrs?.pudding),

    snack: withFallback(menuAttrs?.snack),
    
    createdAt: withFallback(createdDate),
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const url = new URL('/api/orders', apiBaseUrl)
    
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('API Response:', result) 
    
    let orders = []
    
    if (result?.data && Array.isArray(result.data)) {
      orders = result.data
    } else if (Array.isArray(result)) {
      orders = result
    } else {
      console.warn('Unexpected response structure:', result)
      return []
    }
    
    console.log('Orders before normalize:', orders) 
    
    const normalized = orders.map(normalizeOrder)
    
    console.log('Normalized orders:', normalized) 
    
    return normalized
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function fetchOrderByDocumentId(documentId: string): Promise<Order | null> {
  const identifier = documentId?.trim()
  if (!identifier) {
    throw new Error('Document ID pesanan tidak valid')
  }

  const url = new URL(`/api/orders/${identifier}`, apiBaseUrl)
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
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  const data = result?.data ?? result

  if (!data) {
    return null
  }

  return normalizeOrder(data)
}
