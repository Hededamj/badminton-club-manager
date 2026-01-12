'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Mail,
  Clock,
  Shield,
  User
} from 'lucide-react'
import Link from 'next/link'

interface Invitation {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  token: string
  expiresAt: string
  usedAt: string | null
  createdAt: string
  creator: {
    id: string
    email: string
  }
}

export default function InvitePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null)
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')

  useEffect(() => {
    fetchInvitations()
  }, [])

  async function fetchInvitations() {
    try {
      const response = await fetch('/api/clubs/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/clubs/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (response.ok) {
        setLastInviteUrl(data.invitation.inviteUrl)
        setSuccess(`Invitation oprettet til ${email}`)
        setEmail('')
        fetchInvitations()
      } else {
        setError(data.error || 'Kunne ikke sende invitation')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      setError('Kunne ikke sende invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(invitationId: string) {
    if (!confirm('Er du sikker på at du vil slette denne invitation?')) return

    setDeletingId(invitationId)
    try {
      const response = await fetch(`/api/clubs/invitations?id=${invitationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInvitations(invitations.filter(i => i.id !== invitationId))
      } else {
        const data = await response.json()
        alert(data.error || 'Kunne ikke slette invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      alert('Kunne ikke slette invitation')
    } finally {
      setDeletingId(null)
    }
  }

  function copyInviteLink(invitation: Invitation) {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/join/${invitation.token}`
    navigator.clipboard.writeText(url)
    setCopiedId(invitation.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function getInviteStatus(invitation: Invitation) {
    if (invitation.usedAt) {
      return { label: 'Brugt', color: 'text-green-600 bg-green-100' }
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return { label: 'Udløbet', color: 'text-red-600 bg-red-100' }
    }
    return { label: 'Aktiv', color: 'text-blue-600 bg-blue-100' }
  }

  const pendingInvitations = invitations.filter(
    i => !i.usedAt && new Date(i.expiresAt) > new Date()
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Link
        href="/club/members"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Tilbage til medlemmer
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <UserPlus className="w-7 h-7 text-[#005A9C]" />
          Inviter medlemmer
        </h1>
        <p className="text-muted-foreground mt-1">
          Send invitationer til nye medlemmer af klubben
        </p>
      </div>

      {/* Invitation Form */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Send invitation</h2>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">{success}</p>
            {lastInviteUrl && (
              <div className="mt-3 p-3 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Del dette link med personen:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded font-mono break-all text-foreground">
                    {lastInviteUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(lastInviteUrl)
                      setCopiedInviteUrl(true)
                      setTimeout(() => setCopiedInviteUrl(false), 2000)
                    }}
                    className="flex-shrink-0 p-2 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C]"
                  >
                    {copiedInviteUrl ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email adresse <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
              placeholder="navn@example.dk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Rolle
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="MEMBER"
                  checked={role === 'MEMBER'}
                  onChange={() => setRole('MEMBER')}
                  disabled={isSubmitting}
                  className="w-4 h-4"
                />
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Medlem</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  disabled={isSubmitting}
                  className="w-4 h-4"
                />
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Administrator</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="flex items-center gap-2 px-4 py-2 bg-[#005A9C] text-white rounded-lg hover:bg-[#004A7C] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Send invitation
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">
            Afventende invitationer ({pendingInvitations.length})
          </h2>
        </div>

        {invitations.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            Ingen invitationer sendt endnu
          </div>
        ) : (
          <div className="divide-y">
            {invitations.map((invitation) => {
              const status = getInviteStatus(invitation)
              return (
                <div
                  key={invitation.id}
                  className="px-6 py-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invitation.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {invitation.role === 'ADMIN' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {invitation.role === 'ADMIN' ? 'Administrator' : 'Medlem'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Udløber {new Date(invitation.expiresAt).toLocaleDateString('da-DK')}
                      </span>
                    </div>
                  </div>

                  {!invitation.usedAt && new Date(invitation.expiresAt) > new Date() && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(invitation)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        title="Kopier link"
                      >
                        {copiedId === invitation.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(invitation.id)}
                        disabled={deletingId === invitation.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Slet invitation"
                      >
                        {deletingId === invitation.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Sådan fungerer invitationer</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>1. Indtast email på den person du vil invitere</li>
          <li>2. Kopier invitationslinket og send det til personen</li>
          <li>3. Personen opretter en konto (hvis de ikke har en) og accepterer</li>
          <li>4. De bliver automatisk medlem af klubben</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Invitationer udløber efter 7 dage.
        </p>
      </div>
    </div>
  )
}
