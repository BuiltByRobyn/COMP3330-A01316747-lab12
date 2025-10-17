// server/routes/expenses.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db, schema } from '../db/client'
import { eq } from 'drizzle-orm'
import { s3 } from '../lib/s3' 
import { GetObjectCommand } from '@aws-sdk/client-s3' 
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const { expenses } = schema

// Example helpers (optional) — place at top of server/routes/expenses.ts
const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status)
const err = (c: any, message: string, status = 400) => c.json({ error: { message } }, status)

const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
})
const createExpenseSchema = expenseSchema.omit({ id: true })
const updateExpenseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  amount: z.number().int().positive().optional(),
  fileUrl: z.string().min(1).nullable().optional(),
  fileKey: z.string().min(1).optional(),
})

type ExpenseRow = typeof expenses.$inferSelect

const buildUpdatePayload = (input: z.infer<typeof updateExpenseSchema>) => {
  const updates: Partial<Pick<ExpenseRow, 'title' | 'amount' | 'fileUrl'>> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.amount !== undefined) updates.amount = input.amount
  if (Object.prototype.hasOwnProperty.call(input, 'fileKey')) {
    updates.fileUrl = input.fileKey ?? null
  }
  if (Object.prototype.hasOwnProperty.call(input, 'fileUrl')) {
    updates.fileUrl = input.fileUrl ?? null
  }
  return updates
}

const withSignedDownloadUrl = async (row: ExpenseRow): Promise<ExpenseRow> => {
  if (!row.fileUrl) return row
  if (row.fileUrl.startsWith('http://') || row.fileUrl.startsWith('https://')) {
    return row
  }

  try {
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: row.fileUrl,
      }),
      { expiresIn: 3600 },
    )
    return { ...row, fileUrl: signedUrl }
  } catch (error) {
    console.error('Failed to sign download URL', error)
    return row
  }
}


// Router
export const expensesRoute = new Hono()
  .get('/', async (c) => {
    const rows = await db.select().from(expenses)
    const expensesWithUrls = await Promise.all(rows.map(withSignedDownloadUrl))  
    return c.json({ expenses: expensesWithUrls }) 
  })

  .get('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1)
    if (!row) return err(c, 'Not found', 404)
    const expenseWithUrl = await withSignedDownloadUrl(row) 
    return c.json({ expense: expenseWithUrl }) 
  })

  // POST /api/expenses → create (validated)
  .post('/', zValidator('json', createExpenseSchema), async (c) => {
    const data = c.req.valid('json') // { title, amount }
    const [created] = await db.insert(expenses).values(data).returning()
    return ok(c,{ expense: created }, 201)
  })

    // PUT /api/expenses/:id → full replace
expensesRoute.put('/:id{\\d+}', zValidator('json', createExpenseSchema), async (c) => {
  const id = Number(c.req.param('id'))
    const [updated] = await db.update(expenses).set({ ...c.req.valid('json') }).where(eq(expenses.id, id)).returning()
    if (!updated) return err(c, 'Not found', 404)
    return ok(c,{ expense: updated }, 201)
})

// PATCH /api/expenses/:id → partial update
.patch('/:id{\\d+}', zValidator('json', updateExpenseSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const patch = c.req.valid('json')
    if (Object.keys(patch).length === 0) return err(c, 'Empty patch', 400)
    
    const updates = buildUpdatePayload(patch) 
    const [updated] = await db.update(expenses).set(updates).where(eq(expenses.id, id)).returning()
    if (!updated) return err(c, 'Not found', 404)
    
    const expenseWithUrl = await withSignedDownloadUrl(updated)  
    return ok(c, { expense: expenseWithUrl }) 
  })

  // DELETE /api/expenses/:id → remove
  .delete('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [deletedRow] = await db.delete(expenses).where(eq(expenses.id, id)).returning()
  if (!deletedRow) return err(c, 'Not found', 404)
  return ok(c, { deleted: deletedRow })
})


