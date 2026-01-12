'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Save, Loader2, Upload, Trash2, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Club {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  settings: any
  userRole: string
  _count: {
    players: number
    trainings: number
    tournaments: number
    memberships: number
  }
}

export default function ClubSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [club, setClub] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchClub()
  }, [])

  async function fetchClub() {
    try {
      const response = await fetch('/api/clubs/current')
      if (response.ok) {
        const data = await response.json()
        setClub(data)
        setName(data.name)
        setDescription(data.description || '')
        setLogoPreview(data.logo || null)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching club:', error)
      setError('Kunne ikke hente kluboplysninger')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Kun JPG, PNG, WebP og SVG er tilladt')
      return
    }

    // Validate file size (500KB)
    if (file.size > 500 * 1024) {
      setError('Logo må max være 500KB')
      return
    }

    setIsUploadingLogo(true)
    setError(null)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        const response = await fetch('/api/clubs/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo: base64 }),
        })

        if (response.ok) {
          const data = await response.json()
          setLogoPreview(data.club.logo)
          setSuccess('Logo uploadet')
        } else {
          const data = await response.json()
          setError(data.error || 'Kunne ikke uploade logo')
        }
        setIsUploadingLogo(false)
      }
      reader.onerror = () => {
        setError('Kunne ikke læse filen')
        setIsUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setError('Kunne ikke uploade logo')
      setIsUploadingLogo(false)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleRemoveLogo() {
    setIsUploadingLogo(true)
    setError(null)

    try {
      const response = await fetch('/api/clubs/logo', {
        method: 'DELETE',
      })

      if (response.ok) {
        setLogoPreview(null)
        setSuccess('Logo fjernet')
      } else {
        const data = await response.json()
        setError(data.error || 'Kunne ikke fjerne logo')
      }
    } catch (error) {
      console.error('Error removing logo:', error)
      setError('Kunne ikke fjerne logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/clubs/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        const data = await response.json()
        setClub(data)
        setSuccess('Kluboplysninger opdateret')
        // Refresh session to get new club name
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Kunne ikke gemme ændringer')
      }
    } catch (error) {
      console.error('Error saving club:', error)
      setError('Kunne ikke gemme ændringer')
    } finally {
      setIsSaving(false)
    }
  }

  const isOwner = club?.userRole === 'OWNER'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || 'Kunne ikke finde kluboplysninger'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary" />
          Klubindstillinger
        </h1>
        <p className="text-muted-foreground mt-1">
          Administrer din klubs oplysninger
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{club._count.players}</p>
          <p className="text-sm text-muted-foreground">Spillere</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{club._count.trainings}</p>
          <p className="text-sm text-muted-foreground">Træninger</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{club._count.tournaments}</p>
          <p className="text-sm text-muted-foreground">Turneringer</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{club._count.memberships}</p>
          <p className="text-sm text-muted-foreground">Medlemmer</p>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Klublogo</h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Klublogo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Upload et logo til din klub. Logoet vises i menuen og på klubsider.
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP eller SVG · Max 500 KB
              </p>
            </div>

            {(isOwner || club?.userRole === 'ADMIN') && (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload logo
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Fjern
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Kluboplysninger</h2>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {!isOwner && (
          <div className="bg-amber-500/10 text-amber-600 px-4 py-3 rounded-lg mb-4">
            Kun klubejeren kan ændre kluboplysninger
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Klubnavn
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner || isSaving}
              className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
              placeholder="Indtast klubnavn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Beskrivelse
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isOwner || isSaving}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50 resize-none"
              placeholder="Kort beskrivelse af klubben (valgfrit)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Klub-URL
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
              <span className="text-muted-foreground text-sm">courtplanner.dk/</span>
              <span className="font-mono">{club.slug}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Klub-URL kan ikke ændres
            </p>
          </div>

          {isOwner && (
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Gem ændringer
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
