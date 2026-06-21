import { getUsers, setLoggedInUser, clearLoggedInUser, getLoggedInUser } from './storage'

export function login(username, password) {
  const user = getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  )
  if (!user) {
    return { success: false, message: 'Invalid username or password.' }
  }
  setLoggedInUser(user)
  return { success: true, user }
}

export function logout() {
  clearLoggedInUser()
}

export function currentUser() {
  return getLoggedInUser()
}
