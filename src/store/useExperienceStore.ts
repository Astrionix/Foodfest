import { create } from 'zustand'

export type ChallengeStatus = 'locked' | 'available' | 'completed'

export type Challenge = {
  id: string
  title: string
  description: string
  reward: number
  status: ChallengeStatus
}

type ExperienceState = {
  points: number
  completedDishes: string[]
  challenges: Challenge[]
  toggleChallengeStatus: (id: string) => void
  addPoints: (value: number) => void
  registerDish: (dishId: string) => void
  markChallengeCompleted: (id: string) => void
}

const initialChallenges: Challenge[] = [
  {
    id: 'guntur-endurance',
    title: 'Survive the Guntur Chili Fry',
    description: 'Finish the plate without reaching for water for 2 minutes.',
    reward: 500,
    status: 'available',
  },
  {
    id: 'gongura-guru',
    title: 'Gongura Guru',
    description: 'Spot three facts about gongura in the trivia cards.',
    reward: 350,
    status: 'locked',
  },
  {
    id: 'ragi-rumble',
    title: 'Ragi Rumble',
    description: 'Pair ragi sangati with two curries and share feedback.',
    reward: 420,
    status: 'locked',
  },
]

export const useExperienceStore = create<ExperienceState>((set) => ({
  points: 0,
  completedDishes: [],
  challenges: initialChallenges,
  toggleChallengeStatus: (id) =>
    set((state) => {
      let updatedPoints = state.points
      const challenges = state.challenges.map((challenge) => {
        if (challenge.id !== id) return challenge
        if (challenge.status === 'available') {
          updatedPoints += challenge.reward
          return { ...challenge, status: 'completed' }
        }
        if (challenge.status === 'locked') {
          return { ...challenge, status: 'available' }
        }
        return challenge
      })
      return {
        challenges,
        points: updatedPoints,
      }
    }),
  addPoints: (value) =>
    set((state) => ({
      points: state.points + value,
    })),
  registerDish: (dishId) =>
    set((state) =>
      state.completedDishes.includes(dishId)
        ? state
        : {
            completedDishes: [...state.completedDishes, dishId],
            points: state.points + 120,
            challenges: state.challenges.map((challenge) => {
              if (challenge.id === 'guntur-endurance' && challenge.status === 'locked') {
                return { ...challenge, status: 'available' }
              }
              return challenge
            }),
          },
    ),
  markChallengeCompleted: (id) =>
    set((state) => {
      let updatedPoints = state.points
      const challenges = state.challenges.map((challenge) => {
        if (challenge.id !== id || challenge.status === 'completed') return challenge
        if (challenge.status === 'available') {
          updatedPoints += challenge.reward
          return { ...challenge, status: 'completed' }
        }
        return challenge
      })
      return {
        challenges,
        points: updatedPoints,
      }
    }),
}))
