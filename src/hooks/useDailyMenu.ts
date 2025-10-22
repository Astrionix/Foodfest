import { useEffect, useState } from 'react'
import { subscribeToTodaysMenu } from '../services/firebase'

export type DailyDish = {
  id: string
  name: string
  category: 'veg' | 'non-veg'
  spice: number
  price: number
  description?: string
  available: boolean
  image?: string
  trivia?: string
}

export function useDailyMenu() {
  const [dishes, setDishes] = useState<DailyDish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToTodaysMenu(
      (items) => {
        setDishes(items as DailyDish[])
        setLoading(false)
      },
      (err) => {
        setError(err as Error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [])

  return { dishes, loading, error }
}
