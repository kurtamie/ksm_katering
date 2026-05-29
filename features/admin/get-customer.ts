import { getStrapiURL } from '@/lib/utils'
import { getCurrentUser } from '@/features/admin/create-order'

export type Customer = {
  id: number | null
  documentId: string | null
  staff_id?: number | null
  staff_document_id?: string | null
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
const SALES_POSITION = "sales"
const MARKETING_DEPARTMENT = "marketing"

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

const fetchStaffForUser = async (userId: number) => {
  const url = new URL('/api/staffs', apiBaseUrl)
  url.searchParams.set('filters[user_id][id][$eq]', String(userId))
  url.searchParams.set('pagination[pageSize]', '1')

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    return null
  }

  const result = await response.json()
  const data = Array.isArray(result?.data) ? result.data[0] : result?.data ?? result
  const attributes = getAttributes(data)
  const staffId = parseId(data?.id ?? attributes?.id)
  const staffDocumentId = parseDocumentId(
    data?.documentId ?? attributes?.documentId ?? attributes?.document_id
  )

  if (!staffId && !staffDocumentId) {
    return null
  }

  return { id: staffId, documentId: staffDocumentId }
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
  const staffId = parseId(
    staffData?.id ??
    staffAttrs?.id ??
    staffAttrs?.staff_id ??
    attributes?.staff_id
  )
  const staffDocumentId = parseDocumentId(
    staffData?.documentId ??
    staffAttrs?.documentId ??
    staffAttrs?.document_id ??
    attributes?.staff_document_id
  )
  const staffName =
    staffAttrs?.name ||
    staffAttrs?.staff_name ||
    staffAttrs?.staffName ||
    null
  const rawSalesName = attributes?.sales_name

  return {
    id: customerId,
    documentId,
    staff_id: staffId,
    staff_document_id: staffDocumentId,
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
    const currentUser = typeof window !== "undefined" ? await getCurrentUser() : null
    const position = currentUser?.staff?.position?.toLowerCase() ?? null
    const department = currentUser?.staff?.department?.toLowerCase() ?? null
    const shouldLimitToStaff =
      position === SALES_POSITION && department === MARKETING_DEPARTMENT
    let staffId = currentUser?.staff?.id ?? null
    let staffDocumentId = currentUser?.staff?.documentId ?? null

    if (shouldLimitToStaff && currentUser?.id && (!staffId || !staffDocumentId)) {
      const staffFromUser = await fetchStaffForUser(currentUser.id)
      staffId = staffId ?? staffFromUser?.id ?? null
      staffDocumentId = staffDocumentId ?? staffFromUser?.documentId ?? null
    }

    if (shouldLimitToStaff && !staffId && !staffDocumentId) {
      return []
    }

    const fetchCustomersFromApi = async (
      staffFilterMode: "auto" | "id" | "documentId" = "auto"
    ) => {
      const url = new URL('/api/customers', apiBaseUrl)
      url.searchParams.set('populate[user_id][populate]', '*')
      url.searchParams.set('populate[staff_id][populate]', '*')

      if (shouldLimitToStaff) {
        if ((staffFilterMode === "id" || staffFilterMode === "auto") && staffId) {
          url.searchParams.set('filters[staff_id][id][$eq]', String(staffId))
        } else if ((staffFilterMode === "documentId" || staffFilterMode === "auto") && staffDocumentId) {
          url.searchParams.set('filters[staff_id][documentId][$eq]', staffDocumentId)
        }
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

      if (result?.data && Array.isArray(result.data)) {
        return result.data
      }
      if (Array.isArray(result)) {
        return result
      }

      console.warn('Unexpected response structure:', result)
      return []
    }

    let customers: any[] = []
    try {
      customers = await fetchCustomersFromApi()
    } catch (error) {
      if (!shouldLimitToStaff) {
        throw error
      }
      customers = await fetchCustomersFromApi("documentId")
    }

    let normalized = customers.map(normalizeCustomer)

    if (shouldLimitToStaff) {
      const filtered = normalized.filter((customer) => {
        if (staffId && customer.staff_id === staffId) return true
        if (staffDocumentId && customer.staff_document_id === staffDocumentId) return true
        return false
      })

      if (filtered.length === 0) {
        const unfilteredRaw = await fetchCustomersFromApi("documentId")
        normalized = unfilteredRaw.map(normalizeCustomer).filter((customer: Customer) => {
          if (staffId && customer.staff_id === staffId) return true
          if (staffDocumentId && customer.staff_document_id === staffDocumentId) return true
          return false
        })
      } else {
        normalized = filtered
      }
    }

    return normalized
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
