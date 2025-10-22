import { motion } from 'framer-motion'
import { useExperienceStore } from '../../store/useExperienceStore'
import styles from './ChallengeBoard.module.css'

function ChallengeBoard() {
  const challenges = useExperienceStore((state) => state.challenges)
  const toggle = useExperienceStore((state) => state.toggleChallengeStatus)

  return (
    <section className={styles.board}>
      <header className={styles.header}>
        <h2>Spice Challenges</h2>
        <p>Unlock chilli feats to climb the leaderboard and earn bonus points.</p>
      </header>
      <div className={styles.list}>
        {challenges.map((challenge, index) => (
          <motion.article
            key={challenge.id}
            className={`${styles.card} ${styles[challenge.status]}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.45, ease: 'easeOut' }}
          >
            <div>
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
            </div>
            <div className={styles.meta}>
              <span>{challenge.reward} pts</span>
              <button type="button" onClick={() => toggle(challenge.id)}>
                {challenge.status === 'completed' ? 'Mark available' : 'Mark complete'}
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default ChallengeBoard
