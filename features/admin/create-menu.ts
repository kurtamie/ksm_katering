import { getStrapiURL } from '@/lib/utils'

type MenuPayload = {
  package_name: string | null
  subname: string | null
  description: string | null
  image_url: string | null
  price: string | null
  product: string | null
}

type MenuResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

export async function createMenu(payload: MenuPayload): Promise<MenuResult> {
  try {
    const url = new URL('/api/packages', apiBaseUrl)
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
      console.error('Package creation error:', errorData)
      throw new Error(errorData?.error?.message || 'Gagal membuat paket')
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating package:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan',
    }
  }
}
