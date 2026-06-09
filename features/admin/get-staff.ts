import { getStrapiURL } from '@/lib/utils'

export type Staff = {
  id: number | null
  documentId: string | null
  name: string
  department: string
  position: string
  ktp_no: string
  staff_status: string
  user_id: string
  user_numeric_id: number | null
  phone_no: string
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

const normalizeStaff = (item: any): Staff => {
  const attributes = getAttributes(item)
  const staffId = parseId(item?.id ?? attributes?.id)
  const documentId = parseDocumentId(
    item?.documentId ??
    attributes?.documentId ??
    attributes?.document_id
  )
  const createdDate = attributes?.createdAt || attributes?.created_at
  const userData = getRelationData(attributes?.user_id)
  const userAttrs = getAttributes(userData)
  const phoneNumber =
    userAttrs?.phone_no ||
    userAttrs?.phone ||
    userAttrs?.phoneNumber ||
    userAttrs?.phone_number

  return {
    id: staffId,
    documentId,
    name: withFallback(attributes?.name),
    department: withFallback(attributes?.department),
    position: withFallback(attributes?.position),
    ktp_no: withFallback(attributes?.ktp_no || attributes?.ktpNo),
    staff_status: withFallback(attributes?.staff_status || attributes?.staffStatus),
    user_id: withFallback(userAttrs?.username || userAttrs?.email || userAttrs?.id),
    user_numeric_id: parseId(userData?.id ?? userAttrs?.id),
    phone_no: withFallback(phoneNumber),
    createdAt: withFallback(createdDate),
  }
}

export async function fetchStaffs(): Promise<Staff[]> {
  try {
    const url = new URL('/api/staffs', apiBaseUrl)
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

    let staffs = []

    if (result?.data && Array.isArray(result.data)) {
      staffs = result.data
    } else if (Array.isArray(result)) {
      staffs = result
    } else {
      console.warn('Unexpected response structure:', result)
      return []
    }

    return staffs.map(normalizeStaff)
  } catch (error) {
    console.error('Error fetching staffs:', error)
    return []
  }
}

export async function fetchStaffByDocumentId(documentId: string): Promise<Staff | null> {
  const identifier = documentId?.trim()
  if (!identifier) {
    throw new Error('Document ID staff tidak valid')
  }

  const url = new URL(`/api/staffs/${identifier}`, apiBaseUrl)
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

  return normalizeStaff(data)
}
