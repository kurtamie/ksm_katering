import { getStrapiURL } from '@/lib/utils'

export type MenuPackage = {
  id: number | null
  documentId: string | null
  package_name: string
  subname: string
  description: string
  image_url: string
  price: string
  product: string
  createdAt: string
}

const apiBaseUrl = getStrapiURL()

const withFallback = (value: unknown): string => {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string" && value.trim() === "") return "-"
  return String(value)
}

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return ""
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

const getAttributes = (item: any) => {
  if (!item) return null
  return item.attributes || item
}

const normalizeMenu = (item: any): MenuPackage => {
  const attributes = getAttributes(item)
  const menuId = parseId(item?.id ?? attributes?.id)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes?.createdAt || attributes?.created_at

  return {
    id: menuId,
    documentId,
    package_name: withFallback(attributes?.package_name),
    subname: withFallback(attributes?.subname),
    description: withFallback(attributes?.description),
    image_url: withFallback(attributes?.image_url),
    price: withFallback(attributes?.price),
    product: withFallback(attributes?.product),
    createdAt: withFallback(createdDate),
  }
}

const normalizeMenuForForm = (item: any): MenuPackage => {
  const attributes = getAttributes(item)
  const menuId = parseId(item?.id ?? attributes?.id)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes?.createdAt || attributes?.created_at

  return {
    id: menuId,
    documentId,
    package_name: toStringValue(attributes?.package_name),
    subname: toStringValue(attributes?.subname),
    description: toStringValue(attributes?.description),
    image_url: toStringValue(attributes?.image_url),
    price: toStringValue(attributes?.price),
    product: toStringValue(attributes?.product),
    createdAt: toStringValue(createdDate),
  }
}

export async function fetchMenus(): Promise<MenuPackage[]> {
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

    const result = await response.json()

    let menus = []

    if (result?.data && Array.isArray(result.data)) {
      menus = result.data
    } else if (Array.isArray(result)) {
      menus = result
    } else {
      console.warn('Unexpected response structure:', result)
      return []
    }

    return menus.map(normalizeMenu)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return []
  }
}

export async function fetchMenuByDocumentId(documentId: string): Promise<MenuPackage | null> {
  const identifier = documentId?.trim()
  if (!identifier) {
    throw new Error('Document ID paket tidak valid')
  }

  const url = new URL(`/api/packages/${identifier}`, apiBaseUrl)
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

  return normalizeMenuForForm(data)
}
