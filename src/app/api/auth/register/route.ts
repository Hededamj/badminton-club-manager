import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

// POST /api/auth/register - Register a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ugyldig email adresse' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Adgangskode skal være mindst 6 tegn' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Der findes allerede en bruger med denne email' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'PLAYER', // Default role
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Kunne ikke oprette bruger' },
      { status: 500 }
    )
  }
}
