import { getStrapiURL } from '@/lib/utils'
import type { DishTypeValue } from '@/app/admin/dish/dish-constants'

export type DishItem = {
  id: number | null
  documentId: string | null
  name: string
  type: DishTypeValue | string
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

const normalizeDish = (item: any): DishItem => {
  const attributes = getAttributes(item)
  const dishId = parseId(item?.id ?? attributes?.id)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes?.createdAt || attributes?.created_at

  return {
    id: dishId,
    documentId,
    name: withFallback(attributes?.name),
    type: withFallback(attributes?.type),
    createdAt: withFallback(createdDate),
  }
}

const normalizeDishForForm = (item: any): DishItem => {
  const attributes = getAttributes(item)
  const dishId = parseId(item?.id ?? attributes?.id)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes?.createdAt || attributes?.created_at

  return {
    id: dishId,
    documentId,
    name: toStringValue(attributes?.name),
    type: toStringValue(attributes?.type),
    createdAt: toStringValue(createdDate),
  }
}

export async function fetchDishes(): Promise<DishItem[]> {
  try {
    const url = new URL('/api/dishes', apiBaseUrl)
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

    let dishes = []

    if (result?.data && Array.isArray(result.data)) {
      dishes = result.data
    } else if (Array.isArray(result)) {
      dishes = result
    } else {
      console.warn('Unexpected response structure:', result)
      return []
    }

    return dishes.map(normalizeDish)
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return []
  }
}

export async function fetchDishByDocumentId(documentId: string): Promise<DishItem | null> {
  const identifier = documentId?.trim()
  if (!identifier) {
    throw new Error('Document ID lauk tidak valid')
  }

  const url = new URL(`/api/dishes/${identifier}`, apiBaseUrl)
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

  return normalizeDishForForm(data)
}
