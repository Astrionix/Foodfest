import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './ExperiencePage.module.css'

const heroChips = [
  'Guntur Chillies',
  'Gongura Greens',
  'Rayalaseema Spice',
  'Coastal Curries',
]

function ExperiencePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <motion.div
          className={styles.heroGlow}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        />
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className={styles.kicker}>Welcome to ATRIA RUCHULU</p>
          <h1 className={styles.title}>Andhra flavours, dialed up with immersive tech.</h1>
          <p className={styles.subtitle}>
            Scan the QR, brace for the flames, and let our Food Genie serve sarcasm with every bite.
          </p>
          <div className={styles.chipRow}>
            {heroChips.map((chip) => (
              <motion.span
                key={chip}
                className={styles.chip}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {chip}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className={styles.cta}>
        <div>
          <h3>Ready to test your chilli limits?</h3>
          <p>Head to the menu to unlock the Guntur heat and climb the spiciest leaderboard.</p>
        </div>
        <Link className={styles.ctaButton} to="/menu">
          Enter Menu
        </Link>
      </section>
    </div>
  )
}

export default ExperiencePage
