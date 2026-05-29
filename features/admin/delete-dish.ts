import { getStrapiURL } from '@/lib/utils'

type DeleteResult = {
  success: boolean
  error?: string
}

type DishDocumentId = string

const getIdentifier = (documentId: DishDocumentId) => {
  if (typeof documentId === 'string') {
    const trimmed = documentId.trim()
    if (trimmed.length > 0) {
      return trimmed
    }
  }

  return null
}

export async function deleteDish(documentId: DishDocumentId): Promise<DeleteResult> {
  const identifier = getIdentifier(documentId)

  if (identifier === null) {
    return {
      success: false,
      error: 'Document ID lauk tidak valid',
    }
  }

  try {
    const url = new URL(`/api/dishes/${identifier}`, getStrapiURL())
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let message = 'Gagal menghapus lauk'

      try {
        const errorData = await response.json()
        message = errorData?.error?.message ?? errorData?.message ?? message
      } catch {
        // Ignore JSON parse errors and use fallback message
      }

      return {
        success: false,
        error: message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus lauk',
    }
  }
}
