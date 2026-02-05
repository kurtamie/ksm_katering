import { getStrapiURL } from '@/lib/utils'

type CustomerOption = {
  id: number
  name: string
  phone_no: string
  staff_id?: number | null
  staff_document_id?: string | null
}

type PackageOption = {
  id: number
  package_name: string
  product?: string
  price?: string
}

type OrderPayload = {
  orderData: {
    order_no: string
    travel_letter_no: string
    created_date: string
    customer_id: number
    customer_type: string
    executor_name: string
    supplier: string
    product: string
    package_id: number[]
    recipient_name: string
    recipient_phone_no: string
    delivery_note: string
    delivery_date: string
    arrive_time: string
    leave: string
    delivery_address: string
    latitude: string
    longitude: string
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
}

type OrderResult = {
  success: boolean
  error?: string
}

type CurrentUser = {
  id: number
  username: string
  email: string
  staff?: {
    id: number | null
    documentId?: string
    position?: string
    department?: string
  }
}

const padOrderNumber = (value: number) => value.toString().padStart(4, '0')

const getNextOrderNumber = (current?: string): string => {
  const numeric = parseInt(current ?? '', 10)
  if (Number.isNaN(numeric)) {
    return padOrderNumber(1)
  }
  return padOrderNumber(numeric + 1)
}

const apiBaseUrl = getStrapiURL()

const parseId = (value: unknown): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const parseDocumentId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const stringValue = String(value).trim()
  return stringValue.length > 0 ? stringValue : null
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

const getCurrentUserFromCookie = (): CurrentUser | null => {
  const userIdRaw = getCookie('userId')
  if (!userIdRaw || userIdRaw.trim() === '') return null
  const userId = parseId(userIdRaw)
  if (!userId) return null

  const username = getCookie('user_name') ?? ''
  const email = getCookie('user_email') ?? ''
  const position = getCookie('user_position')?.toLowerCase()
  const department = getCookie('user_department')?.toLowerCase()
  const staffIdRaw = getCookie('user_staff_id')
  const staffDocumentIdRaw = getCookie('user_staff_document_id')
  const staffId =
    staffIdRaw && staffIdRaw.trim() !== '' ? parseId(staffIdRaw) : null
  const staffDocumentId =
    staffDocumentIdRaw && staffDocumentIdRaw.trim() !== ''
      ? parseDocumentId(staffDocumentIdRaw)
      : null
  const isStaffRequired =
    (position === 'sales' && department === 'marketing') ||
    (position === 'driver' && department === 'delivery')

  if (isStaffRequired && !staffId && !staffDocumentId) {
    return null
  }

  const user: CurrentUser = {
    id: userId,
    username,
    email,
  }

  if (staffId || staffDocumentId || position || department) {
    user.staff = {
      id: staffId ?? null,
      documentId: staffDocumentId ?? undefined,
      position,
      department,
    }
  }

  return user
}

const getRelationId = (relation: any): number | null => {
  if (relation === null || relation === undefined) return null
  if (typeof relation === 'string' || typeof relation === 'number') {
    return parseId(relation)
  }
  if (Array.isArray(relation)) {
    return parseId(relation[0]?.id ?? relation[0])
  }
  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return parseId(relation.data[0]?.id ?? relation.data[0])
    }
    return parseId(relation.data?.id ?? relation.data)
  }
  return parseId(relation?.id ?? relation)
}

const getRelationDocumentId = (relation: any): string | null => {
  if (relation === null || relation === undefined) return null
  if (typeof relation === 'string' || typeof relation === 'number') {
    return parseDocumentId(relation)
  }
  if (Array.isArray(relation)) {
    return parseDocumentId(relation[0]?.documentId ?? relation[0]?.document_id ?? relation[0])
  }
  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return parseDocumentId(
        relation.data[0]?.documentId ?? relation.data[0]?.document_id ?? relation.data[0]
      )
    }
    return parseDocumentId(relation.data?.documentId ?? relation.data?.document_id ?? relation.data)
  }
  return parseDocumentId(relation?.documentId ?? relation?.document_id ?? relation)
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieUser = getCurrentUserFromCookie()
    if (cookieUser) {
      return cookieUser
    }

    const url = new URL('/api/users/me', window.location.origin)
    url.searchParams.set('populate', 'staff')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json() as any

    const user: CurrentUser = {
      id: data.id,
      username: data.username,
      email: data.email,
    }

    if (data.staff) {
      const staffData = data.staff.data ?? data.staff
      const staffAttributes = staffData?.attributes ?? staffData
      user.staff = {
        id: staffData?.id ?? data.staff.id ?? data.staff.data?.id ?? null,
        documentId:
          typeof staffAttributes?.documentId === 'string'
            ? staffAttributes.documentId
            : typeof staffAttributes?.document_id === 'string'
              ? staffAttributes.document_id
              : undefined,
        position:
          typeof staffAttributes?.position === 'string'
            ? staffAttributes.position.toLowerCase()
            : undefined,
        department:
          typeof staffAttributes?.department === 'string'
            ? staffAttributes.department.toLowerCase()
            : undefined,
      }
    }

    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function fetchCustomers(): Promise<CustomerOption[]> {
  try {
    const url = new URL('/api/customers', apiBaseUrl)
    url.searchParams.set('populate[staff_id][populate]', '*')
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json() as any

    if (Array.isArray(data?.customers)) {
      return data.customers.map((item: any) => ({
        id: item.id,
        name: item.name ?? item.attributes?.name ?? '',
        phone_no: item.phone_no ?? item.attributes?.phone_no ?? '',
        staff_id: getRelationId(
          item.staff_id ??
            item.staff ??
            item.attributes?.staff_id ??
            item.attributes?.staff
        ),
        staff_document_id: getRelationDocumentId(
          item.staff_id ??
            item.staff ??
            item.attributes?.staff_id ??
            item.attributes?.staff
        ),
      }))
    }

    if (Array.isArray(data?.data)) {
      return data.data.map((item: any) => {
        const attributes = item.attributes ?? item
        const staffRelation =
          attributes?.staff_id ??
          attributes?.staff ??
          item.staff_id ??
          item.staff
        return {
          id: item.id,
          name: attributes?.name ?? item.name ?? '',
          phone_no: attributes?.phone_no ?? item.phone_no ?? '',
          staff_id: getRelationId(staffRelation),
          staff_document_id: getRelationDocumentId(staffRelation),
        }
      })
    }

    return Array.isArray(data)
      ? data.map((item: any) => ({
        id: item.id,
        name: item.name ?? item.attributes?.name ?? '',
        phone_no: item.phone_no ?? item.attributes?.phone_no ?? '',
        staff_id: getRelationId(
          item.staff_id ??
            item.staff ??
            item.attributes?.staff_id ??
            item.attributes?.staff
        ),
        staff_document_id: getRelationDocumentId(
          item.staff_id ??
            item.staff ??
            item.attributes?.staff_id ??
            item.attributes?.staff
        ),
      }))
      : []
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Gagal mengambil data customer')
  }
}

export async function fetchPackages(): Promise<PackageOption[]> {
  try {
    const url = new URL('/api/packages', apiBaseUrl)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json() as any

  const normalizePackage = (item: any): PackageOption => ({
    id: item.id,
    package_name: item.package_name ?? item.attributes?.package_name ?? '',
    product: item.product ?? item.attributes?.product ?? item.product_name ?? item.attributes?.product_name ?? '',
    price: item.price ?? item.attributes?.price ?? '',
  })

    if (Array.isArray(data?.packages)) {
      return data.packages.map(normalizePackage)
    }

    if (Array.isArray(data?.data)) {
      return data.data.map(normalizePackage)
    }

    return Array.isArray(data) ? data.map(normalizePackage) : []
  } catch (error) {
    console.error('Error fetching packages:', error)
    throw new Error('Gagal mengambil data paket')
  }
}

export async function fetchNextOrderNumber(): Promise<string> {
  try {
    const url = new URL('/api/orders', apiBaseUrl)
    url.searchParams.set('pagination[pageSize]', '1')
    url.searchParams.set('sort[0]', 'order_no:desc')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json() as any

    const getItem = () => {
      if (Array.isArray(data?.data) && data.data.length > 0) return data.data[0]
      if (Array.isArray(data?.orders) && data.orders.length > 0) return data.orders[0]
      if (Array.isArray(data) && data.length > 0) return data[0]
      return null
    }

    const firstItem = getItem()
    const attributes = firstItem?.attributes ?? firstItem
    const lastOrderNo = attributes?.order_no ?? attributes?.orderNo ?? ''

    return getNextOrderNumber(lastOrderNo)
  } catch (error) {
    console.error('Error fetching next order number:', error)
    throw new Error('Gagal mengambil nomor order berikutnya')
  }
}

export async function fetchNextTravelLetterNumber(): Promise<string> {
  try {
    const url = new URL('/api/orders', apiBaseUrl)
    url.searchParams.set('pagination[pageSize]', '1')
    url.searchParams.set('sort[0]', 'travel_letter_no:desc')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json() as any

    const getItem = () => {
      if (Array.isArray(data?.data) && data.data.length > 0) return data.data[0]
      if (Array.isArray(data?.orders) && data.orders.length > 0) return data.orders[0]
      if (Array.isArray(data) && data.length > 0) return data[0]
      return null
    }

    const firstItem = getItem()
    const attributes = firstItem?.attributes ?? firstItem
    const lastTravelLetterNo =
      attributes?.travel_letter_no ?? attributes?.travelLetterNo ?? ''

    return getNextOrderNumber(lastTravelLetterNo)
  } catch (error) {
    console.error('Error fetching next travel letter number:', error)
    throw new Error('Gagal mengambil nomor surat jalan berikutnya')
  }
}

export async function createOrder(
  payload: OrderPayload,
  options?: { staffId?: number | null }
): Promise<OrderResult> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Tidak dapat mengidentifikasi user. Silakan login kembali.',
      }
    }

    const staffId = options?.staffId ?? currentUser.staff?.id

    if (!staffId) {
      return {
        success: false,
        error: 'User tidak memiliki data staff. Hanya staff yang dapat membuat order.',
      }
    }

    const url = new URL('/api/orders', apiBaseUrl)
    
    const strapiPayload = {
      data: {
        ...payload.orderData,
        staff_id: staffId, 
        order_details: undefined,
        order_menus: undefined,
      }
    }

    const orderResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(strapiPayload),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('Order creation error:', errorData)
      throw new Error(errorData.error?.message || 'Gagal membuat pesanan')
    }

    const orderResult = await orderResponse.json()
    const orderId = orderResult.data.id

    const detailUrl = new URL('/api/order-details', apiBaseUrl)
    const detailResponse = await fetch(detailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...payload.orderDetailData,
          order_id: [orderId] 
        }
      }),
    })

    if (!detailResponse.ok) {
      console.error('Failed to create order detail')
    }

    const menuUrl = new URL('/api/order-menus', apiBaseUrl)
    const menuResponse = await fetch(menuUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...payload.orderMenuData,
          order_id: [orderId] 
        }
      }),
    })

    if (!menuResponse.ok) {
      console.error('Failed to create order menu')
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan',
    }
  }
}
