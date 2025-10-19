import { ContactExchangeFlow } from '@/components/contact-exchange-flow'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { UserProfile } from '@/types'

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    username: string
  }
  searchParams: {
    welcome?: string
  }
}

export default async function UserPage({ params, searchParams }: PageProps) {
  const { username } = params

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { slug: username, active: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      linkedin: true,
      company: true,
      title: true,
      bio: true,
      photoUrl: true,
      slug: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Convert to UserProfile format
  const profile: UserProfile = {
    name: user.name,
    title: user.title || '',
    company: user.company || '',
    email: user.email,
    phone: user.phone || '',
    linkedin: user.linkedin || '',
    bio: user.bio || '',
    photoUrl: user.photoUrl || '/images/default-avatar.jpg',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {searchParams.welcome && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="container max-w-2xl mx-auto py-6 px-4 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                🎉 Congratulations {user.name.split(' ')[0]}!
              </h2>
              <p className="text-lg mb-1">
                Your Contact Exchange page is <strong>LIVE!</strong>
              </p>
              <p className="text-sm opacity-90">
                {process.env.NEXT_PUBLIC_APP_URL}/u/{username}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <p className="font-semibold text-center">📱 Add to Your Home Screen:</p>
              
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold mb-1">🍎 iPhone/iPad:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Tap Share button (box with arrow)</li>
                    <li>Scroll down, tap "Add to Home Screen"</li>
                    <li>Tap "Add" - Done! ✨</li>
                  </ol>
                </div>
                
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold mb-1">🤖 Android:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Tap menu (⋮) in browser</li>
                    <li>Tap "Add to Home screen"</li>
                    <li>Tap "Add" - Done! ✨</li>
                  </ol>
                </div>
              </div>
              
              <p className="text-center text-sm">
                <strong>Check your phone for a text message</strong> with your link!
              </p>
            </div>
            
            <div className="text-center text-sm opacity-90">
              <p>Share your link to start collecting contacts at conferences!</p>
            </div>
          </div>
        </div>
      )}
      <ContactExchangeFlow profile={profile} userId={user.id} />
    </main>
  )
}

