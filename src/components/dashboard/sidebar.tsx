'use client'

import Link from 'next/link'
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

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Spillere',
    href: '/dashboard/players',
    icon: Users
  },
  {
    title: 'Træninger',
    href: '/dashboard/trainings',
    icon: Calendar
  },
  {
    title: 'Turneringer',
    href: '/dashboard/tournaments',
    icon: Trophy
  },
  {
    title: 'Statistik',
    href: '/dashboard/statistics',
    icon: BarChart3
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Badminton Club
        </h1>
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
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
