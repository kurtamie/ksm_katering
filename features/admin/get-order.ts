import { getStrapiURL } from '@/lib/utils'
import { getCurrentUser } from '@/features/admin/create-order'

export type Order = {
  id: number | null
  documentId: string | null
  staff_id: number | null
  staff_document_id?: string | null
  staff_driver_staff_id?: number | null
  staff_driver_document_id?: string | null
  order_no: string
  customer: string
  customer_type: string
  category: string
  package: string
  package_name: string
  driver: string
  staff_driver_id: string
  travel_letter_no: string
  qty: string
  price_ksm: string
  price_send: string
  price_total: string
  amount: string
  payment1: string
  payment2: string
  payment3: string
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
  side_dish2: string
  side_dish3: string
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
  menu_product: string
  latitude: string
  longitude: string
}

const apiBaseUrl = getStrapiURL()
const SALES_POSITION = "sales"
const MARKETING_DEPARTMENT = "marketing"
const DRIVER_POSITION = "driver"
const DELIVERY_DEPARTMENT = "delivery"

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

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

const getRoleFromCookie = () => ({
  position: getCookie("user_position")?.toLowerCase() ?? null,
  department: getCookie("user_department")?.toLowerCase() ?? null,
})

const fetchStaffForUser = async (userId: number) => {
  const url = new URL('/api/staffs', apiBaseUrl)
  url.searchParams.set('filters[user_id][id][$eq]', String(userId))
  url.searchParams.set('pagination[pageSize]', '1')

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    return null
  }

  const result = await response.json()
  const data = Array.isArray(result?.data) ? result.data[0] : result?.data ?? result
  const attributes = getAttributes(data)
  const staffId = parseId(data?.id ?? attributes?.id)
  const staffDocumentId = parseDocumentId(
    data?.documentId ?? attributes?.documentId ?? attributes?.document_id
  )

  if (!staffId && !staffDocumentId) {
    return null
  }

  return { id: staffId, documentId: staffDocumentId }
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
  const staffId = parseId(
    staffData?.id ??
    staffAttrs?.id ??
    staffAttrs?.staff_id ??
    (typeof staffData === "string" || typeof staffData === "number" ? staffData : null) ??
    attributes?.staff_id
  )
  const staffDocumentId = parseDocumentId(
    staffData?.documentId ??
    staffAttrs?.documentId ??
    staffAttrs?.document_id ??
    (typeof staffData === "string" ? staffData : null) ??
    attributes?.staff_document_id ??
    attributes?.staff_documentId
  )

  const rawStaffDriver = attributes?.staff_driver_id
  const rawStaffDriverValue =
    typeof rawStaffDriver === "string" || typeof rawStaffDriver === "number"
      ? rawStaffDriver
      : null
  const staffDriverData = getRelationData(rawStaffDriver)
  const staffDriverAttrs = getAttributes(staffDriverData)
  const staffDriverId = parseId(
    staffDriverData?.id ??
    staffDriverAttrs?.id ??
    staffDriverAttrs?.staff_id ??
    rawStaffDriverValue ??
    attributes?.staff_driver_id
  )
  const staffDriverDocumentId = parseDocumentId(
    staffDriverData?.documentId ??
    staffDriverAttrs?.documentId ??
    staffDriverAttrs?.document_id ??
    (typeof rawStaffDriverValue === "string" ? rawStaffDriverValue : null) ??
    attributes?.staff_driver_document_id ??
    attributes?.staff_driver_documentId
  )

  return {
    id: orderId,
    documentId,
    staff_id: staffId,
    staff_document_id: staffDocumentId,
    staff_driver_staff_id: staffDriverId,
    staff_driver_document_id: staffDriverDocumentId,
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

    travel_letter_no: withFallback(
      attributes.travel_letter_no
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
      packageAttrs?.name ||
      attributes.package_name
    ),

    package_name: withFallback(
      attributes.package_name
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

    staff_driver_id: withFallback(staffDriverAttrs?.name),

    qty: withFallback(detailAttrs?.qty),
    
    price_ksm: withFallback(
      detailAttrs?.price_for_ksm || 
      detailAttrs?.selling_price
    ),
    
    price_send: withFallback(detailAttrs?.delivery_charge),
    
    price_total: withFallback(detailAttrs?.total_amount),

    payment1: withFallback(detailAttrs?.payment1),

    payment2: withFallback(detailAttrs?.payment2),

    payment3: withFallback(detailAttrs?.payment3),

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

    side_dish2: withFallback(menuAttrs?.main_dish2),

    side_dish3: withFallback(menuAttrs?.main_dish3),

    additional_dish: withFallback(menuAttrs?.additional_dish),

    vegetable: withFallback(menuAttrs?.vegetable),

    sauce: withFallback(menuAttrs?.sauce),

    chip: withFallback(menuAttrs?.chip),

    fruit: withFallback(menuAttrs?.fruit),

    mineral_water: withFallback(menuAttrs?.mineral_water),

    box: withFallback(menuAttrs?.box),

    pudding: withFallback(menuAttrs?.pudding),

    snack: withFallback(menuAttrs?.snack),

    snack2: withFallback(menuAttrs?.snack2 ?? menuAttrs?.snack_2),

    snack3: withFallback(menuAttrs?.snack3 ?? menuAttrs?.snack_3),

    snack4: withFallback(menuAttrs?.snack4 ?? menuAttrs?.snack_4),

    menu_product: withFallback(
      menuAttrs?.product ||
      menuAttrs?.product_name ||
      menuAttrs?.productName
    ),

    latitude: withFallback(attributes.latitude),

    longitude: withFallback(attributes.longitude),
    
    createdAt: withFallback(createdDate),
  }
}

type FetchOrdersOptions = {
  position?: string | null
  department?: string | null
  staffId?: number | null
}

export async function fetchOrders(options: FetchOrdersOptions = {}): Promise<Order[]> {
  try {
    const currentUser = typeof window !== "undefined" ? await getCurrentUser() : null
    const roleFromCookie = getRoleFromCookie()
    const position =
      (options.position ??
        currentUser?.staff?.position ??
        roleFromCookie.position)?.toLowerCase() ?? null
    const department =
      (options.department ??
        currentUser?.staff?.department ??
        roleFromCookie.department)?.toLowerCase() ?? null
    const shouldLimitToStaff =
      position === SALES_POSITION && department === MARKETING_DEPARTMENT
    const shouldLimitToDriver =
      position === DRIVER_POSITION && department === DELIVERY_DEPARTMENT
    let staffId = options.staffId ?? currentUser?.staff?.id ?? null
    let staffDocumentId = currentUser?.staff?.documentId ?? null

    if ((shouldLimitToStaff || shouldLimitToDriver) && currentUser?.id && (!staffId || !staffDocumentId)) {
      const staffFromUser = await fetchStaffForUser(currentUser.id)
      staffId = staffId ?? staffFromUser?.id ?? null
      staffDocumentId = staffDocumentId ?? staffFromUser?.documentId ?? null
    }

    if ((shouldLimitToStaff || shouldLimitToDriver) && !staffId && !staffDocumentId) {
      return []
    }

    const fetchOrdersFromApi = async (
      applyStaffFilter: boolean,
      applyDriverFilter: boolean,
      staffFilterMode: "auto" | "id" | "documentId" = "auto"
    ) => {
      const url = new URL('/api/orders', apiBaseUrl)

      url.searchParams.set('populate[customer_id][populate]', '*')
      url.searchParams.set('populate[staff_id][populate]', '*')
      url.searchParams.set('populate[staff_driver_id][populate]', '*')
      url.searchParams.set('populate[package_id][populate]', '*')
      url.searchParams.set('populate[order_details][populate]', '*')
      url.searchParams.set('populate[order_menus][populate]', '*')
      const applyStaff = applyStaffFilter && !applyDriverFilter
      const applyDriver = applyDriverFilter
      if (applyStaff) {
        if ((staffFilterMode === "id" || staffFilterMode === "auto") && staffId) {
          url.searchParams.set('filters[staff_id][id][$eq]', String(staffId))
        } else if ((staffFilterMode === "documentId" || staffFilterMode === "auto") && staffDocumentId) {
          url.searchParams.set('filters[staff_id][documentId][$eq]', staffDocumentId)
        }
      }
      if (applyDriver) {
        if (staffId) {
          url.searchParams.set('filters[staff_driver_id][id][$eq]', String(staffId))
        } else if (staffDocumentId) {
          url.searchParams.set('filters[staff_driver_id][documentId][$eq]', staffDocumentId)
        }
      }

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

      if (result?.data && Array.isArray(result.data)) {
        return result.data
      }
      if (Array.isArray(result)) {
        return result
      }

      console.warn('Unexpected response structure:', result)
      return []
    }

    let orders: any[] = []
    try {
      orders = await fetchOrdersFromApi(shouldLimitToStaff, shouldLimitToDriver)
    } catch (error) {
      if (!shouldLimitToDriver) {
        throw error
      }
      orders = await fetchOrdersFromApi(shouldLimitToStaff, false)
    }

    if (shouldLimitToStaff && orders.length === 0 && staffDocumentId) {
      orders = await fetchOrdersFromApi(shouldLimitToStaff, shouldLimitToDriver, "documentId")
    }

    if (shouldLimitToDriver && orders.length === 0 && staffDocumentId) {
      orders = await fetchOrdersFromApi(shouldLimitToStaff, shouldLimitToDriver, "documentId")
    }

    if (shouldLimitToDriver && orders.length === 0) {
      orders = await fetchOrdersFromApi(shouldLimitToStaff, false)
    }

    // fallback: some orders store driver on staff_id instead of staff_driver_id
    if (shouldLimitToDriver && orders.length === 0) {
      try {
        orders = await fetchOrdersFromApi(true, false)
      } catch (error) {
        orders = await fetchOrdersFromApi(true, false, "documentId")
      }
    }
    
    console.log('Orders before normalize:', orders) 
    
    let normalized = orders.map(normalizeOrder)

    if (shouldLimitToStaff) {
      normalized = normalized.filter((order: any) => {
        if (staffId && order.staff_id === staffId) return true
        if (staffDocumentId && order.staff_document_id === staffDocumentId) return true
        return false
      })
    }
    if (shouldLimitToDriver) {
      normalized = normalized.filter((order: any) => {
        if (staffId && order.staff_driver_staff_id === staffId) return true
        if (staffDocumentId && order.staff_driver_document_id === staffDocumentId) return true
        return false
      })
    }
    
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
  url.searchParams.set('populate[staff_driver_id][populate]', '*')
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
