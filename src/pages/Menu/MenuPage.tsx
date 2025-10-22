import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './MenuPage.module.css'
import SpiceMeter from '../../components/shared/SpiceMeter'
import { useDailyMenu } from '../../hooks/useDailyMenu'
import { useExperienceStore } from '../../store/useExperienceStore'

type DishCategory = 'veg' | 'non-veg'

type DishCard = {
  id: string
  name: string
  category: DishCategory
  price: number
  spice: number
  description: string
  trivia: string
  available?: boolean
  image?: string
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg' },
  { id: 'non-veg', label: 'Non-Veg' },
  { id: 'fire', label: '🔥 Spice 4+' },
]

const fallbackDishes: DishCard[] = [
  {
    id: 'gongura-biryani',
    name: 'Gongura Paneer Biryani',
    category: 'veg',
    price: 360,
    spice: 4,
    description: 'Smoky gongura puree folded into fragrant basmati with charred paneer.',
    trivia: 'Gongura leaves are a natural coolant, balancing Andhra spice heat.',
    available: true,
  },
  {
    id: 'guntur-chicken',
    name: 'Guntur Chili Chicken Fry',
    category: 'non-veg',
    price: 420,
    spice: 5,
    description: 'Crisped to perfection with ghee, garlic pods, and ground Guntur chillies.',
    trivia: 'Guntur chilli grades are auctioned like diamonds in Asia’s largest spice yard.',
    available: true,
  },
  {
    id: 'royyala-iguru',
    name: 'Royyala Iguru',
    category: 'non-veg',
    price: 480,
    spice: 3,
    description: 'Coastal prawn curry simmered in tamarind and coconut milk.',
    trivia: 'The Bay of Bengal current influences the sweetness of the prawns landed at Kakinada.',
    available: true,
  },
  {
    id: 'punugulu',
    name: 'Karam Punugulu',
    category: 'veg',
    price: 220,
    spice: 2,
    description: 'Crispy rice batter pops served with peanut chutney and fiery karam podi.',
    trivia: 'Punugulu were the original late-night snack of Vijayawada pushcarts.',
    available: true,
  },
]

function MenuPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const registerDish = useExperienceStore((state) => state.registerDish)
  const { dishes: liveDishes, loading, error } = useDailyMenu()

  const { dishes, isFallback } = useMemo(() => {
    if (liveDishes.length === 0) {
      return { dishes: fallbackDishes, isFallback: true }
    }
    const normalized = liveDishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      price: dish.price,
      spice: dish.spice,
      description: dish.description ?? 'Chef is still typing up the tasting notes…',
      trivia: dish.trivia ?? 'Ask the Food Genie for the latest gossip on this dish.',
      available: dish.available !== false,
      image: dish.image,
    })) satisfies DishCard[]
    return { dishes: normalized, isFallback: false }
  }, [liveDishes])

  const filtered = useMemo(() => {
    let list = dishes
    if (activeFilter === 'fire') list = list.filter((dish) => dish.spice >= 4)
    else if (activeFilter !== 'all') list = list.filter((dish) => dish.category === activeFilter)
    return list.filter((dish) => dish.available !== false)
  }, [activeFilter, dishes])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Menu</h1>
          <p>Swipe a card, inspect the ingredients, and see your future in the spice meter.</p>
        </div>
        <div className={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={activeFilter === filter.id ? `${styles.filter} ${styles.filterActive}` : styles.filter}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <section className={styles.deck}>
        {loading && isFallback ? <p className={styles.loading}>Fetching today’s menu…</p> : null}
        {error ? <p className={styles.error}>Failed to load live menu. Showing signature staples.</p> : null}
        {filtered.map((dish, index) => (
          <motion.article
            key={dish.id}
            className={styles.card}
            whileHover={{ rotateY: 6, y: -6 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.5, ease: 'easeOut' }}
          >
            {dish.image ? <img className={styles.cardImage} src={dish.image} alt={dish.name} /> : null}
            <div className={styles.cardHeader}>
              <div>
                <h2>{dish.name}</h2>
                <p className={styles.price}>₹{dish.price}</p>
              </div>
              <SpiceMeter level={dish.spice} />
            </div>
            <p className={styles.description}>{dish.description}</p>
            <div className={styles.trivia}>
              <span>Trivia</span>
              <p>{dish.trivia}</p>
            </div>
            <button
              type="button"
              className={styles.logButton}
              onClick={() => registerDish(dish.id)}
            >
              Log completion
            </button>
          </motion.article>
        ))}
      </section>
    </div>
  )
}

export default MenuPage
