'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Building2, Check, Plus, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Club {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
}

interface ClubSelectorProps {
  onNavigate?: () => void
}

export function ClubSelector({ onNavigate }: ClubSelectorProps) {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    fetchClubs()
  }, [])

  async function fetchClubs() {
    try {
      const response = await fetch('/api/clubs')
      if (response.ok) {
        const data = await response.json()
        setClubs(data)
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSwitchClub(clubId: string) {
    if (clubId === session?.user?.currentClubId || isSwitching) return

    setIsSwitching(true)
    try {
      const response = await fetch('/api/clubs/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId }),
      })

      if (response.ok) {
        // Trigger session update with new club
        await updateSession({ clubId })
        setIsOpen(false)
        // Force full page reload to ensure all data is refreshed
        window.location.reload()
      }
    } catch (error) {
      console.error('Error switching club:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  const currentClub = clubs.find(c => c.id === session?.user?.currentClubId)
  const isAdmin = session?.user?.currentClubRole === 'ADMIN' || session?.user?.currentClubRole === 'OWNER'

  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <div className="relative">
        {/* Current Club Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "bg-muted/50 hover:bg-muted transition-colors",
            "border border-border/50"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">
              {currentClub?.name || session?.user?.currentClubName || 'Vælg klub'}
            </p>
            <p className="text-xs text-muted-foreground">
              {session?.user?.currentClubRole === 'OWNER' && 'Ejer'}
              {session?.user?.currentClubRole === 'ADMIN' && 'Administrator'}
              {session?.user?.currentClubRole === 'MEMBER' && 'Medlem'}
            </p>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-popover border rounded-lg shadow-lg py-2">
              {/* Club List */}
              {clubs.length > 0 && (
                <div className="px-2 pb-2 border-b">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Mine klubber
                  </p>
                  {clubs.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => handleSwitchClub(club.id)}
                      disabled={isSwitching}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-md",
                        "hover:bg-accent transition-colors",
                        club.id === session?.user?.currentClubId && "bg-accent"
                      )}
                    >
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-primary" />
                      </div>
                      <span className="flex-1 text-left text-sm truncate">
                        {club.name}
                      </span>
                      {club.id === session?.user?.currentClubId && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Club Management Links */}
              {isAdmin && (
                <div className="px-2 pt-2">
                  <Link
                    href="/club/settings"
                    onClick={() => {
                      setIsOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Klubindstillinger</span>
                  </Link>
                  <Link
                    href="/club/members"
                    onClick={() => {
                      setIsOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Medlemmer</span>
                  </Link>
                </div>
              )}

              {/* Create New Club */}
              <div className="px-2 pt-2 border-t mt-2">
                <Link
                  href="/club/new"
                  onClick={() => {
                    setIsOpen(false)
                    onNavigate?.()
                  }}
                  className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Opret ny klub</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
