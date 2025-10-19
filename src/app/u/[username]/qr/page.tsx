'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserQRPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params.username as string
  const showWelcome = searchParams.get('welcome') === 'true'
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${username}`
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Connect with me!',
          text: 'Scan my QR code or visit my contact exchange page',
          url: profileUrl,
        })
      } catch (err) {
        // User cancelled share
      }
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {showWelcome && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="container max-w-2xl mx-auto py-6 px-4 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-lg mb-1">
                Your Contact Exchange QR Code is <strong>READY!</strong>
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <p className="font-semibold text-center">📱 Add This Page to Your Home Screen:</p>
              
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
              <p>At conferences, open this app and let people scan your QR code!</p>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Contact Exchange
                </h1>
                <p className="text-muted-foreground mt-2">
                  Let people scan this QR code to exchange contacts
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value={profileUrl}
                    size={280}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/images/hayden-headshot.jpg",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  At conferences and events:
                </p>
                <ol className="list-decimal list-inside text-left max-w-md mx-auto space-y-2">
                  <li>Open this app from your home screen</li>
                  <li>Show your QR code to people you meet</li>
                  <li>They scan it with their camera</li>
                  <li>They submit their contact info</li>
                  <li>You'll get a notification!</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Share2 className="h-5 w-5" />
                  Share My Link
                </Button>
                <Button
                  onClick={() => window.open(profileUrl, '_blank')}
                  variant="default"
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  <ExternalLink className="h-5 w-5" />
                  View My Page
                </Button>
              </div>

              {/* URL Display */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Or share this link:</p>
                <code className="text-xs bg-muted px-3 py-2 rounded">
                  {profileUrl}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

