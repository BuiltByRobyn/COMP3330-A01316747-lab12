// import { AddExpenseForm } from './components/AddExpenseForm'
// import { ExpensesList } from './components/ExpensesList'
import { Link, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'



export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/login'
  }

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/api/auth/logout'
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Expenses App</h1>
          <nav className="flex gap-4 text-sm items-center">
            <Link to="/">Home</Link>
            <Link to="/expenses">Expenses</Link>
            <Link to="/expenses/new">New</Link>
            
            {/* Auth status and buttons */}
            {loading ? (
              <span className="text-gray-500">...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user.given_name || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </nav>
        </header>
      

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
