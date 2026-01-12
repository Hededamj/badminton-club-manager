'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Building2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClubPage() {
  const { update: updateSession } = useSession()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        const club = await response.json()
        // Switch to the new club
        await fetch('/api/clubs/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId: club.id }),
        })
        // Update session with new club
        await updateSession({ clubId: club.id })
        // Force full page navigation to ensure session is refreshed
        window.location.href = '/dashboard'
      } else {
        const data = await response.json()
        setError(data.error || 'Kunne ikke oprette klub')
      }
    } catch (error) {
      console.error('Error creating club:', error)
      setError('Kunne ikke oprette klub')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate preview slug
  const previewSlug = name
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'oe')
    .replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Tilbage
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Building2 className="w-7 h-7 text-[#005A9C]" />
          Opret ny klub
        </h1>
        <p className="text-muted-foreground mt-1">
          Start din egen badmintonklub og inviter medlemmer
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Klubnavn <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
              placeholder="f.eks. HTK Badminton"
              required
              minLength={2}
            />
          </div>

          {name.length >= 2 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Klub-URL (automatisk genereret)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
                <span className="text-muted-foreground text-sm">courtplanner.dk/</span>
                <span className="font-mono">{previewSlug || '...'}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Beskrivelse
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 resize-none"
              placeholder="Kort beskrivelse af klubben (valgfrit)"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Annuller
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || name.length < 2}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              Opret klub
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Hvad sker der når du opretter en klub?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Du bliver automatisk ejer af klubben</li>
          <li>- Du kan invitere andre brugere som medlemmer</li>
          <li>- Du kan oprette spillere, træninger og turneringer</li>
          <li>- Al data er isoleret fra andre klubber</li>
        </ul>
      </div>
    </div>
  )
}
