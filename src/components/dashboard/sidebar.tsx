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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Hareskov Badminton"
            width={50}
            height={50}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-[#005A9C]">
              HARESKOV
            </h1>
            <p className="text-sm font-semibold text-[#005A9C]">
              BADMINTON
            </p>
          </div>
        </div>
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
