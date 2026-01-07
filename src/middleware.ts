import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const pathname = req.nextUrl.pathname

      // Public routes
      if (pathname === '/login') {
        return true
      }

      // Admin routes
      if (pathname.startsWith('/dashboard') && pathname.includes('/admin')) {
        return token?.role === 'ADMIN'
      }

      // Protected routes (any authenticated user)
      return !!token
    },
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
