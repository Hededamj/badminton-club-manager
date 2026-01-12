'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  BarChart3,
  Building2,
  Settings,
  UserPlus,
  ChevronDown,
  Check,
  Plus
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Spillere',
    href: '/players',
    icon: Users
  },
  {
    title: 'Træninger',
    href: '/trainings',
    icon: Calendar
  },
  {
    title: 'Turneringer',
    href: '/tournaments',
    icon: Trophy
  },
  {
    title: 'Statistik',
    href: '/statistics',
    icon: BarChart3
  }
]

interface Club {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname()
  const { data: session, update: updateSession } = useSession()
  const [clubs, setClubs] = useState<Club[]>([])
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false)
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
        await updateSession({ clubId })
        setIsClubMenuOpen(false)
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
  const hasMultipleClubs = clubs.length > 1

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r shadow-xl lg:shadow-none">
      {/* Club Header - Prominent */}
      <div className="p-4 border-b">
        <div className="relative">
          <button
            onClick={() => hasMultipleClubs && setIsClubMenuOpen(!isClubMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
              hasMultipleClubs && "hover:bg-muted cursor-pointer",
              !hasMultipleClubs && "cursor-default"
            )}
          >
            {/* Club Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {currentClub?.logo ? (
                <Image
                  src={currentClub.logo}
                  alt={currentClub.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-bold text-lg truncate">
                {currentClub?.name || session?.user?.currentClubName || 'Min Klub'}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.currentClubRole === 'OWNER' && 'Ejer'}
                {session?.user?.currentClubRole === 'ADMIN' && 'Administrator'}
                {session?.user?.currentClubRole === 'MEMBER' && 'Medlem'}
              </p>
            </div>
            {hasMultipleClubs && (
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isClubMenuOpen && "rotate-180"
              )} />
            )}
          </button>

          {/* Club Switcher Dropdown */}
          {isClubMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsClubMenuOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-popover border rounded-lg shadow-lg py-2 mx-3">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  Skift klub
                </p>
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => handleSwitchClub(club.id)}
                    disabled={isSwitching}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2",
                      "hover:bg-accent transition-colors",
                      club.id === session?.user?.currentClubId && "bg-accent"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                      {club.logo ? (
                        <Image src={club.logo} alt="" width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="flex-1 text-left text-sm truncate">
                      {club.name}
                    </span>
                    {club.id === session?.user?.currentClubId && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
                <div className="border-t mt-2 pt-2">
                  <Link
                    href="/club/new"
                    onClick={() => {
                      setIsClubMenuOpen(false)
                      onClose?.()
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors"
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}

        {/* Admin Links */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t">
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            <Link
              href="/club/settings"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/club/settings' && "bg-primary text-primary-foreground"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Indstillinger</span>
            </Link>
            <Link
              href="/club/members"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/club/members' && "bg-primary text-primary-foreground"
              )}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Medlemmer</span>
            </Link>
            <Link
              href="/club/invite"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/club/invite' && "bg-primary text-primary-foreground"
              )}
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Inviter</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer - Powered by CourtPlanner */}
      <div className="py-4 border-t w-full">
        <p className="text-xs text-muted-foreground text-center w-full">
          Powered by CourtPlanner 2026
        </p>
      </div>
    </div>
  )
}
