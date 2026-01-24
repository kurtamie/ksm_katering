import { getStrapiURL } from '@/lib/utils'

export type Customer = {
  id: number | null
  documentId: string | null
  sales_name: string
  gender: string
  name: string
  company_name: string
  phone_no: string
  company: string
  address: string
  latitude: string
  longitude: string
  user_id: string
  createdAt: string
}

const apiBaseUrl = getStrapiURL()

const withFallback = (value: unknown): string => {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string" && value.trim() === "") return "-"
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

const getAttributes = (item: any) => {
  if (!item) return null
  return item.attributes || item
}

const normalizeCustomer = (item: any): Customer => {
  const attributes = getAttributes(item)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const customerId = parseId(item?.id ?? attributes?.id)
  const createdDate = attributes?.createdAt || attributes?.created_at

  const userData = getRelationData(attributes?.user_id)
  const userAttrs = getAttributes(userData)
  const staffData = getRelationData(attributes?.staff_id)
  const staffAttrs = getAttributes(staffData)
  const staffName =
    staffAttrs?.name ||
    staffAttrs?.staff_name ||
    staffAttrs?.staffName ||
    null
  const rawSalesName = attributes?.sales_name

  return {
    id: customerId,
    documentId,
    sales_name: withFallback(rawSalesName ?? staffName),
    gender: withFallback(attributes?.gender),
    name: withFallback(attributes?.name),
    company_name: withFallback(attributes?.company_name),
    phone_no: withFallback(attributes?.phone_no || attributes?.phoneNo),
    company: withFallback(attributes?.company),
    address: withFallback(attributes?.address),
    latitude: withFallback(attributes?.latitude),
    longitude: withFallback(attributes?.longitude),
    user_id: withFallback(userAttrs?.username || userAttrs?.email || userAttrs?.id),
    createdAt: withFallback(createdDate),
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const url = new URL('/api/customers', apiBaseUrl)
    url.searchParams.set('populate[user_id][populate]', '*')
    url.searchParams.set('populate[staff_id][populate]', '*')

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

    let customers = []

    if (result?.data && Array.isArray(result.data)) {
      customers = result.data
    } else if (Array.isArray(result)) {
      customers = result
    } else {
      console.warn('Unexpected response structure:', result)
      return []
    }

    return customers.map(normalizeCustomer)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export async function fetchCustomerByDocumentId(documentId: string): Promise<Customer | null> {
  const identifier = documentId?.trim()
  if (!identifier) {
    throw new Error('Document ID customer tidak valid')
  }

  const url = new URL(`/api/customers/${identifier}`, apiBaseUrl)
  url.searchParams.set('populate[user_id][populate]', '*')

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

  return normalizeCustomer(data)
}
