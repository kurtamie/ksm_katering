import { getStrapiURL } from '@/lib/utils'
import type { Coordinate } from '@/types/coordinate'

export type CustomerForEdit = {
  id: number | null
  documentId: string | null
  sales_name: string
  gender: string
  name: string
  company_name: string
  phone_no: string
  company: string
  address: string
  coordinates: Coordinate
  staffId: string
}

export type UpdateCustomerPayload = {
  gender: string | null
  name: string | null
  company_name: string | null
  phone_no: string | null
  company: string | null
  address: string | null
  latitude: string | null
  longitude: string | null
  staff_id?: number | null
}

type UpdateCustomerResult = {
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

const getRelationData = (relation: any) => {
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : null
  }

  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return relation.data.length > 0 ? relation.data[0] : null
    }
    return relation.data
  }

  return relation
}

const getAttributes = (item: any) => item?.attributes ?? item ?? {}

const getRelationId = (relation: any): number | null => {
  if (relation === null || relation === undefined) return null
  if (typeof relation === 'string' || typeof relation === 'number') {
    return parseId(relation)
  }
  if (Array.isArray(relation)) {
    return parseId(relation[0]?.id ?? relation[0])
  }
  if (relation?.data) {
    if (Array.isArray(relation.data)) {
      return parseId(relation.data[0]?.id ?? relation.data[0])
    }
    return parseId(relation.data?.id ?? relation.data)
  }
  return parseId(relation?.id ?? relation)
}

const normalizeCoordinate = (lat: unknown, lng: unknown): Coordinate => {
  const latitude = Number(lat)
  const longitude = Number(lng)

  return {
    lat: Number.isFinite(latitude) ? latitude : 0,
    lng: Number.isFinite(longitude) ? longitude : 0,
  }
}

export async function fetchCustomerForEdit(documentId: string): Promise<CustomerForEdit> {
  const identifier = documentId?.trim()

  if (!identifier) {
    throw new Error('Document ID customer tidak valid')
  }

  const url = new URL(`/api/customers/${identifier}`, apiBaseUrl)
  url.searchParams.set('populate[staff_id][populate]', '*')

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data customer')
  }

  const result = await response.json()
  const data = result?.data ?? result
  const attributes = getAttributes(data)

  const staffData = getRelationData(attributes.staff_id)
  const staffId = getRelationId(staffData)

  return {
    id: parseId(data?.id ?? attributes.id),
    documentId: parseDocumentId(
      data?.documentId ??
      attributes?.documentId ??
      attributes?.document_id
    ),
    sales_name: toStringValue(attributes?.sales_name),
    gender: toStringValue(attributes?.gender),
    name: toStringValue(attributes?.name),
    company_name: toStringValue(attributes?.company_name),
    phone_no: toStringValue(attributes?.phone_no ?? attributes?.phoneNo),
    company: toStringValue(attributes?.company),
    address: toStringValue(attributes?.address),
    coordinates: normalizeCoordinate(attributes?.latitude, attributes?.longitude),
    staffId: toStringValue(staffId ?? ''),
  }
}

export async function updateCustomer(documentId: string, payload: UpdateCustomerPayload): Promise<UpdateCustomerResult> {
  const identifier = documentId?.trim()

  if (!identifier) {
    return { success: false, error: 'Document ID customer tidak valid' }
  }

  try {
    const url = new URL(`/api/customers/${identifier}`, apiBaseUrl)
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
      const message = errorData?.error?.message ?? errorData?.message ?? 'Gagal memperbarui customer'
      return { success: false, error: message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui customer'
    return { success: false, error: message }
  }
}
