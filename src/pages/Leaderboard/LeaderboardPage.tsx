import { useEffect, useMemo } from 'react'
import styles from './LeaderboardPage.module.css'
import { feedbackDishes } from '../../data/feedbackDishes'
import { useFeedbackStore } from '../../store/useFeedbackStore'

const MAX_STARS = 5

function LeaderboardPage() {
  const ratings = useFeedbackStore((state) => state.ratings)
  const fetchLeaderboard = useFeedbackStore((state) => state.fetchLeaderboard)
  const startLeaderboardStream = useFeedbackStore((state) => state.startLeaderboardStream)
  const stopLeaderboardStream = useFeedbackStore((state) => state.stopLeaderboardStream)

  useEffect(() => {
    fetchLeaderboard().catch(() => {})
    startLeaderboardStream()

    return () => {
      stopLeaderboardStream()
    }
  }, [fetchLeaderboard, startLeaderboardStream, stopLeaderboardStream])

  const leaderboard = useMemo(() => {
    return feedbackDishes
      .map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        summary: ratings[dish.id],
      }))
      .sort((a, b) => {
        const aTotal = a.summary?.totalStars ?? 0
        const bTotal = b.summary?.totalStars ?? 0
        if (bTotal !== aTotal) {
          return bTotal - aTotal
        }
        const aAverage = a.summary?.average ?? 0
        const bAverage = b.summary?.average ?? 0
        if (bAverage !== aAverage) {
          return bAverage - aAverage
        }
        return a.name.localeCompare(b.name)
      })
  }, [ratings])

  const hasAnyRatings = leaderboard.some((entry) => (entry.summary?.ratingCount ?? 0) > 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Flavor Leaderboard</h1>
        <p>
          Star counts from live feedback determine which dishes are reigning supreme. Keep rating to shuffle the
          ranks.
        </p>
      </header>

      <section className={styles.board}>
        {leaderboard.map((entry, index) => (
          <article
            key={entry.id}
            className={`${styles.row} ${(entry.summary?.ratingCount ?? 0) === 0 ? styles.rowPending : ''}`.trim()}
          >
            <div className={styles.rank}>{index + 1}</div>
            <div className={styles.details}>
              <h2>{entry.name}</h2>
              <p>{entry.description}</p>
            </div>
            <div
              className={styles.score}
              aria-label={
                entry.summary
                  ? `${entry.summary.average.toFixed(1)} out of ${MAX_STARS} stars from ${entry.summary.ratingCount} ratings`
                  : 'Awaiting feedback'
              }
            >
              {entry.summary ? (
                <>
                  <span className={styles.scoreStars}>
                    {(() => {
                      const rounded = Math.round(entry.summary!.average)
                      const filled = '★'.repeat(rounded)
                      const empty = '☆'.repeat(Math.max(MAX_STARS - rounded, 0))
                      return `${filled}${empty}`
                    })()}
                  </span>
                  <span className={styles.scoreTotal}>{`${entry.summary.average.toFixed(1)}/${MAX_STARS}`}</span>
                  <span className={styles.scoreMeta}>{`${entry.summary.totalStars.toLocaleString()} ★ · ${
                    entry.summary.ratingCount
                  } rating${entry.summary.ratingCount === 1 ? '' : 's'}`}</span>
                </>
              ) : (
                <span className={styles.scoreEmpty}>Awaiting feedback</span>
              )}
            </div>
          </article>
        ))}
        {!hasAnyRatings ? (
          <p className={styles.empty}>No feedback yet — rate a dish to start the leaderboard.</p>
        ) : null}
      </section>
    </div>
  )
}

export default LeaderboardPage
