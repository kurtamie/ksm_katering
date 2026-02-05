import { Suspense } from 'react'
import CustomerPageClient from './CustomerPageClient'

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CustomerPageClient />
    </Suspense>
  )
}
