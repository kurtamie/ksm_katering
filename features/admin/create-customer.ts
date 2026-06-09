import { getStrapiURL } from '@/lib/utils'

type CustomerPayload = {
  gender: string | null
  name: string | null
  company_name: string | null
  phone_no: string | null
  company: string | null
  address: string | null
  latitude: string | null
  longitude: string | null
  staff_id?: number | null
  user_id: number | null
  orders: number[] | null
}

type CustomerResult = {
  success: boolean
  error?: string
  customer?: {
    id: number
    name: string
    phone_no: string
    staff_id?: number | null
    staff_document_id?: string | null
  }
}

const apiBaseUrl = getStrapiURL()

export async function createCustomer(payload: CustomerPayload): Promise<CustomerResult> {
  try {
    const url = new URL('/api/customers', apiBaseUrl)
    const data: Record<string, unknown> = { ...payload }

    if (data.sales_name !== undefined) {
      delete data.sales_name
    }
    if (data.user_id === null) {
      delete data.user_id
    }
    if (data.staff_id === null) {
      delete data.staff_id
    }
    if (data.orders === null) {
      delete data.orders
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Customer creation error:', errorData)
      throw new Error(errorData?.error?.message || 'Gagal membuat customer')
    }

    const result = await response.json().catch(() => null)
    const item = result?.data ?? result
    const attributes = item?.attributes ?? item

    return {
      success: true,
      customer: item?.id
        ? {
            id: item.id,
            name: attributes?.name ?? '',
            phone_no: attributes?.phone_no ?? '',
            staff_id: payload.staff_id ?? null,
          }
        : undefined,
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan',
    }
  }
}
