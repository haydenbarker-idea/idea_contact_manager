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
        <div className="bg-green-600 text-white text-center py-4 px-4">
          <p className="text-lg font-semibold">
            🎉 Welcome {user.name.split(' ')[0]}! Your page is live at: contacts.ideanetworks.com/u/{username}
          </p>
          <p className="text-sm mt-1">
            Share this link to start collecting contacts! Access your admin dashboard at /u/{username}/admin
          </p>
        </div>
      )}
      <ContactExchangeFlow profile={profile} userId={user.id} />
    </main>
  )
}

