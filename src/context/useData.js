import { useContext } from 'react'
import { DataContext } from './dataContextObject'

export function useData() {
  return useContext(DataContext)
}
