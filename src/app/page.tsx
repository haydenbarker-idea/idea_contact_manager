'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Users,
  QrCode,
  Camera,
  Download,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact Exchange Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/get-started">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 text-sm">
            🎉 Free for the First 100,000 Users!
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            The Future of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Conference Networking
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Ditch business cards forever. Exchange contacts with a selfie, QR code, and instant follow-up.
            <strong> Network smarter.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/get-started">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/u/hayden-barker">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <QrCode className="h-5 w-5 mr-2" />
                See Live Demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            ✓ No credit card required • ✓ Setup in 60 seconds • ✓ Cancel anytime
          </p>
        </div>

        {/* Hero Image/Demo Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border-8 border-white overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <QrCode className="h-24 w-24 mx-auto text-blue-600" />
                <p className="text-2xl font-semibold text-gray-700">Your QR Contact Page</p>
                <p className="text-muted-foreground">People scan, submit their info, and you're connected!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">100K+</div>
              <div className="text-muted-foreground mt-2">Free Accounts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">60 sec</div>
              <div className="text-muted-foreground mt-2">Setup Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600">∞</div>
              <div className="text-muted-foreground mt-2">Contacts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">100%</div>
              <div className="text-muted-foreground mt-2">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Network Like a Pro
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            More than just contact exchange. It's your complete conference networking solution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: QrCode,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100',
              title: 'QR Code Page',
              description: 'Your personal QR code page. People scan it, fill out their info, done.',
            },
            {
              icon: Camera,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100',
              title: 'Selfie Exchange',
              description: 'Remember who you met! Every contact includes their selfie.',
            },
            {
              icon: Smartphone,
              color: 'text-pink-600',
              bgColor: 'bg-pink-100',
              title: 'Mobile Optimized',
              description: 'Add to your home screen. Works perfectly at conferences on your phone.',
            },
            {
              icon: Users,
              color: 'text-indigo-600',
              bgColor: 'bg-indigo-100',
              title: 'Dashboard',
              description: 'View all your contacts, export to CSV, download vCards.',
            },
            {
              icon: Download,
              color: 'text-green-600',
              bgColor: 'bg-green-100',
              title: 'Instant vCards',
              description: 'Contacts download your vCard instantly. Save to their phone in 1 tap.',
            },
            {
              icon: TrendingUp,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100',
              title: 'Analytics',
              description: 'Track how many contacts you collect. See who\'s most active.',
            },
            {
              icon: Zap,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-100',
              title: 'Auto Follow-Up',
              description: 'Automatic SMS and email confirmations. Stay top of mind.',
            },
            {
              icon: Shield,
              color: 'text-cyan-600',
              bgColor: 'bg-cyan-100',
              title: 'Privacy First',
              description: 'Your data is yours. We never sell or share contact information.',
            },
            {
              icon: Clock,
              color: 'text-rose-600',
              bgColor: 'bg-rose-100',
              title: '60 Second Setup',
              description: 'Create your page in under a minute. Start networking immediately.',
            },
          ].map((feature, i) => (
            <Card key={i} className="border-2 hover:border-purple-200 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Three simple steps to transform your conference networking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up Free',
                description: 'Create your account in 60 seconds. Add your photo, bio, and contact info.',
              },
              {
                step: '2',
                title: 'Show Your QR Code',
                description: 'At conferences, open your QR page. People scan it with their phone camera.',
              },
              {
                step: '3',
                title: 'Collect & Follow Up',
                description: 'They submit their contact with a selfie. View in your dashboard, export, connect!',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4 h-full border border-white/20">
                  <div className="text-6xl font-bold opacity-50">{step.step}</div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-lg opacity-90">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Conference Pros Love Us
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: CheckCircle2,
              title: 'Never Lose a Business Card',
              description: 'All contacts saved digitally with photos. Search, filter, export anytime.',
            },
            {
              icon: CheckCircle2,
              title: 'Stand Out at Events',
              description: 'Be the most tech-savvy person in the room. People remember the QR code person.',
            },
            {
              icon: CheckCircle2,
              title: 'Instant Follow-Up',
              description: 'Auto-send SMS and email confirmations. Connect on LinkedIn immediately.',
            },
            {
              icon: CheckCircle2,
              title: 'Go Paperless',
              description: 'Eco-friendly, organized, and professional. No more lost or crumpled cards.',
            },
          ].map((benefit, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-green-100 p-3 rounded-full">
                  <benefit.icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold">
            Ready to Network Like a Pro?
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Join the first 100,000 users getting <strong>lifetime free access</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/get-started">
              <Button size="lg" className="text-lg px-10 py-7 bg-white text-purple-600 hover:bg-gray-100 shadow-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm opacity-75 pt-4">
            No credit card • No commitment • Setup in 60 seconds
          </p>

          <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No Ads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Unlimited Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>All Features Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold">Contact Exchange Pro</span>
              </div>
              <p className="text-sm">
                The future of conference networking. Network smarter, not harder.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/get-started" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/u/hayden-barker" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://ideanetworks.com" className="hover:text-white">Idea Networks</a></li>
                <li><a href="mailto:hbarker@ideanetworks.com" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Contact Exchange Pro by Idea Networks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
