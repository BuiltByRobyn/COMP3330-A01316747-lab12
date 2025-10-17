import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function AppCard() {
  return (
    <Card className="mt-6 font-mono">
      <CardHeader>
        <CardTitle>Frontend Ready</CardTitle>
        <CardDescription>
          Vite + React + Tailwind + ShadCN is configured with dark mode support.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Next lab: connect to your backend and render real data.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
            Theme Toggle ✅
          </span>
          <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-950 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-700/10">
            Dark Mode Ready
          </span>
        </div>
      </CardContent>
    </Card>
  )
}