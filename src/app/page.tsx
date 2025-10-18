import { redirect } from 'next/navigation'

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function Home() {
  redirect('/me')
}

