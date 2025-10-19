import { ContactExchangeFlow } from '@/components/contact-exchange-flow'
import { getUserProfile } from '@/lib/profile'

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function MePage() {
  const profile = getUserProfile()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <ContactExchangeFlow profile={profile} />
    </main>
  )
}
