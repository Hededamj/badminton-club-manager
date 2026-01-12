'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DesktopHeader() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="hidden lg:flex h-14 bg-card border-b items-center justify-end px-6">
      {/* User Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#005A9C]/10 flex items-center justify-center">
            <span className="text-sm font-medium text-[#005A9C]">{userInitial}</span>
          </div>
          <span className="text-sm font-medium max-w-[150px] truncate">
            {session?.user?.email}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
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
