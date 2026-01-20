import { getStrapiURL } from '@/lib/utils'

export type MenuForEdit = {
  id: number | null
  documentId: string | null
  package_name: string
  subname: string
  description: string
  image_url: string
  price: string
  product: string
}

export type UpdateMenuPayload = {
  package_name: string | null
  subname: string | null
  description: string | null
  image_url: string | null
  price: string | null
  product: string | null
}

type UpdateMenuResult = {
  success: boolean
  error?: string
}

const apiBaseUrl = getStrapiURL()

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseId = (value: unknown): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const parseDocumentId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const stringValue = String(value).trim()
  return stringValue.length > 0 ? stringValue : null
}

const getAttributes = (item: any) => item?.attributes ?? item ?? {}

export async function fetchMenuForEdit(documentId: string): Promise<MenuForEdit> {
  const identifier = documentId?.trim()

  if (!identifier) {
    throw new Error('Document ID paket tidak valid')
  }

  const url = new URL(`/api/packages/${identifier}`, apiBaseUrl)
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data paket')
  }

  const result = await response.json()
  const data = result?.data ?? result
  const attributes = getAttributes(data)

  return {
    id: parseId(data?.id ?? attributes.id),
    documentId: parseDocumentId(
      data?.documentId ??
      attributes?.documentId ??
      attributes?.document_id
    ),
    package_name: toStringValue(attributes?.package_name),
    subname: toStringValue(attributes?.subname),
    description: toStringValue(attributes?.description),
    image_url: toStringValue(attributes?.image_url),
    price: toStringValue(attributes?.price),
    product: toStringValue(attributes?.product),
  }
}

export async function updateMenu(documentId: string, payload: UpdateMenuPayload): Promise<UpdateMenuResult> {
  const identifier = documentId?.trim()

  if (!identifier) {
    return { success: false, error: 'Document ID paket tidak valid' }
  }

  try {
    const url = new URL(`/api/packages/${identifier}`, apiBaseUrl)
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
      const message = errorData?.error?.message ?? errorData?.message ?? 'Gagal memperbarui paket'
      return { success: false, error: message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui paket'
    return { success: false, error: message }
  }
}
