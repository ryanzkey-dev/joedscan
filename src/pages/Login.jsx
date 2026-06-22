import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import xqPortalLogo from '../assets/xq-portal-logo.jpg'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const result = await login(username, password)

    setSubmitting(false)
    if (!result.success) {
      setError(result.message)
      return
    }
    navigate(result.user.role === 'admin' ? '/admin' : '/technician')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-red-600 via-orange-500 to-orange-400 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <img
            src={xqPortalLogo}
            alt="XQ Portal Logo"
            className="mx-auto h-16 w-16 rounded-xl object-contain md:h-20 md:w-20"
          />
          <h1 className="mt-3 text-2xl font-bold text-gray-800 md:text-3xl">XQ PORTAL</h1>
          <p className="mt-1 text-sm text-gray-500">Dashboard Login</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Default admin: <span className="font-mono">admin</span> /{' '}
          <span className="font-mono">joed123</span>
        </p>
      </div>
    </div>
  )
}
