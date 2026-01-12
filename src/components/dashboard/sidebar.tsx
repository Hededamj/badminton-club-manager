'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  BarChart3,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ClubSelector } from './club-selector'

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

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r shadow-xl lg:shadow-none">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="CourtPlanner"
            width={50}
            height={50}
          />
          <div>
            <h1 className="text-xl font-bold text-[#005A9C]">
              CourtPlanner
            </h1>
          </div>
        </div>
      </div>

      {/* Club Selector */}
      <ClubSelector onNavigate={onClose} />

      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-accent transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log ud</span>
        </button>
      </div>
    </div>
  )
}
