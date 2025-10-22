import { useEffect, useState } from 'react'
import FoodGeniePanel from './FoodGeniePanel'
import styles from './FoodGenieDock.module.css'

const STORAGE_KEY = 'atria-genie-open'

function FoodGenieDock() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(STORAGE_KEY) === '1'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (open) {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [open])

  return (
    <div className={styles.dock}>
      <div className={open ? `${styles.panelWrap} ${styles.panelWrapOpen}` : styles.panelWrapClosed}>
        {open ? <FoodGeniePanel onClose={() => setOpen(false)} /> : null}
      </div>
      <button
        type="button"
        className={open ? `${styles.toggle} ${styles.toggleActive}` : styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close Food Genie' : 'Open Food Genie'}
        aria-pressed={open}
      >
        <span className={styles.icon} aria-hidden>
          🧞‍♂️
        </span>
        <span className={styles.label}>{open ? 'Hide Genie' : 'Food Genie'}</span>
      </button>
    </div>
  )
}

export default FoodGenieDock
