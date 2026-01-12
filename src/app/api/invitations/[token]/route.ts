import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/invitations/[token] - Get invitation details (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.clubInvitation.findUnique({
      where: { token },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (invitation.usedAt) {
      return NextResponse.json(
        { error: 'Denne invitation er allerede brugt', code: 'ALREADY_USED' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Denne invitation er udløbet', code: 'EXPIRED' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      club: invitation.club,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}

// POST /api/invitations/[token] - Accept invitation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Du skal være logget ind for at acceptere invitationen', code: 'NOT_LOGGED_IN' },
        { status: 401 }
      )
    }

    const invitation = await prisma.clubInvitation.findUnique({
      where: { token },
      include: {
        club: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (invitation.usedAt) {
      return NextResponse.json(
        { error: 'Denne invitation er allerede brugt', code: 'ALREADY_USED' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Denne invitation er udløbet', code: 'EXPIRED' },
        { status: 400 }
      )
    }

    // Check if invitation email matches logged in user
    if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        {
          error: `Denne invitation er sendt til ${invitation.email}. Du er logget ind som ${session.user.email}.`,
          code: 'EMAIL_MISMATCH'
        },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.clubMembership.findFirst({
      where: {
        userId: session.user.id,
        clubId: invitation.clubId,
      },
    })

    if (existingMembership) {
      if (existingMembership.isActive) {
        return NextResponse.json(
          { error: 'Du er allerede medlem af denne klub', code: 'ALREADY_MEMBER' },
          { status: 400 }
        )
      } else {
        // Reactivate membership
        await prisma.clubMembership.update({
          where: { id: existingMembership.id },
          data: {
            isActive: true,
            role: invitation.role,
          },
        })
      }
    } else {
      // Create new membership
      await prisma.clubMembership.create({
        data: {
          userId: session.user.id,
          clubId: invitation.clubId,
          role: invitation.role,
          isActive: true,
        },
      })
    }

    // Mark invitation as used
    await prisma.clubInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      club: {
        id: invitation.club.id,
        name: invitation.club.name,
        slug: invitation.club.slug,
      },
      role: invitation.role,
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
