import { useState } from 'react'
import styles from './FeedbackPage.module.css'

const emojis = [
  { id: 'fire', symbol: '🥵', label: 'Too Hot' },
  { id: 'wow', symbol: '🤩', label: 'Awesome' },
  { id: 'meh', symbol: '😐', label: 'Mild' },
  { id: 'sad', symbol: '😢', label: 'Needs Spice' },
]

function FeedbackPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Spice Feedback</h1>
        <p>Drop your emoji verdict and tell the Food Genie how the heat treated you.</p>
      </header>

      <section className={styles.emojiRow}>
        {emojis.map((emoji) => (
          <button
            key={emoji.id}
            type="button"
            onClick={() => setSelected(emoji.id)}
            className={selected === emoji.id ? `${styles.emoji} ${styles.emojiActive}` : styles.emoji}
          >
            <span aria-hidden>{emoji.symbol}</span>
            <span>{emoji.label}</span>
          </button>
        ))}
      </section>

      <section className={styles.voiceBox}>
        <p className={styles.voicePrompt}>Tap and hold to record your spicy confession (mocked).</p>
        <button type="button" className={styles.voiceButton}>
          🎤 Hold to record
        </button>
      </section>

      <section className={styles.commentBox}>
        <label htmlFor="feedback-text">Tell the Genie more</label>
        <textarea
          id="feedback-text"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Eg. The Rayalaseema ragi sangati left me speechless..."
        />
        <button type="button" className={styles.submitButton}>
          Submit Feedback
        </button>
      </section>
    </div>
  )
}

export default FeedbackPage
