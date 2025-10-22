import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.length > 0)

let app: FirebaseApp | null = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
}

export const firebaseAvailable = Boolean(app)
export const db: Firestore | null = app ? getFirestore(app) : null
export const functions = app ? getFunctions(app) : null

export function subscribeToTodaysMenu(
  onData: (dishes: DocumentData[]) => void,
  onError: (error: unknown) => void,
) {
  if (!firebaseAvailable || !db) {
    onData([])
    return () => {}
  }
  const menuQuery = query(collection(db, 'dailyMenus'), where('active', '==', true))
  return onSnapshot(menuQuery, (snapshot) => {
    const dishes = snapshot.docs.flatMap((dayDoc) => {
      const items = dayDoc.get('dishes') as DocumentData[] | undefined
      return items?.filter((item) => item.available !== false) ?? []
    })
    onData(dishes)
  }, onError)
}

export function markDishUnavailable(dayId: string, dishId: string) {
  if (!firebaseAvailable || !db) {
    return Promise.reject(new Error('Firebase not configured'))
  }
  return updateDoc(doc(db, 'dailyMenus', dayId), {
    [`dishes.${dishId}.available`]: false,
  })
}

export const submitFeedback = functions ? httpsCallable(functions, 'submitFeedback') : null
export const getLeaderboard = functions ? httpsCallable(functions, 'getLeaderboard') : null
