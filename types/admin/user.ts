export type CurrentUser = {
  id: number
  staff?: {
    id: number | null
    documentId?: string
    position?: string
    department?: string
  }
}