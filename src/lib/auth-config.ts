/**
 * NextAuth: демо-провайдер и привязка playerId к JWT/session.
 * В продакшене задайте NEXTAUTH_SECRET и NEXTAUTH_URL (или AUTH_TRUST_HOST у прокси).
 * Локально см. дефолты в `next.config.ts` и `.env.example` — иначе возможен `/api/auth/error`.
 * Сейвы: при ENFORCE_SAVE_AUTH=true или NODE_ENV=production (и не false) playerId только из сессии.
 * Клиент: NEXT_PUBLIC_ENFORCE_SAVE_AUTH зеркалирует поведение для bootstrap signIn.
 */

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const demoPlayerId = process.env.NEXT_PUBLIC_DEMO_PLAYER_ID ?? 'demo-player'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'demo',
      name: 'Demo',
      credentials: {},
      async authorize() {
        return {
          id: demoPlayerId,
          name: 'Player',
          email: `${demoPlayerId}@local`,
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-change-me',
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}
