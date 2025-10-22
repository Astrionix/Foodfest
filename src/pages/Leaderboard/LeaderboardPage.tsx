import styles from './LeaderboardPage.module.css'

const entries = [
  { name: 'Spice Shankar', dish: 'Guntur Chili Chicken Fry', score: 9800 },
  { name: 'Mirapakaya Maya', dish: 'Rayalaseema Ragi Sangati', score: 8900 },
  { name: 'Coastal Charan', dish: 'Royyala Iguru', score: 8450 },
]

function LeaderboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Spiciest Fans</h1>
        <p>Earn points by surviving chilli challenges and submitting your fiery victories.</p>
      </header>

      <section className={styles.board}>
        {entries.map((entry, index) => (
          <article key={entry.name} className={styles.row}>
            <div className={styles.rank}>{index + 1}</div>
            <div className={styles.details}>
              <h2>{entry.name}</h2>
              <p>{entry.dish}</p>
            </div>
            <div className={styles.score}>{entry.score.toLocaleString()} pts</div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default LeaderboardPage
