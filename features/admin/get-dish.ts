import { getStrapiURL } from '@/lib/utils'
import { DishItem, FetchDishesParams, FetchDishesResult } from '@/types/admin/dish'

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
    service: withFallback(attributes?.service),
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
    service: toStringValue(attributes?.service),
    createdAt: toStringValue(createdDate),
  }
}

export async function fetchDishes(params: FetchDishesParams = {}): Promise<FetchDishesResult> {
  try {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.max(1, params.pageSize ?? 25)
    const type = params.type?.trim()

    const url = new URL('/api/dishes', apiBaseUrl)
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', String(pageSize))
    if (type && type !== "all") {
      url.searchParams.set('filters[type][$eq]', type)
    }

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
    const rows = Array.isArray(result?.data) ? result.data : []
    const pagination = result?.meta?.pagination

    return {
      data: rows.map(normalizeDish),
      pagination: {
        page: Number(pagination?.page ?? page),
        pageSize: Number(pagination?.pageSize ?? pageSize),
        pageCount: Number(pagination?.pageCount ?? 1),
        total: Number(pagination?.total ?? rows.length),
      },
    }
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return {
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: 0,
      },
    }
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
