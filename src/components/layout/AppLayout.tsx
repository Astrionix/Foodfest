import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'
import LogoMark from '../shared/LogoMark'
import { useExperienceStore } from '../../store/useExperienceStore'
import FoodGenieDock from '../genie/FoodGenieDock'

type NavItem = {
  to: string
  label: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'Experience' },
  { to: '/menu', label: 'Menu' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/ar-preview', label: 'AR Preview' },
]

type AppLayoutProps = {
  children?: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const points = useExperienceStore((state) => state.points)
  const completedCount = useExperienceStore((state) => state.completedDishes.length)

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <LogoMark />
          <div className={styles.statusBadge}>
            <span className={styles.statusLabel}>Spice score</span>
            <strong>{points}</strong>
            <span className={styles.statusSub}>{completedCount} dishes logged</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <div className={styles.floating}>
        <FoodGenieDock />
        {children}
      </div>
    </div>
  )
}

export default AppLayout
