import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If user is authenticated but has no club, redirect to onboarding
    // (except for onboarding, join, club/new, and API routes)
    if (token && !token.currentClubId) {
      const allowedPaths = ['/onboarding', '/join', '/club/new', '/api']
      const isAllowed = allowedPaths.some(path => pathname.startsWith(path))

      if (!isAllowed && pathname !== '/') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname

        // Public routes
        if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/join/')) {
          return true
        }

        // Onboarding is allowed for authenticated users
        if (pathname === '/onboarding') {
          return !!token
        }

        // Admin routes
        if (pathname.startsWith('/dashboard') && pathname.includes('/admin')) {
          return token?.role === 'ADMIN'
        }

        // Protected routes (any authenticated user)
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/players/:path*',
    '/trainings/:path*',
    '/tournaments/:path*',
    '/statistics/:path*',
    '/club/:path*',
    '/onboarding',
    '/join/:path*',
  ]
}
