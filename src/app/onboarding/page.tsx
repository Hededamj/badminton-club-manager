'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Building2, UserPlus, Loader2, ArrowRight, Mail } from 'lucide-react'

export default function OnboardingPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for creating club
  const [clubName, setClubName] = useState('')
  const [clubDescription, setClubDescription] = useState('')

  // Form state for joining with code
  const [inviteCode, setInviteCode] = useState('')

  // Redirect if user already has a club
  if (status === 'authenticated' && session?.user?.currentClubId) {
    router.push('/dashboard')
    return null
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  async function handleCreateClub(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clubName,
          description: clubDescription,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Switch to the new club
        await fetch('/api/clubs/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: data.id }),
        })
        // Update session
        await updateSession({ clubId: data.id })
        // Force full page navigation to ensure session is refreshed
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Kunne ikke oprette klub')
      }
    } catch (error) {
      setError('Der opstod en fejl. Prøv igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleJoinWithCode(e: React.FormEvent) {
    e.preventDefault()

    // Extract token from URL or use directly
    let token = inviteCode.trim()
    if (token.includes('/join/')) {
      token = token.split('/join/').pop() || ''
    }

    if (!token) {
      setError('Indtast venligst en invitationskode')
      return
    }

    router.push(`/join/${token}`)
  }

  // Generate preview slug
  const previewSlug = clubName
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'oe')
    .replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto pt-8 sm:pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="CourtPlanner"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Velkommen til CourtPlanner!
          </h1>
          <p className="text-muted-foreground">
            {session?.user?.email}
          </p>
        </div>

        {/* Choose Mode */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground mb-6">
              Hvordan vil du komme i gang?
            </p>

            <button
              onClick={() => setMode('create')}
              className="w-full bg-card border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Opret en ny klub</h3>
                  <p className="text-muted-foreground text-sm">
                    Start din egen badmintonklub og inviter medlemmer
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-card border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Jeg har en invitationskode</h3>
                  <p className="text-muted-foreground text-sm">
                    Brug et invitationslink eller kode for at blive medlem
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Har du modtaget en invitation via email?{' '}
                <span className="text-primary">Klik på linket i emailen</span>
              </p>
            </div>
          </div>
        )}

        {/* Create Club Form */}
        {mode === 'create' && (
          <div className="bg-card border rounded-xl p-6">
            <button
              onClick={() => setMode('choose')}
              className="text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              ← Tilbage
            </button>

            <h2 className="text-xl font-semibold mb-4">Opret ny klub</h2>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Klubnavn <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
                  placeholder="f.eks. HTK Badminton"
                  required
                  minLength={2}
                />
              </div>

              {clubName.length >= 2 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Klub-URL
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">courtplanner.dk/</span>
                    <span className="font-mono">{previewSlug}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Beskrivelse
                </label>
                <textarea
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 resize-none"
                  placeholder="Kort beskrivelse (valgfrit)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || clubName.length < 2}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
                Opret klub
              </button>
            </form>
          </div>
        )}

        {/* Join with Code Form */}
        {mode === 'join' && (
          <div className="bg-card border rounded-xl p-6">
            <button
              onClick={() => setMode('choose')}
              className="text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              ← Tilbage
            </button>

            <h2 className="text-xl font-semibold mb-4">Brug invitationskode</h2>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Invitationslink eller kode
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Indsæt link eller kode her"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Eksempel: https://courtplanner.dk/join/abc123... eller bare koden
                </p>
              </div>

              <button
                type="submit"
                disabled={!inviteCode.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                Fortsæt
              </button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Har du modtaget en email?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Klik direkte på linket i invitationsemailen for den nemmeste måde at blive medlem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
