import { httpsCallable } from 'firebase/functions'
import { functions, firebaseAvailable } from './firebase'

type SubmitFeedbackPayload = {
  dishId: string | null
  sentiment: string
  comment?: string
  emoji: string
}

type SubmitFeedbackResult = {
  success: boolean
}

type LeaderboardEntry = {
  name: string
  dish: string
  score: number
}

type LeaderboardResponse = {
  entries: LeaderboardEntry[]
}

const noFunctionsError = () => {
  throw new Error('Firebase functions not available. Check configuration.')
}

export async function sendFeedback(payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResult> {
  if (!firebaseAvailable || !functions) {
    noFunctionsError()
  }
  const callable = httpsCallable<SubmitFeedbackPayload, SubmitFeedbackResult>(functions!, 'submitFeedback')
  const result = await callable(payload)
  return result.data
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!firebaseAvailable || !functions) {
    noFunctionsError()
  }
  const callable = httpsCallable<undefined, LeaderboardResponse>(functions!, 'getLeaderboard')
  const result = await callable()
  return result.data.entries
}
