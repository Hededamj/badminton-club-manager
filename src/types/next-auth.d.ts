import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      playerId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    playerId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    playerId: string | null
  }
}
