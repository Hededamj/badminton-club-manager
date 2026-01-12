'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Crown, Shield, User, Trash2, Loader2, UserPlus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null)
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null)

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

  async function handleChangeRole(membershipId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const member = members.find(m => m.id === membershipId)
    if (!member) return

    // Confirm ownership transfer
    if (newRole === 'OWNER') {
      const confirmed = confirm(
        `Er du sikker på at du vil overdrage ejerskabet til ${member.player?.name || member.user.email}?\n\nDu vil blive nedgraderet til Administrator.`
      )
      if (!confirmed) {
        setOpenRoleMenuId(null)
        return
      }
    }

    setChangingRoleId(membershipId)
    setOpenRoleMenuId(null)

    try {
      const response = await fetch('/api/clubs/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, role: newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        // If ownership was transferred, refresh to get updated roles for everyone
        if (data.ownershipTransferred) {
          window.location.reload()
        } else {
          // Just update the single member
          setMembers(members.map(m =>
            m.id === membershipId ? { ...m, role: newRole } : m
          ))
        }
      } else {
        alert(data.error || 'Kunne ikke ændre rolle')
      }
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Kunne ikke ændre rolle')
    } finally {
      setChangingRoleId(null)
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

  function getRoleColor(role: string) {
    switch (role) {
      case 'OWNER':
        return 'text-amber-600 bg-amber-50'
      case 'ADMIN':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
                    {isOwner && member.user.id !== session?.user?.id ? (
                      // Role dropdown for owner (can change other members' roles)
                      <div className="relative">
                        <button
                          onClick={() => setOpenRoleMenuId(openRoleMenuId === member.id ? null : member.id)}
                          disabled={changingRoleId === member.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            getRoleColor(member.role),
                            "hover:opacity-80",
                            changingRoleId === member.id && "opacity-50"
                          )}
                        >
                          {changingRoleId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            getRoleIcon(member.role)
                          )}
                          <span>{getRoleName(member.role)}</span>
                          <ChevronDown className={cn(
                            "w-3 h-3 transition-transform",
                            openRoleMenuId === member.id && "rotate-180"
                          )} />
                        </button>

                        {openRoleMenuId === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenRoleMenuId(null)}
                            />
                            <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[160px]">
                              <button
                                onClick={() => handleChangeRole(member.id, 'OWNER')}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                                  member.role === 'OWNER' && "bg-accent"
                                )}
                              >
                                <Crown className="w-4 h-4 text-amber-500" />
                                <span>Ejer</span>
                                <span className="text-xs text-muted-foreground ml-auto">Overdrag</span>
                              </button>
                              <button
                                onClick={() => handleChangeRole(member.id, 'ADMIN')}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                                  member.role === 'ADMIN' && "bg-accent"
                                )}
                              >
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span>Administrator</span>
                              </button>
                              <button
                                onClick={() => handleChangeRole(member.id, 'MEMBER')}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                                  member.role === 'MEMBER' && "bg-accent"
                                )}
                              >
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>Medlem</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      // Static role display for non-owners or for self
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                        getRoleColor(member.role)
                      )}>
                        {getRoleIcon(member.role)}
                        <span>{getRoleName(member.role)}</span>
                      </div>
                    )}
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
              <p className="text-xs text-muted-foreground">Fuld kontrol, kan ændre roller</p>
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
        {isOwner && (
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
            Som ejer kan du klikke på en rolle for at ændre den. Hvis du vælger at overdrage ejerskabet, bliver du automatisk administrator.
          </p>
        )}
      </div>
    </div>
  )
}
