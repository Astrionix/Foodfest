import { type FormEvent, useEffect, useMemo, useState } from 'react'
import GenieAvatar, { type GenieMood } from './GenieAvatar'
import styles from './FoodGeniePanel.module.css'
import { useDailyMenu } from '../../hooks/useDailyMenu'
import { fetchLeaderboard } from '../../services/functions'
import { chatWithGenie, type GenieMessage as TransportMessage } from '../../services/genieClient'

type MessageRole = 'user' | 'genie'

type Message = {
  id: string
  role: MessageRole
  content: string
}

type LeaderboardEntry = {
  name: string
  dish: string
  score: number
}

const introLines = [
  'Ask me about the chilli meter. I dare you.',
  "Need recommendations? I have fiery opinions.",
  'Try the Guntur fry if you enjoy suffering.',
]

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

type FoodGeniePanelProps = {
  onClose?: () => void
}

function FoodGeniePanel({ onClose }: FoodGeniePanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: makeId(),
      role: 'genie',
      content: introLines[0],
    },
  ])
  const [input, setInput] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const { dishes } = useDailyMenu()
  const [mood, setMood] = useState<GenieMood>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: Message = { id: makeId(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    const transportHistory: TransportMessage[] = [...messages, userMessage].map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    }))

    void chatWithGenie(transportHistory, dishes, leaderboard)
      .then((response) => {
        const genieResponse: Message = {
          id: makeId(),
          role: 'genie',
          content: response.reply,
        }
        setMessages((prev) => [...prev, genieResponse])
        setMood(response.mood)

        if (voiceEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.reply)
          utterance.lang = 'en-IN'
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utterance)
        }
      })
      .catch((err) => {
        const fallback: Message = {
          id: makeId(),
          role: 'genie',
          content: 'The Food Genie is sulking. Try again in a moment.' + (err instanceof Error ? ` (${err.message})` : ''),
        }
        setMessages((prev) => [...prev, fallback])
        setMood('warning')
        setError('Connection dropped. Serving canned sarcasm instead.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const tip = useMemo(() => introLines[(messages.length + 1) % introLines.length], [messages.length])

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h2>Food Genie</h2>
          <p>{tip}</p>
        </div>
        <div className={styles.headerControls}>
          <label className={styles.voiceToggle}>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(event) => setVoiceEnabled(event.target.checked)}
            />
            <span>Voice replies</span>
          </label>
          {onClose ? (
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close Food Genie">
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className={styles.avatarWrap}>
        <GenieAvatar
          mood={mood}
          onTap={() => {
            setMood('delighted')
          }}
        />
        <span className={styles.avatarHint}>Tap the Genie to provoke sarcasm.</span>
      </div>

      <section className={styles.messages} aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'genie' ? styles.messageGenie : styles.messageUser}
          >
            {message.content}
          </div>
        ))}
        {loading ? <div className={styles.loading}>Summoning sarcastic wisdom…</div> : null}
        {error ? <div className={styles.error}>{error}</div> : null}
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          placeholder="Ask the Genie about spice, dishes, or survival tips..."
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default FoodGeniePanel
