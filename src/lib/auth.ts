import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { player: true }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Get user's first/default club membership
        const membership = await db.clubMembership.findFirst({
          where: { userId: user.id, isActive: true },
          include: { club: true },
          orderBy: { joinedAt: 'asc' }
        })

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          playerId: user.playerId,
          name: user.player?.name || user.email,
          // Club info
          currentClubId: membership?.clubId || null,
          currentClubRole: membership?.role || null,
          currentClubPlayerId: membership?.playerId || null,
          currentClubName: membership?.club.name || null,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.playerId = user.playerId
        token.currentClubId = user.currentClubId
        token.currentClubRole = user.currentClubRole
        token.currentClubPlayerId = user.currentClubPlayerId
        token.currentClubName = user.currentClubName
      }

      // Allow club switching via session update
      if (trigger === 'update' && session?.clubId) {
        const membership = await db.clubMembership.findFirst({
          where: {
            userId: token.sub!,
            clubId: session.clubId,
            isActive: true,
          },
          include: { club: true }
        })

        if (membership) {
          token.currentClubId = membership.clubId
          token.currentClubRole = membership.role
          token.currentClubPlayerId = membership.playerId
          token.currentClubName = membership.club.name
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.playerId = token.playerId as string | null
        session.user.currentClubId = token.currentClubId as string | null
        session.user.currentClubRole = token.currentClubRole as string | null
        session.user.currentClubPlayerId = token.currentClubPlayerId as string | null
        session.user.currentClubName = token.currentClubName as string | null
      }
      return session
    }
  }
}
