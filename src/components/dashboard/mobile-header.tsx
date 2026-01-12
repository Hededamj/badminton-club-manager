'use client'

import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b z-30 flex items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="mr-2"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="CourtPlanner"
          width={32}
          height={32}
        />
        <div>
          <h1 className="text-sm font-bold text-[#005A9C]">HARESKOV</h1>
        </div>
      </div>
    </header>
  )
}
