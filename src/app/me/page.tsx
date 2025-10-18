import { ContactCard } from '@/components/contact-card'
import { ContactForm } from '@/components/contact-form'
import { getUserProfile } from '@/lib/profile'

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function MePage() {
  const profile = getUserProfile()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Let's Connect!</h1>
          <p className="text-lg text-muted-foreground">
            Great meeting you at the conference
          </p>
        </div>

        <div className="animate-fade-in">
          <ContactCard profile={profile} />
        </div>

        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 text-sm text-muted-foreground">
              Or share your contact info
            </span>
          </div>
        </div>

        <div className="animate-fade-in">
          <ContactForm />
        </div>
      </div>
    </main>
  )
}

