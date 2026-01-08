import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('=== TEST ENDPOINT CALLED ===')

  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('=== TEST POST ENDPOINT CALLED ===')

  try {
    const body = await request.json()
    console.log('Body received:', body)

    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'Found' : 'Not found')

    return NextResponse.json({
      success: true,
      receivedBody: body,
      hasSession: !!session,
      userRole: session?.user?.role
    })
  } catch (error) {
    console.error('Test POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
