// /frontend/src/routes/expenses.detail.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { UploadExpenseForm } from '../components/UploadExpenseForm'

type Expense = { id: number; title: string; amount: number; fileUrl?: string | null }
const API = '/api'

export default function ExpenseDetailPage() {
  const { id } = useParams({ strict: false })
  const expenseId = Number(id)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses', expenseId],
    queryFn: async () => {
      const res = await fetch(`${API}/expenses/${expenseId}`, {
        credentials: 'include', 
      })
      if (!res.ok) throw new Error(`Failed to fetch expense with id ${expenseId}`)
      return res.json() as Promise<{ expense: Expense }>
    },
  })

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses', expenseId] })
  }

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>
  if (isError) return <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>

  const item = data?.expense

  if (!item) {
    return <p className="p-6 text-sm text-muted-foreground">Expense not found.</p>
  }

  return (
    <section className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Expense Details */}
      <div className="rounded border bg-background text-foreground p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Amount</p>
        <p className="text-lg tabular-nums">#{item.amount}</p>
      </div>

      {/* Receipt Section */}
      <div className="rounded border bg-background text-foreground p-6">
        <h3 className="text-lg font-semibold mb-4">Receipt</h3>
        
        {item.fileUrl ? (
          <div className="mb-4">
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              📄 Download Receipt
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            No receipt uploaded yet.
          </p>
        )}

        <UploadExpenseForm 
          expenseId={expenseId} 
          onSuccess={handleUploadSuccess}
        />
      </div>
    </section>
  )
}