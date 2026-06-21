import { useState } from 'react'
import * as authApi from '../utils/auth'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.currentUser())

  const login = (username, password) => {
    const result = authApi.login(username, password)
    if (result.success) setUser(result.user)
    return result
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
