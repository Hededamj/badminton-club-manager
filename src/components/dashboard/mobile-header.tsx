'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Menu, Building2, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Club {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
}

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { data: session } = useSession()
  const [currentClub, setCurrentClub] = useState<Club | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    fetchCurrentClub()
  }, [session?.user?.currentClubId])

  async function fetchCurrentClub() {
    if (!session?.user?.currentClubId) return

    try {
      const response = await fetch('/api/clubs')
      if (response.ok) {
        const clubs = await response.json()
        const club = clubs.find((c: Club) => c.id === session?.user?.currentClubId)
        setCurrentClub(club || null)
      }
    } catch (error) {
      console.error('Error fetching club:', error)
    }
  }

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#005A9C] z-30 flex items-center justify-between px-3">
      {/* Left: Menu + Club */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 text-white hover:bg-white/20"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
            {currentClub?.logo ? (
              <Image
                src={currentClub.logo}
                alt={currentClub.name}
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="font-semibold text-sm truncate max-w-[120px] text-white">
            {currentClub?.name || session?.user?.currentClubName || 'Min Klub'}
          </span>
        </div>
      </div>

      {/* Right: User Profile */}
      <div className="relative">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{userInitial}</span>
          </div>
          <ChevronDown className={cn(
            "w-3 h-3 text-white/70 transition-transform",
            isUserMenuOpen && "rotate-180"
          )} />
        </button>

        {/* User Dropdown */}
        {isUserMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-popover border rounded-lg shadow-lg py-2">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium truncate">{session?.user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.currentClubRole === 'OWNER' && 'Ejer'}
                  {session?.user?.currentClubRole === 'ADMIN' && 'Administrator'}
                  {session?.user?.currentClubRole === 'MEMBER' && 'Medlem'}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log ud
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
