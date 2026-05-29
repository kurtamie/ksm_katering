export const toNullable = (value: string) => {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export const normalizeRoleValue = (value: string | null | undefined) =>
  value?.toLowerCase() ?? ""