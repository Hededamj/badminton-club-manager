import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 500 * 1024 // 500KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

// POST /api/clubs/logo - Upload club logo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.currentClubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or admin
    const membership = await prisma.clubMembership.findFirst({
      where: {
        userId: session.user.id,
        clubId: session.user.currentClubId,
        isActive: true,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Kun ejere og administratorer kan uploade logo' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { logo } = body

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo mangler' },
        { status: 400 }
      )
    }

    // Validate base64 image
    const matches = logo.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json(
        { error: 'Ugyldigt billedformat' },
        { status: 400 }
      )
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Check mime type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Kun JPG, PNG, WebP og SVG er tilladt' },
        { status: 400 }
      )
    }

    // Check file size (base64 is ~33% larger than original)
    const estimatedSize = (base64Data.length * 3) / 4
    if (estimatedSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Logo må max være 500KB' },
        { status: 400 }
      )
    }

    // Update club logo
    const club = await prisma.club.update({
      where: { id: session.user.currentClubId },
      data: { logo },
      select: {
        id: true,
        name: true,
        logo: true,
      },
    })

    return NextResponse.json({
      success: true,
      club,
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Kunne ikke uploade logo' },
      { status: 500 }
    )
  }
}

// DELETE /api/clubs/logo - Remove club logo
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.currentClubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or admin
    const membership = await prisma.clubMembership.findFirst({
      where: {
        userId: session.user.id,
        clubId: session.user.currentClubId,
        isActive: true,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Kun ejere og administratorer kan fjerne logo' },
        { status: 403 }
      )
    }

    // Remove club logo
    await prisma.club.update({
      where: { id: session.user.currentClubId },
      data: { logo: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing logo:', error)
    return NextResponse.json(
      { error: 'Kunne ikke fjerne logo' },
      { status: 500 }
    )
  }
}
