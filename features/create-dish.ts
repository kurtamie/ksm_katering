import { getStrapiURL } from '@/lib/utils'
import type { DishTypeValue } from '@/app/admin/dish/dish-constants'

type DishPayload = {
  name: string | null
  type: DishTypeValue | string | null
}

type DishResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

export async function createDish(payload: DishPayload): Promise<DishResult> {
  try {
    const url = new URL('/api/dishes', apiBaseUrl)
    const data: Record<string, unknown> = { ...payload }

    Object.keys(data).forEach((key) => {
      if (data[key] === null) {
        delete data[key]
      }
    })

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
      console.error('Dish creation error:', errorData)
      throw new Error(errorData?.error?.message || 'Gagal membuat lauk')
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating dish:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan',
    }
  }
}
