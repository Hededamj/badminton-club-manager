'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2, Check, AlertCircle, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface InvitationData {
  email: string
  role: string
  club: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  expiresAt: string
}

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchInvitation()
  }, [token])

  async function fetchInvitation() {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (response.ok) {
        setInvitation(data)
      } else {
        setError(data.error || 'Kunne ikke hente invitation')
        setErrorCode(data.code)
      }
    } catch (error) {
      console.error('Error fetching invitation:', error)
      setError('Kunne ikke hente invitation')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccept() {
    setIsAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Update session with new club
        await updateSession({ clubId: data.club.id })
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setError(data.error || 'Kunne ikke acceptere invitation')
        setErrorCode(data.code)
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError('Kunne ikke acceptere invitation')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Velkommen!</h1>
          <p className="text-muted-foreground mb-4">
            Du er nu medlem af {invitation?.club.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Omdirigerer til dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitation ugyldig</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C]"
          >
            Gå til login
          </Link>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (status === 'unauthenticated' && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#005A9C]/5 px-8 py-6 text-center border-b">
            <Image
              src="/logo.svg"
              alt="CourtPlanner"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h1 className="text-xl font-bold">Du er inviteret!</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-[#005A9C]/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#005A9C]" />
              </div>
              <div>
                <p className="font-semibold">{invitation.club.name}</p>
                <p className="text-sm text-muted-foreground">
                  {invitation.role === 'ADMIN' ? 'Administrator' : 'Medlem'}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground text-center mb-6">
              For at acceptere invitationen skal du logge ind eller oprette en konto med email:
            </p>

            <p className="text-center font-medium mb-6 px-4 py-2 bg-muted rounded-lg">
              {invitation.email}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => signIn(undefined, { callbackUrl: `/join/${token}` })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C]"
              >
                <LogIn className="w-4 h-4" />
                Log ind
              </button>

              <Link
                href={`/register?email=${encodeURIComponent(invitation.email)}&redirect=/join/${token}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-accent"
              >
                <UserPlus className="w-4 h-4" />
                Opret konto
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged in state
  if (invitation) {
    const emailMismatch = session?.user?.email?.toLowerCase() !== invitation.email.toLowerCase()

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <div className="max-w-md w-full bg-card border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#005A9C]/5 px-8 py-6 text-center border-b">
            <Image
              src="/logo.svg"
              alt="CourtPlanner"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h1 className="text-xl font-bold">Bliv medlem af klubben</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-[#005A9C]/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#005A9C]" />
              </div>
              <div>
                <p className="font-semibold">{invitation.club.name}</p>
                {invitation.club.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {invitation.club.description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rolle:</span>
                <span className="font-medium">
                  {invitation.role === 'ADMIN' ? 'Administrator' : 'Medlem'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inviteret som:</span>
                <span className="font-medium">{invitation.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Logget ind som:</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {emailMismatch ? (
              <div className="bg-amber-500/10 text-amber-600 px-4 py-3 rounded-lg mb-4 text-sm">
                <p className="font-medium mb-1">Email matcher ikke</p>
                <p>
                  Denne invitation er sendt til {invitation.email}, men du er logget ind som {session?.user?.email}.
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={isAccepting || emailMismatch}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C] disabled:opacity-50"
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Accepter invitation
              </button>

              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-accent"
              >
                Annuller
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
