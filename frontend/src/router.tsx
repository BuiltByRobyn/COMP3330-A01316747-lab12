import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import { ExpensesList } from './routes/expenses.list'
import ExpenseDetailPage from './routes/expenses.detail'
import ExpenseNewPage from './routes/expenses.new'

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <p>Home Page</p>,
})

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: ExpensesList,
})

const expenseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/$id',
  component: ExpenseDetailPage,
  })

const expenseNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/new',
  component: ExpenseNewPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  expensesRoute, 
  expenseDetailRoute, 
  expenseNewRoute
])

export const router = createRouter({ 
  routeTree,
  defaultNotFoundComponent: () => <p>Page not found</p>,
  defaultErrorComponent: ({ error }) => <p>Error: {(error as Error).message}</p>,
})


export function AppRouter() {
  return <RouterProvider router={router} />
}
