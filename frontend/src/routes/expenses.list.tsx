// /frontend/src/routes/expenses.list.tsx
import { ExpensesList } from '../components/ExpensesList'
import { AddExpenseForm } from '../components/AddExpenseForm'

export default function ExpensesListPage() {
  return (
    <section className="mx-auto max-w-3xl p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses</h2>
      </header>

      {/* Add form for testing */}
      <AddExpenseForm />

      {/* Use your new component with optimistic updates */}
      <ExpensesList />
    </section>
  )
}