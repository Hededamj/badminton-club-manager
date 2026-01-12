'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Crown, Shield, User, Trash2, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: {
    id: string
    email: string
  }
  player: {
    id: string
    name: string
    level: number
  } | null
}

export default function ClubMembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    try {
      const response = await fetch('/api/clubs/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Kunne ikke hente medlemmer')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveMember(membershipId: string) {
    if (!confirm('Er du sikker på at du vil fjerne dette medlem?')) return

    setRemovingId(membershipId)
    try {
      const response = await fetch(`/api/clubs/members?membershipId=${membershipId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMembers(members.filter(m => m.id !== membershipId))
      } else {
        const data = await response.json()
        alert(data.error || 'Kunne ikke fjerne medlem')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Kunne ikke fjerne medlem')
    } finally {
      setRemovingId(null)
    }
  }

  const isAdmin = session?.user?.currentClubRole === 'ADMIN' || session?.user?.currentClubRole === 'OWNER'
  const isOwner = session?.user?.currentClubRole === 'OWNER'

  function getRoleIcon(role: string) {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-amber-500" />
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-muted-foreground" />
    }
  }

  function getRoleName(role: string) {
    switch (role) {
      case 'OWNER':
        return 'Ejer'
      case 'ADMIN':
        return 'Administrator'
      default:
        return 'Medlem'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Medlemmer
          </h1>
          <p className="text-muted-foreground mt-1">
            {members.length} {members.length === 1 ? 'medlem' : 'medlemmer'} i klubben
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/club/invite"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Inviter medlem</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium">Bruger</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Rolle</th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">Spiller</th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">Tilmeldt</th>
                {isAdmin && <th className="w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {member.player?.name || member.user.email.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm">{getRoleName(member.role)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {member.player ? (
                      <Link
                        href={`/players/${member.player.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {member.player.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">Ikke tilknyttet</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString('da-DK')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {member.role !== 'OWNER' && member.user.id !== session?.user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingId === member.id}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Fjern medlem"
                        >
                          {removingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Ingen medlemmer fundet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Roller</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Crown className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Ejer</p>
              <p className="text-xs text-muted-foreground">Fuld kontrol over klubben</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">Kan administrere spillere og træninger</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Medlem</p>
              <p className="text-xs text-muted-foreground">Kan se og deltage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
