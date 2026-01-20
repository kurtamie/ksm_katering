import { getStrapiURL } from '@/lib/utils'

type CustomerPayload = {
  sales_name: string | null
  gender: string | null
  name: string | null
  company_name: string | null
  phone_no: string | null
  company: string | null
  address: string | null
  latitude: string | null
  longitude: string | null
  user_id: number | null
  orders: number[] | null
}

type CustomerResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

export async function createCustomer(payload: CustomerPayload): Promise<CustomerResult> {
  try {
    const url = new URL('/api/customers', apiBaseUrl)
    const data: Record<string, unknown> = { ...payload }

    if (data.user_id === null) {
      delete data.user_id
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

    return { success: true }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan',
    }
  }
}
