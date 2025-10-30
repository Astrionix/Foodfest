import type { RealtimeChannel } from '@supabase/supabase-js'
import { create } from 'zustand'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export type FeedbackSummary = {
  average: number
  totalStars: number
  ratingCount: number
}

export type FeedbackSummaries = Record<string, FeedbackSummary>

type FeedbackRow = {
  dish_id: string
  rating: number
  user_id?: string
  created_at?: string
}

type FeedbackState = {
  ratings: FeedbackSummaries
  loading: boolean
  error: string | null
  fetchLeaderboard: () => Promise<void>
  submitRating: (dishId: string, value: number, userId?: string) => Promise<void>
  startLeaderboardStream: () => void
  stopLeaderboardStream: () => void
}

const FEEDBACK_TABLE = 'feedback_votes'

const mockLeaderboard: FeedbackSummaries = {
  'cucumber-boats': { average: 4, totalStars: 16, ratingCount: 4 },
  'nachos-salad': { average: 5, totalStars: 25, ratingCount: 5 },
  mocktail: { average: 5, totalStars: 20, ratingCount: 4 },
  'bhel-poori': { average: 4, totalStars: 12, ratingCount: 3 },
}

const aggregateRatings = (rows: FeedbackRow[]): FeedbackSummaries => {
  if (!rows.length) {
    return {}
  }

  const totals = new Map<string, { sum: number; count: number }>()

  for (const row of rows) {
    if (!row.dish_id) continue
    if (!totals.has(row.dish_id)) {
      totals.set(row.dish_id, { sum: 0, count: 0 })
    }
    const record = totals.get(row.dish_id)!
    record.sum += row.rating
    record.count += 1
  }

  const ratings: FeedbackSummaries = {}
  totals.forEach((value, key) => {
    if (value.count === 0) return
    const average = value.sum / value.count
    const boundedAverage = Math.max(0, Math.min(5, average))
    ratings[key] = {
      average: boundedAverage,
      totalStars: value.sum,
      ratingCount: value.count,
    }
  })
  return ratings
}

let leaderboardChannel: RealtimeChannel | null = null
let channelSubscribers = 0

const ensureLeaderboardChannel = (fetch: () => Promise<void>) => {
  if (!isSupabaseConfigured || leaderboardChannel) {
    return
  }

  leaderboardChannel = supabase
    .channel('feedback-leaderboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: FEEDBACK_TABLE }, () => {
      fetch().catch(() => {})
    })
    .subscribe()
}

const teardownLeaderboardChannel = async () => {
  if (!leaderboardChannel) {
    return
  }
  try {
    await supabase.removeChannel(leaderboardChannel)
  } catch {}
  leaderboardChannel = null
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  ratings: {},
  loading: false,
  error: null,
  fetchLeaderboard: async () => {
    if (!isSupabaseConfigured) {
      set({ ratings: mockLeaderboard, loading: false, error: 'Supabase is not configured. Using mock leaderboard.' })
      return
    }

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.from(FEEDBACK_TABLE).select('dish_id, rating')
      if (error) {
        throw error
      }
      const rows = (data ?? []) as FeedbackRow[]
      const ratings = aggregateRatings(rows)
      set({ ratings, loading: false })
    } catch (error) {
      set({ ratings: mockLeaderboard, loading: false, error: error instanceof Error ? error.message : 'Unable to reach rating service' })
    }
  },
  startLeaderboardStream: () => {
    if (typeof window === 'undefined') {
      return
    }

    channelSubscribers += 1

    if (!isSupabaseConfigured) {
      return
    }

    ensureLeaderboardChannel(get().fetchLeaderboard)
  },
  stopLeaderboardStream: () => {
    if (channelSubscribers > 0) {
      channelSubscribers -= 1
    }

    if (channelSubscribers === 0) {
      void teardownLeaderboardChannel()
    }
  },
  submitRating: async (dishId, value, userId) => {
    const state = get()
    const previous = state.ratings[dishId]
    const currentTotalStars = previous?.totalStars ?? 0
    const currentCount = previous?.ratingCount ?? 0
    const nextTotalStars = currentTotalStars + value
    const nextCount = currentCount + 1
    const optimistic = {
      ...state.ratings,
      [dishId]: {
        average: Math.max(0, Math.min(5, nextTotalStars / nextCount)),
        totalStars: nextTotalStars,
        ratingCount: nextCount,
      },
    }
    set({ ratings: optimistic })

    if (!isSupabaseConfigured) {
      set({ error: 'Supabase is not configured. Rating stored locally only.' })
      return
    }

    try {
      const { error } = await supabase.from(FEEDBACK_TABLE).insert({ dish_id: dishId, rating: value, user_id: userId })
      if (error) {
        throw error
      }
      await get().fetchLeaderboard()
    } catch (error) {
      set((current) => {
        const updatedRatings = { ...current.ratings }
        if (previous) {
          updatedRatings[dishId] = previous
        } else {
          delete updatedRatings[dishId]
        }

        return {
          ratings: updatedRatings,
          error: error instanceof Error ? error.message : 'Unable to reach rating service',
        }
      })
    }
  },
}))
