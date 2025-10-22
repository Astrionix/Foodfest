import styles from './LogoMark.module.css'

function LogoMark() {
  return (
    <div className={styles.logoWrap} aria-label="ATRIA RUCHULU logo">
      <span className={styles.symbol}>AR</span>
      <span className={styles.flame} aria-hidden>🔥</span>
    </div>
  )
}

export default LogoMark
