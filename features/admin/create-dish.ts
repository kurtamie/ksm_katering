import { getStrapiURL } from '@/lib/utils'
import type { DishTypeValue, ServiceValue } from '@/const/admin/dish'

type DishPayload = {
  name: string | null
  type: DishTypeValue | string | null
  service: ServiceValue | string | null
}

type DishResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

export async function createDish(payload: DishPayload): Promise<DishResult> {
  try {
    const normalizedName = payload.name?.trim() ?? ''
    const normalizedType = payload.type?.toString().trim() ?? ''
        const normalizedService = payload.service?.toString().trim() ?? ''

    if (!normalizedName || !normalizedType) {
      throw new Error('Nama lauk dan jenis, dan layanan wajib diisi')
    }

    const existingDishUrl = new URL('/api/dishes', apiBaseUrl)
    existingDishUrl.searchParams.set('filters[name][$eqi]', normalizedName)
    existingDishUrl.searchParams.set('filters[type][$eq]', normalizedType)
    existingDishUrl.searchParams.set('filters[service][$eq]', normalizedService)
    existingDishUrl.searchParams.set('pagination[page]', '1')
    existingDishUrl.searchParams.set('pagination[pageSize]', '1')

    const existingDishResponse = await fetch(existingDishUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!existingDishResponse.ok) {
      throw new Error('Gagal memverifikasi data menu yang ada')
    }

    const existingDishResult = await existingDishResponse.json().catch(() => ({}))
    const existingRows = Array.isArray(existingDishResult?.data) ? existingDishResult.data : []
    if (existingRows.length > 0) {
      return {
        success: false,
        error: 'Nama menu sudah ada pada kategori dan layanan yang sama',
      }
    }

    const url = new URL('/api/dishes', apiBaseUrl)
    const data: Record<string, unknown> = {
      ...payload,
      name: normalizedName,
      type: normalizedType,
      service: normalizedService,
    }

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
      throw new Error(errorData?.error?.message || 'Gagal membuat menu')
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
