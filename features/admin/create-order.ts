import { getStrapiURL } from '@/lib/utils'

type CustomerOption = {
  id: number
  name: string
  phone_no: string
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
    driver: string
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
    id: number
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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
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
        id: staffData?.id ?? data.staff.id ?? data.staff.data?.id,
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
      return data.customers
    }

    if (Array.isArray(data?.data)) {
      return data.data.map((item: any) => ({
        id: item.id,
        name: item.attributes?.name ?? item.name ?? '',
        phone_no: item.attributes?.phone_no ?? item.phone_no ?? '',
      }))
    }

    return Array.isArray(data) ? data : []
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

export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Tidak dapat mengidentifikasi user. Silakan login kembali.',
      }
    }

    const staffId = currentUser.staff?.id

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
