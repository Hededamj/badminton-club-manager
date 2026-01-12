import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/clubs/invitations - Get all invitations for current club
export async function GET(req: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const invitations = await prisma.clubInvitation.findMany({
      where: { clubId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

// POST /api/clubs/invitations - Create a new invitation
export async function POST(req: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const { email, role } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ugyldig email adresse' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ADMIN', 'MEMBER']
    const inviteRole = validRoles.includes(role) ? role : 'MEMBER'

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      const existingMembership = await prisma.clubMembership.findFirst({
        where: {
          userId: existingUser.id,
          clubId,
          isActive: true,
        },
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: 'Denne bruger er allerede medlem af klubben' },
          { status: 400 }
        )
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.clubInvitation.findFirst({
      where: {
        clubId,
        email: email.toLowerCase(),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Der findes allerede en aktiv invitation til denne email' },
        { status: 400 }
      )
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.clubInvitation.create({
      data: {
        clubId,
        email: email.toLowerCase(),
        role: inviteRole,
        expiresAt,
        createdBy: session.user.id,
      },
      include: {
        club: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    // Generate invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/join/${invitation.token}`

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
        clubName: invitation.club.name,
      },
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

// DELETE /api/clubs/invitations - Delete/revoke an invitation
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const { searchParams } = new URL(req.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Verify invitation belongs to current club
    const invitation = await prisma.clubInvitation.findFirst({
      where: {
        id: invitationId,
        clubId,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    await prisma.clubInvitation.delete({
      where: { id: invitationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    )
  }
}
