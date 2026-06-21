import { setLoggedInUser, clearLoggedInUser, getLoggedInUser } from './storage'
import { fetchAllData } from './sheetsApi'

const ADMIN_CREDENTIAL = { username: 'admin', password: 'joed123' }
const ADMIN_USER = {
  id: 'ADMIN',
  username: 'admin',
  fullName: 'Administrator',
  role: 'admin',
}

export async function login(username, password) {
  if (
    username.toLowerCase() === ADMIN_CREDENTIAL.username &&
    password === ADMIN_CREDENTIAL.password
  ) {
    setLoggedInUser(ADMIN_USER)
    return { success: true, user: ADMIN_USER }
  }

  let technicians
  try {
    const data = await fetchAllData()
    technicians = data.technicians
  } catch (err) {
    return { success: false, message: `Could not reach Google Sheet: ${err.message}` }
  }

  const match = technicians.find(
    (t) => t.username.toLowerCase() === username.toLowerCase() && t.password === password
  )

  if (!match) {
    return { success: false, message: 'Invalid username or password.' }
  }

  const user = {
    id: match.id,
    username: match.username,
    fullName: match.fullName,
    address: match.address,
    role: 'technician',
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
