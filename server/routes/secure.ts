// server/routes/secure.ts
import { Hono } from 'hono'
import { requireAuth } from '../auth/requireAuth'
import type { Variables } from '../types/hono'


export const secureRoute = new Hono<{ Variables: Variables }>()
  .get('/profile', async (c) => {
    const err = await requireAuth(c)
    if (err) return err
    const user = c.get('user')
    return c.json({ user })
  })