import React, { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Store.module.css'
import { GameContext, StoreItem, ItemCategory, InventoryItem, Chassis, TrackType, INSTALL_DAYS_BY_TIER } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

type StoreTab = 'parts' | 'chassis'
type StoreSort = 'recommended' | 'price-low' | 'price-high' | 'tier-high' | 'name'
type CartItem =
  | { kind: 'part'; item: StoreItem; quantity: number }
  | { kind: 'chassis'; item: ChassisStoreItem; quantity: number }

const CATEGORIES: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Parts' },
  { value: 'engine', label: 'Engine' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'aerodynamics', label: 'Aerodynamics' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'transmission', label: 'Transmission' },
]

const TIER_LABELS: Record<number, string> = { 1: 'Stock', 2: 'Sport', 3: 'Competition', 4: 'Elite' }
const TIER_COLORS: Record<number, string> = { 1: '#9e9e9e', 2: '#4caf50', 3: '#2196f3', 4: '#ff9800' }

// Matches the 32 store items from seed_data.sql (8 categories x 4 tiers)
const STORE_ITEMS: StoreItem[] = [
  // Engine (Speed + Reliability focus)
  { id: 1, name: 'Base Engine', category: 'engine', tier: 1, price: 15000, speed_bonus: 2, handling_bonus: 0, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Reliable entry-level engine.' },
  { id: 2, name: 'Sport Engine', category: 'engine', tier: 2, price: 45000, speed_bonus: 4, handling_bonus: 0, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 5, description: 'Tuned for better performance.' },
  { id: 3, name: 'Competition Engine', category: 'engine', tier: 3, price: 120000, speed_bonus: 8, handling_bonus: 1, reliability_bonus: 7, aero_bonus: 0, weight_reduction: 10, description: 'Purpose-built racing engine.' },
  { id: 4, name: 'Elite Engine', category: 'engine', tier: 4, price: 300000, speed_bonus: 11, handling_bonus: 2, reliability_bonus: 11, aero_bonus: 0, weight_reduction: 20, description: 'Top-of-the-line powerplant.' },
  // Suspension (Handling + Reliability focus)
  { id: 5, name: 'Base Suspension', category: 'suspension', tier: 1, price: 8000, speed_bonus: 0, handling_bonus: 3, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Basic suspension setup.' },
  { id: 6, name: 'Sport Suspension', category: 'suspension', tier: 2, price: 25000, speed_bonus: 1, handling_bonus: 6, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 5, description: 'Better cornering performance.' },
  { id: 7, name: 'Competition Suspension', category: 'suspension', tier: 3, price: 75000, speed_bonus: 2, handling_bonus: 11, reliability_bonus: 7, aero_bonus: 1, weight_reduction: 10, description: 'Precision-tuned for racetracks.' },
  { id: 8, name: 'Elite Suspension', category: 'suspension', tier: 4, price: 200000, speed_bonus: 3, handling_bonus: 16, reliability_bonus: 11, aero_bonus: 2, weight_reduction: 15, description: 'Championship-level suspension.' },
  // Aerodynamics (Aero + balanced)
  { id: 13, name: 'Base Aero', category: 'aerodynamics', tier: 1, price: 10000, speed_bonus: 1, handling_bonus: 1, reliability_bonus: 1, aero_bonus: 3, weight_reduction: 0, description: 'Standard body kit.' },
  { id: 14, name: 'Sport Aero', category: 'aerodynamics', tier: 2, price: 35000, speed_bonus: 2, handling_bonus: 2, reliability_bonus: 2, aero_bonus: 7, weight_reduction: 5, description: 'Improved downforce package.' },
  { id: 15, name: 'Competition Aero', category: 'aerodynamics', tier: 3, price: 90000, speed_bonus: 4, handling_bonus: 3, reliability_bonus: 3, aero_bonus: 14, weight_reduction: 10, description: 'Wind-tunnel optimized.' },
  { id: 16, name: 'Elite Aero', category: 'aerodynamics', tier: 4, price: 250000, speed_bonus: 6, handling_bonus: 5, reliability_bonus: 5, aero_bonus: 22, weight_reduction: 20, description: 'Maximum downforce, minimum drag.' },
  // Brakes (Handling + Reliability focus)
  { id: 17, name: 'Base Brakes', category: 'brakes', tier: 1, price: 6000, speed_bonus: 0, handling_bonus: 2, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Reliable stopping power.' },
  { id: 18, name: 'Sport Brakes', category: 'brakes', tier: 2, price: 20000, speed_bonus: 0, handling_bonus: 4, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 5, description: 'Better heat management.' },
  { id: 19, name: 'Competition Brakes', category: 'brakes', tier: 3, price: 60000, speed_bonus: 1, handling_bonus: 8, reliability_bonus: 7, aero_bonus: 0, weight_reduction: 15, description: 'Lightweight and fade-resistant.' },
  { id: 20, name: 'Elite Brakes', category: 'brakes', tier: 4, price: 150000, speed_bonus: 2, handling_bonus: 12, reliability_bonus: 11, aero_bonus: 0, weight_reduction: 25, description: 'Championship-proven braking.' },
  // Transmission (Speed + Reliability focus)
  { id: 21, name: 'Base Transmission', category: 'transmission', tier: 1, price: 12000, speed_bonus: 2, handling_bonus: 1, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Durable standard transmission.' },
  { id: 22, name: 'Sport Transmission', category: 'transmission', tier: 2, price: 35000, speed_bonus: 4, handling_bonus: 2, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 5, description: 'Tighter gear ratios.' },
  { id: 23, name: 'Competition Transmission', category: 'transmission', tier: 3, price: 95000, speed_bonus: 8, handling_bonus: 4, reliability_bonus: 7, aero_bonus: 0, weight_reduction: 10, description: 'Faster shifts, better accel.' },
  { id: 24, name: 'Elite Transmission', category: 'transmission', tier: 4, price: 250000, speed_bonus: 11, handling_bonus: 6, reliability_bonus: 11, aero_bonus: 0, weight_reduction: 15, description: 'Lightning-fast championship gearbox.' },
]

// ---- Chassis Store Items ----
interface ChassisStoreItem {
  id: number
  name: string
  trackType: TrackType
  tier: number
  price: number
  base_speed: number
  base_handling: number
  base_reliability: number
  base_aero: number
  weight_lbs: number
  description: string
}

const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  superspeedway: 'Superspeedway',
  short_track: 'Short Track',
  intermediate: 'Intermediate',
  road_course: 'Road Course',
  street: 'Street Course',
  dirt: 'Dirt',
}

const CHASSIS_TRACK_TYPES: { value: TrackType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'superspeedway', label: 'Superspeedway' },
  { value: 'short_track', label: 'Short Track' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'road_course', label: 'Road Course' },
  { value: 'dirt', label: 'Dirt' },
]

const CHASSIS_ITEMS: ChassisStoreItem[] = [
  // Superspeedway
  { id: 101, name: 'Base Superspeedway', trackType: 'superspeedway', tier: 1, price: 50000, base_speed: 20, base_handling: 12, base_reliability: 15, base_aero: 20, weight_lbs: 3400, description: 'Entry-level superspeedway build. Low drag, basic setup.' },
  { id: 102, name: 'Sport Superspeedway', trackType: 'superspeedway', tier: 2, price: 150000, base_speed: 32, base_handling: 18, base_reliability: 25, base_aero: 32, weight_lbs: 3350, description: 'Tuned for pack racing with improved aero.' },
  { id: 103, name: 'Competition Superspeedway', trackType: 'superspeedway', tier: 3, price: 350000, base_speed: 46, base_handling: 26, base_reliability: 35, base_aero: 48, weight_lbs: 3300, description: 'Pro-level superspeedway machine with advanced aero package.' },
  { id: 104, name: 'Elite Superspeedway', trackType: 'superspeedway', tier: 4, price: 750000, base_speed: 60, base_handling: 35, base_reliability: 45, base_aero: 65, weight_lbs: 3250, description: 'Elite superspeedway chassis. Built to lead the pack.' },
  // Short Track
  { id: 105, name: 'Base Short Track', trackType: 'short_track', tier: 1, price: 50000, base_speed: 15, base_handling: 22, base_reliability: 12, base_aero: 10, weight_lbs: 3400, description: 'Nimble short track starter with tight handling.' },
  { id: 106, name: 'Sport Short Track', trackType: 'short_track', tier: 2, price: 150000, base_speed: 24, base_handling: 32, base_reliability: 24, base_aero: 15, weight_lbs: 3350, description: 'Aggressive short track setup, improved braking zones.' },
  { id: 107, name: 'Competition Short Track', trackType: 'short_track', tier: 3, price: 350000, base_speed: 32, base_handling: 46, base_reliability: 35, base_aero: 22, weight_lbs: 3300, description: 'Pro-grade short track machine. Corner entry weapon.' },
  { id: 108, name: 'Elite Short Track', trackType: 'short_track', tier: 4, price: 750000, base_speed: 40, base_handling: 60, base_reliability: 45, base_aero: 30, weight_lbs: 3250, description: 'Championship short track chassis. Dominates bump-and-run.' },
  // Intermediate
  { id: 109, name: 'Base Intermediate', trackType: 'intermediate', tier: 1, price: 50000, base_speed: 18, base_handling: 16, base_reliability: 14, base_aero: 16, weight_lbs: 3400, description: 'Well-rounded intermediate baseline chassis.' },
  { id: 110, name: 'Sport Intermediate', trackType: 'intermediate', tier: 2, price: 150000, base_speed: 28, base_handling: 26, base_reliability: 26, base_aero: 26, weight_lbs: 3350, description: 'Balanced intermediate setup with better wear.' },
  { id: 111, name: 'Competition Intermediate', trackType: 'intermediate', tier: 3, price: 350000, base_speed: 40, base_handling: 38, base_reliability: 36, base_aero: 38, weight_lbs: 3300, description: 'Pro-level intermediate. Long run speed monster.' },
  { id: 112, name: 'Elite Intermediate', trackType: 'intermediate', tier: 4, price: 750000, base_speed: 52, base_handling: 50, base_reliability: 46, base_aero: 50, weight_lbs: 3250, description: 'Elite intermediate chassis. Balanced dominance.' },
  // Road Course
  { id: 113, name: 'Base Road Course', trackType: 'road_course', tier: 1, price: 50000, base_speed: 12, base_handling: 26, base_reliability: 12, base_aero: 14, weight_lbs: 3400, description: 'Entry road course build. Decent turn-in.' },
  { id: 114, name: 'Sport Road Course', trackType: 'road_course', tier: 2, price: 150000, base_speed: 20, base_handling: 38, base_reliability: 24, base_aero: 24, weight_lbs: 3350, description: 'Better braking and cornering for road courses.' },
  { id: 115, name: 'Competition Road Course', trackType: 'road_course', tier: 3, price: 350000, base_speed: 28, base_handling: 52, base_reliability: 34, base_aero: 36, weight_lbs: 3300, description: 'Pro road course machine. Point-and-shoot precision.' },
  { id: 116, name: 'Elite Road Course', trackType: 'road_course', tier: 4, price: 750000, base_speed: 36, base_handling: 66, base_reliability: 44, base_aero: 48, weight_lbs: 3250, description: 'Elite road course chassis. Wins on every turn.' },
  // Dirt
  { id: 117, name: 'Base Dirt', trackType: 'dirt', tier: 1, price: 50000, base_speed: 14, base_handling: 24, base_reliability: 13, base_aero: 8, weight_lbs: 3400, description: 'Entry dirt chassis with a stable base setup.' },
  { id: 118, name: 'Sport Dirt', trackType: 'dirt', tier: 2, price: 150000, base_speed: 22, base_handling: 36, base_reliability: 24, base_aero: 12, weight_lbs: 3350, description: 'Improved dirt chassis with better bite and rotation.' },
  { id: 119, name: 'Competition Dirt', trackType: 'dirt', tier: 3, price: 350000, base_speed: 30, base_handling: 50, base_reliability: 34, base_aero: 16, weight_lbs: 3300, description: 'Pro dirt build with strong corner exit drive.' },
  { id: 120, name: 'Elite Dirt', trackType: 'dirt', tier: 4, price: 750000, base_speed: 38, base_handling: 64, base_reliability: 44, base_aero: 20, weight_lbs: 3250, description: 'Top-tier dirt chassis built to hook up and go.' },
]

const formatMoney = (n: number) => `$${n.toLocaleString()}`

const STORE_SORT_OPTIONS: { value: StoreSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'tier-high', label: 'Tier: Highest First' },
  { value: 'price-low', label: 'Price: Lowest First' },
  { value: 'price-high', label: 'Price: Highest First' },
  { value: 'name', label: 'Name: A to Z' },
]

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  engine: 'Engine',
  suspension: 'Suspension',
  aerodynamics: 'Aerodynamics',
  brakes: 'Brakes',
  transmission: 'Transmission',
}

function compareStoreItems<T extends { name: string; tier: number; price: number }>(a: T, b: T, sortBy: StoreSort) {
  switch (sortBy) {
    case 'price-low':
      return a.price - b.price || b.tier - a.tier || a.name.localeCompare(b.name)
    case 'price-high':
      return b.price - a.price || b.tier - a.tier || a.name.localeCompare(b.name)
    case 'tier-high':
      return b.tier - a.tier || a.price - b.price || a.name.localeCompare(b.name)
    case 'name':
      return a.name.localeCompare(b.name)
    case 'recommended':
    default:
      return b.tier - a.tier || a.price - b.price || a.name.localeCompare(b.name)
  }
}

const Store: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [tab, setTab] = useState<StoreTab | 'cart'>('chassis')
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<number>(0) // 0 = all
  const [trackTypeFilter, setTrackTypeFilter] = useState<TrackType | 'all'>('all')
  const [partSort, setPartSort] = useState<StoreSort>('recommended')
  const [chassisSort, setChassisSort] = useState<StoreSort>('recommended')
  const [searchTerm, setSearchTerm] = useState('')
  const [money, setMoney] = useState(saveData.money)
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [editingCartKey, setEditingCartKey] = useState<string | null>(null)
  const [editingCartValue, setEditingCartValue] = useState('')

  const searchValue = searchTerm.trim().toLowerCase()

  const filtered = STORE_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (tierFilter > 0 && item.tier !== tierFilter) return false
    if (
      searchValue &&
      !item.name.toLowerCase().includes(searchValue) &&
      !CATEGORY_LABELS[item.category].toLowerCase().includes(searchValue) &&
      !item.description.toLowerCase().includes(searchValue)
    ) {
      return false
    }
    return true
  }).sort((a, b) => compareStoreItems(a, b, partSort))

  const filteredChassis = CHASSIS_ITEMS.filter((item) => {
    if (trackTypeFilter !== 'all' && item.trackType !== trackTypeFilter) return false
    if (tierFilter > 0 && item.tier !== tierFilter) return false
    if (
      searchValue &&
      !item.name.toLowerCase().includes(searchValue) &&
      !TRACK_TYPE_LABELS[item.trackType].toLowerCase().includes(searchValue) &&
      !item.description.toLowerCase().includes(searchValue)
    ) {
      return false
    }
    return true
  }).sort((a, b) => compareStoreItems(a, b, chassisSort))

  const activeResults = tab === 'parts' ? filtered.length : filteredChassis.length

  const resetFilters = () => {
    setCategory('all')
    setTrackTypeFilter('all')
    setTierFilter(0)
    setSearchTerm('')
    setPartSort('recommended')
    setChassisSort('recommended')
  }

  const executeCheckout = () => {
    if (cart.length === 0) return

    const totalCost = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data || data.money < totalCost) return

    for (const line of cart) {
      for (let i = 0; i < line.quantity; i++) {
        if (line.kind === 'part') {
          const invItem: InventoryItem = {
            id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            item: line.item,
            health: 100,
            purchased_at: new Date().toISOString(),
          }
          data.inventory.push(invItem)
        } else {
          const chassis: Chassis = {
            id: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: line.item.name,
            series_id: data.selectedSeries?.id ?? 3,
            trackType: line.item.trackType,
            status: 'building',
            base_speed: line.item.base_speed,
            base_handling: line.item.base_handling,
            base_reliability: line.item.base_reliability,
            base_aero: line.item.base_aero,
            weight_lbs: line.item.weight_lbs,
            build_progress: 100,
            installedParts: [],
            purchasePrice: line.item.price,
            created_at: new Date().toISOString(),
          }
          data.chassis.push(chassis)
        }
      }
    }

    data.money -= totalCost
    saveSlot(data)
    setMoney(data.money)
    setCart([])
    setCheckoutOpen(false)
    refreshSave()
  }

  const addPartToCart = (item: StoreItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.kind === 'part' && line.item.id === item.id)
      if (!existing) {
        return [...prev, { kind: 'part', item, quantity: 1 }]
      }
      return prev.map((line) =>
        line.kind === 'part' && line.item.id === item.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    })
  }

  const addChassisToCart = (item: ChassisStoreItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.kind === 'chassis' && line.item.id === item.id)
      if (!existing) {
        return [...prev, { kind: 'chassis', item, quantity: 1 }]
      }
      return prev.map((line) =>
        line.kind === 'chassis' && line.item.id === item.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    })
  }

  const updateCartQuantity = (kind: CartItem['kind'], id: number, delta: number) => {
    setCart((prev) => {
      return prev.map((line) => {
        if (line.kind !== kind || line.item.id !== id) return line
        return { ...line, quantity: Math.max(1, line.quantity + delta) }
      })
    })
  }

  const setCartQuantity = (kind: CartItem['kind'], id: number, quantity: number) => {
    setCart((prev) => {
      return prev
        .map((line) => {
          if (line.kind !== kind || line.item.id !== id) return line
          return { ...line, quantity: Math.max(0, Math.floor(quantity)) }
        })
        .filter((line) => line.quantity > 0)
    })
  }

  const removeFromCart = (kind: CartItem['kind'], id: number) => {
    setCart((prev) => prev.filter((line) => !(line.kind === kind && line.item.id === id)))
  }

  const startEditQuantity = (kind: CartItem['kind'], id: number, currentQuantity: number) => {
    setEditingCartKey(`${kind}-${id}`)
    setEditingCartValue(String(currentQuantity))
  }

  const commitEditQuantity = (kind: CartItem['kind'], id: number) => {
    const parsed = Number.parseInt(editingCartValue, 10)
    if (Number.isNaN(parsed)) {
      setEditingCartKey(null)
      setEditingCartValue('')
      return
    }

    setCartQuantity(kind, id, parsed)
    setEditingCartKey(null)
    setEditingCartValue('')
  }

  const cartItemCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0), [cart])
  const projectedBalance = Math.max(money - cartTotal, 0)
  const canCheckout = cart.length > 0 && money >= cartTotal

  const openCheckout = () => {
    if (cart.length === 0) return
    setCheckoutOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Store</h1>
        <div className={styles.topBarMeta}>
          <span className={styles.balance}>Balance: {formatMoney(money)}</span>
          <button className={styles.cartIconBtn} onClick={() => setTab('cart')} aria-label="Open shopping cart">
            <svg viewBox="0 0 24 24" className={styles.cartIcon} aria-hidden="true">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.9c.8 0 1.5-.5 1.8-1.2l3-6.8c.3-.7-.2-1.5-1-1.5H6.2L5.3 2H2v2h2l3.6 8.6L6.2 15c-.4.7.1 1.5.9 1.5H20v-2H7.2z" fill="currentColor" />
            </svg>
            <span className={styles.cartBadge}>{cartItemCount}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${tab === 'chassis' ? styles.tabActive : ''}`} onClick={() => setTab('chassis')}>Chassis</button>
        <button className={`${styles.tabBtn} ${tab === 'parts' ? styles.tabActive : ''}`} onClick={() => setTab('parts')}>Parts</button>
      </div>

      {tab !== 'cart' && <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.filterEyebrow}>{tab === 'parts' ? 'Parts Catalog' : 'Chassis Catalog'}</p>
            <h2 className={styles.filterTitle}>Browse with clearer filters</h2>
          </div>
          <button className={styles.resetBtn} onClick={resetFilters}>Reset Filters</button>
        </div>

        <div className={styles.utilityRow}>
          <label className={styles.searchField}>
            <span className={styles.controlLabel}>Search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={tab === 'parts' ? 'Search parts, categories, descriptions...' : 'Search chassis, track types, descriptions...'}
              className={styles.searchInput}
            />
          </label>

          <label className={styles.selectField}>
            <span className={styles.controlLabel}>Sort By</span>
            <select
              value={tab === 'parts' ? partSort : chassisSort}
              onChange={(event) => tab === 'parts' ? setPartSort(event.target.value as StoreSort) : setChassisSort(event.target.value as StoreSort)}
              className={styles.selectInput}
            >
              {STORE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.filters}>
          {tab === 'parts' ? (
            <>
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Category</span>
                <div className={styles.catRow}>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      className={`${styles.catBtn} ${category === c.value ? styles.catActive : ''}`}
                      onClick={() => setCategory(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Tier</span>
                <div className={styles.tierRow}>
                  <button
                    className={`${styles.tierBtn} ${tierFilter === 0 ? styles.tierActive : ''}`}
                    onClick={() => setTierFilter(0)}
                  >
                    All Tiers
                  </button>
                  {[1, 2, 3, 4].map((t) => (
                    <button
                      key={t}
                      className={`${styles.tierBtn} ${tierFilter === t ? styles.tierActive : ''}`}
                      style={tierFilter === t ? { borderColor: TIER_COLORS[t], color: TIER_COLORS[t] } : undefined}
                      onClick={() => setTierFilter(t)}
                    >
                      {TIER_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Track Type</span>
                <div className={styles.catRow}>
                  {CHASSIS_TRACK_TYPES.map((tt) => (
                    <button
                      key={tt.value}
                      className={`${styles.catBtn} ${trackTypeFilter === tt.value ? styles.catActive : ''}`}
                      onClick={() => setTrackTypeFilter(tt.value)}
                    >
                      {tt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Tier</span>
                <div className={styles.tierRow}>
                  <button
                    className={`${styles.tierBtn} ${tierFilter === 0 ? styles.tierActive : ''}`}
                    onClick={() => setTierFilter(0)}
                  >
                    All Tiers
                  </button>
                  {[1, 2, 3, 4].map((t) => (
                    <button
                      key={t}
                      className={`${styles.tierBtn} ${tierFilter === t ? styles.tierActive : ''}`}
                      style={tierFilter === t ? { borderColor: TIER_COLORS[t], color: TIER_COLORS[t] } : undefined}
                      onClick={() => setTierFilter(t)}
                    >
                      {TIER_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.resultsBar}>
          <span className={styles.resultsCount}>{activeResults} {tab === 'parts' ? 'parts' : 'chassis'} shown</span>
          <span className={styles.resultsHint}>{tab === 'parts' ? 'Recommended sorts by best tier first, then lowest price.' : 'Recommended sorts by best tier first, then lowest price.'}</span>
        </div>
      </div>}

      {tab === 'cart' && (
        <div className={styles.cartPage}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Shopping Cart</h2>
            <button className={styles.clearCartBtn} onClick={() => setCart([])} disabled={cart.length === 0}>
              Clear Cart
            </button>
          </div>
          {cart.length === 0 ? (
            <p className={styles.cartEmpty}>Your cart is empty.</p>
          ) : (
            <div className={styles.cartList}>
              {cart.map((line) => (
                <div key={`${line.kind}-${line.item.id}`} className={styles.cartLine}>
                  {(() => {
                    const isEditing = editingCartKey === `${line.kind}-${line.item.id}`
                    const displayValue = isEditing ? editingCartValue : String(line.quantity)
                    const inputSize = Math.max(2, displayValue.length)

                    return (
                      <>
                  <div className={styles.cartLineInfo}>
                    <span className={styles.cartLineName}>{line.item.name}</span>
                    <span className={styles.cartLineMeta}>{line.kind === 'part' ? 'Part' : 'Chassis'} - {formatMoney(line.item.price)} each</span>
                  </div>
                  <div className={styles.cartLineActions}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateCartQuantity(line.kind, line.item.id, -1)}
                      disabled={line.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      className={styles.qtyValue}
                      value={displayValue}
                      readOnly={!isEditing}
                      size={inputSize}
                      onDoubleClick={(event) => {
                        startEditQuantity(line.kind, line.item.id, line.quantity)
                        window.setTimeout(() => {
                          event.currentTarget.focus()
                          event.currentTarget.select()
                        }, 0)
                      }}
                      onChange={(event) => setEditingCartValue(event.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        if (isEditing) {
                          commitEditQuantity(line.kind, line.item.id)
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!isEditing) return
                        if (event.key === 'Enter') {
                          commitEditQuantity(line.kind, line.item.id)
                        }
                        if (event.key === 'Escape') {
                          setEditingCartKey(null)
                          setEditingCartValue('')
                        }
                      }}
                      inputMode="numeric"
                      aria-label={`Quantity for ${line.item.name}. Double click to edit.`}
                    />
                    <button className={styles.qtyBtn} onClick={() => updateCartQuantity(line.kind, line.item.id, 1)}>+</button>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(line.kind, line.item.id)}>Remove</button>
                  </div>
                      </>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
          <div className={styles.cartFooter}>
            <span className={styles.cartTotal}>Total: {formatMoney(cartTotal)}</span>
            <button className={styles.checkoutBtn} disabled={!canCheckout} onClick={openCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}

      {tab === 'parts' && (
        <>
          {/* Items grid */}
          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <p className={styles.noItems}>No items match the current filters.</p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.tierTag} style={{ borderColor: TIER_COLORS[item.tier], color: TIER_COLORS[item.tier] }}>
                      {TIER_LABELS[item.tier]}
                    </span>
                  </div>
                  <span className={styles.itemCat}>{CATEGORY_LABELS[item.category]}</span>
                  <p className={styles.itemDesc}>{item.description}</p>

                  <div className={styles.bonuses}>
                    {item.speed_bonus > 0 && <span>SPD +{item.speed_bonus}</span>}
                    {item.handling_bonus > 0 && <span>HND +{item.handling_bonus}</span>}
                    {item.reliability_bonus > 0 && <span>REL +{item.reliability_bonus}</span>}
                    {item.aero_bonus > 0 && <span>AER +{item.aero_bonus}</span>}
                    {item.weight_reduction > 0 && <span>WT -{item.weight_reduction}</span>}
                    <span style={{ color: '#ff9800' }}>Install: {INSTALL_DAYS_BY_TIER[item.tier] ?? 2}d</span>
                  </div>

                  <div className={styles.itemFooter}>
                    <span className={styles.price}>{formatMoney(item.price)}</span>
                    <button
                      className={styles.buyBtn}
                      disabled={money < item.price}
                      onClick={() => addPartToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'chassis' && (
        <>
          {/* Chassis grid */}
          <div className={styles.grid}>
            {filteredChassis.length === 0 ? (
              <p className={styles.noItems}>No chassis match the current filters.</p>
            ) : (
              filteredChassis.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.tierTag} style={{ borderColor: TIER_COLORS[item.tier], color: TIER_COLORS[item.tier] }}>
                      {TIER_LABELS[item.tier]}
                    </span>
                  </div>
                  <span className={styles.itemCat}>{TRACK_TYPE_LABELS[item.trackType]}</span>
                  <p className={styles.itemDesc}>{item.description}</p>

                  <div className={styles.bonuses}>
                    <span>SPD {item.base_speed}</span>
                    <span>HND {item.base_handling}</span>
                    <span>REL {item.base_reliability}</span>
                    <span>AER {item.base_aero}</span>
                    <span>WT {item.weight_lbs} lbs</span>
                  </div>

                  <div className={styles.itemFooter}>
                    <span className={styles.price}>{formatMoney(item.price)}</span>
                    <button
                      className={styles.buyBtn}
                      disabled={money < item.price}
                      onClick={() => addChassisToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {checkoutOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Confirm purchase">
          <div className={styles.confirmModal}>
            <h3 className={styles.modalTitle}>Confirm Checkout</h3>
            <p className={styles.modalText}>
              Are you sure you want to buy <strong>{cartItemCount}</strong> item{cartItemCount === 1 ? '' : 's'} for a total of <strong>{formatMoney(cartTotal)}</strong>?
            </p>

            <div className={styles.balancePreview}>
              <div className={styles.balanceLine}>
                <span>Current Balance</span>
                <span>{formatMoney(money)}</span>
              </div>
              <div className={styles.balanceLine}>
                <span>Purchase Cost</span>
                <span>-{formatMoney(cartTotal)}</span>
              </div>
              <div className={`${styles.balanceLine} ${styles.newBalance}`}>
                <span>Balance After Purchase</span>
                <span>{formatMoney(projectedBalance)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setCheckoutOpen(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={executeCheckout} disabled={!canCheckout}>
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Store
