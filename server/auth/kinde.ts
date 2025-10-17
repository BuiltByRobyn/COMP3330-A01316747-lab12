// server/auth/kinde.ts
import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { SessionManager } from '@kinde-oss/kinde-typescript-sdk'
import { createKindeServerClient, GrantType } from '@kinde-oss/kinde-typescript-sdk'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
  authDomain: process.env.KINDE_ISSUER_URL!,
  clientId: process.env.KINDE_CLIENT_ID!,
  clientSecret: process.env.KINDE_CLIENT_SECRET!,
  redirectURL: process.env.KINDE_REDIRECT_URI!,
  logoutRedirectURL: FRONTEND_URL,
})

// Fixed: Use getCookie instead of c.req.cookie
export function sessionFromHono(c: any): SessionManager {
  return {
    async getSessionItem(key: string) {
      return getCookie(c, key) ?? null
    },
    async setSessionItem(key: string, value: unknown) {
      setCookie(c, key, String(value), { httpOnly: true, sameSite: 'lax', path: '/' })
    },
    async removeSessionItem(key: string) {
      deleteCookie(c, key)
    },
    async destroySession() {
      for (const k of ['access_token', 'id_token', 'refresh_token', 'session']) {
        deleteCookie(c, k)
      }
    },
  }
}

export const authRoute = new Hono()
  .get('/login', async (c) => {
    try {
      console.log('Login route hit')
      const session = sessionFromHono(c)
      const url = await kindeClient.login(session)
      console.log('Redirecting to:', url.toString())
      return c.redirect(url.toString())
    } catch (error) {
      console.error('Login error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: 'Login failed', details: message }, 500)
    }
  })

  .get('/callback', async (c) => {
    try {
      console.log('Callback route hit')
      const session = sessionFromHono(c)
      await kindeClient.handleRedirectToApp(session, new URL(c.req.url))
      console.log('Callback successful, redirecting to frontend')
      return c.redirect(`${FRONTEND_URL}/expenses`)
    } catch (error) {
      console.error('Callback error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: 'Callback failed', details: message }, 500)
    }
  })

.get('/logout', async (c) => {
  try {
    console.log('Logout route hit')
    const session = sessionFromHono(c)
    
    const logoutUrl = await kindeClient.logout(session)
    console.log('Kinde logout URL:', logoutUrl.toString())
    
    return c.redirect(logoutUrl.toString())
  } catch (error) {
    console.error('Logout error:', error)
    const session = sessionFromHono(c)
    await session.destroySession()
    return c.redirect(FRONTEND_URL)
  }
})

  .get('/me', async (c) => {
    try {
      console.log('Me route hit')
      const session = sessionFromHono(c)
      const profile = await kindeClient.getUserProfile(session)
      console.log('Profile retrieved:', profile)
      return c.json({ user: profile })
    } catch (error) {
      console.error('Me route error:', error)
      return c.json({ user: null })
    }
  })