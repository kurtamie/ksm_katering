import { getStrapiURL } from '@/lib/utils'

export type MenuRecommendations = {
  rice: string
  mainDish: string
  additionalDish: string
  vegetable: string
  sauce: string
  chip: string
  fruit: string
  mineralWater: string
  box: string
  pudding: string
  snack: string
}

type MenuAttributeMap = {
  key: keyof MenuRecommendations
  source: string
}

const apiBaseUrl = getStrapiURL()

const DEFAULT_RECOMMENDATIONS: MenuRecommendations = {
  rice: '-',
  mainDish: '-',
  additionalDish: '-',
  vegetable: '-',
  sauce: '-',
  chip: '-',
  fruit: '-',
  mineralWater: '-',
  box: '-',
  pudding: '-',
  snack: '-',
}

const MENU_FIELDS: MenuAttributeMap[] = [
  { key: 'rice', source: 'rice' },
  { key: 'mainDish', source: 'main_dish' },
  { key: 'additionalDish', source: 'additional_dish' },
  { key: 'vegetable', source: 'vegetable' },
  { key: 'sauce', source: 'sauce' },
  { key: 'chip', source: 'chip' },
  { key: 'fruit', source: 'fruit' },
  { key: 'mineralWater', source: 'mineral_water' },
  { key: 'box', source: 'box' },
  { key: 'pudding', source: 'pudding' },
  { key: 'snack', source: 'snack' },
]

const getAttributes = (item: any) => item?.attributes ?? item ?? {}

const toValidText = (value: unknown) => {
  if (value === null || value === undefined) return ''
  const text = String(value).trim()
  return text.length > 0 ? text : ''
}

const getTodayRange = (base = new Date()) => {
  const start = new Date(base)
  start.setHours(0, 0, 0, 0)
  const end = new Date(base)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const getMostCommonValue = (values: string[]) => {
  if (!values.length) return '-'

  const counter = new Map<string, { value: string; count: number }>()

  values.forEach((value) => {
    const key = value.toLowerCase()
    const existing = counter.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counter.set(key, { value, count: 1 })
    }
  })

  const sorted = Array.from(counter.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.value.localeCompare(b.value)
  })

  return sorted[0]?.value ?? '-'
}

export async function fetchOrderMenuRecommendations(
  date = new Date()
): Promise<MenuRecommendations> {
  try {
    const { start, end } = getTodayRange(date)
    const url = new URL('/api/order-menus', apiBaseUrl)
    url.searchParams.set('filters[createdAt][$gte]', start.toISOString())
    url.searchParams.set('filters[createdAt][$lte]', end.toISOString())
    url.searchParams.set('pagination[pageSize]', '200')
    url.searchParams.set('sort[0]', 'createdAt:desc')

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
    const items = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : []

    const attributesList = items.map(getAttributes)

    const recommendations: MenuRecommendations = { ...DEFAULT_RECOMMENDATIONS }

    MENU_FIELDS.forEach(({ key, source }) => {
      const values = attributesList
        .map((attrs: any) => toValidText(attrs?.[source]))
        .filter((value: any) => value.length > 0)
      recommendations[key] = getMostCommonValue(values)
    })

    return recommendations
  } catch (error) {
    console.error('Error fetching order menu recommendations:', error)
    return { ...DEFAULT_RECOMMENDATIONS }
  }
}