import { useCallback, useEffect, useState } from 'react'
import { fetchAllData } from '../utils/sheetsApi'
import { useAuth } from './useAuth'
import { DataContext } from './dataContextObject'

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [technicians, setTechnicians] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAllData()
      setTechnicians(data.technicians)
      setTransactions(data.transactions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Synchronizes fetched data with the current auth session — refetch on
  // login, clear on logout. This is the canonical reason useEffect exists.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      refresh()
    } else {
      setTechnicians([])
      setTransactions([])
    }
  }, [user, refresh])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <DataContext.Provider value={{ technicians, transactions, loading, error, refresh }}>
      {children}
    </DataContext.Provider>
  )
}
