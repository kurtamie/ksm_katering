import { getStrapiURL } from '@/lib/utils'
import type { DishTypeValue, ServiceValue } from '@/const/admin/dish'

export type UpdateDishPayload = {
  name: string | null
  type: DishTypeValue | string | null
}

type UpdateDishResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

export async function updateDish(documentId: string, payload: UpdateDishPayload): Promise<UpdateDishResult> {
  const identifier = documentId?.trim()

  if (!identifier) {
    return { success: false, error: 'Document ID lauk tidak valid' }
  }

  try {
    const url = new URL(`/api/dishes/${identifier}`, apiBaseUrl)
    const data: Record<string, unknown> = { ...payload }

    Object.keys(data).forEach((key) => {
      if (data[key] === null) {
        delete data[key]
      }
    })

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.error?.message ?? errorData?.message ?? 'Gagal memperbarui menu'
      return { success: false, error: message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui menu'
    return { success: false, error: message }
  }
}
