import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Store.module.css'
import { GameContext, StoreItem, ItemCategory, InventoryItem, Chassis, TrackType, INSTALL_DAYS_BY_TIER } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

type StoreTab = 'parts' | 'chassis'

const CATEGORIES: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'engine', label: 'Engine' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'aerodynamics', label: 'Aero' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'transmission', label: 'Transmission' },
]

const TIER_LABELS: Record<number, string> = { 1: 'Stock', 2: 'Performance', 3: 'Racing', 4: 'Elite' }
const TIER_COLORS: Record<number, string> = { 1: '#9e9e9e', 2: '#4caf50', 3: '#2196f3', 4: '#ff9800' }

// Matches the 32 store items from seed_data.sql (8 categories x 4 tiers)
const STORE_ITEMS: StoreItem[] = [
  // Engine
  { id: 1, name: 'Stock Engine Block', category: 'engine', tier: 1, price: 15000, speed_bonus: 2, handling_bonus: 0, reliability_bonus: 1, aero_bonus: 0, weight_reduction: 0, description: 'Reliable entry-level engine block.' },
  { id: 2, name: 'Performance Engine Block', category: 'engine', tier: 2, price: 45000, speed_bonus: 5, handling_bonus: 0, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 5, description: 'Tuned for better performance.' },
  { id: 3, name: 'Racing Engine Block', category: 'engine', tier: 3, price: 120000, speed_bonus: 10, handling_bonus: 1, reliability_bonus: 3, aero_bonus: 0, weight_reduction: 10, description: 'Purpose-built racing engine.' },
  { id: 4, name: 'Elite Engine Block', category: 'engine', tier: 4, price: 300000, speed_bonus: 18, handling_bonus: 2, reliability_bonus: 5, aero_bonus: 0, weight_reduction: 20, description: 'Top-of-the-line powerplant.' },
  // Suspension
  { id: 5, name: 'Stock Suspension Kit', category: 'suspension', tier: 1, price: 8000, speed_bonus: 0, handling_bonus: 3, reliability_bonus: 1, aero_bonus: 0, weight_reduction: 0, description: 'Basic suspension setup.' },
  { id: 6, name: 'Sport Suspension Kit', category: 'suspension', tier: 2, price: 25000, speed_bonus: 1, handling_bonus: 6, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 5, description: 'Better cornering performance.' },
  { id: 7, name: 'Racing Suspension Kit', category: 'suspension', tier: 3, price: 75000, speed_bonus: 2, handling_bonus: 12, reliability_bonus: 3, aero_bonus: 1, weight_reduction: 10, description: 'Precision-tuned for racetracks.' },
  { id: 8, name: 'Elite Suspension Kit', category: 'suspension', tier: 4, price: 200000, speed_bonus: 3, handling_bonus: 20, reliability_bonus: 5, aero_bonus: 2, weight_reduction: 15, description: 'Championship-level suspension.' },
  // Aerodynamics
  { id: 13, name: 'Stock Aero Package', category: 'aerodynamics', tier: 1, price: 10000, speed_bonus: 1, handling_bonus: 1, reliability_bonus: 0, aero_bonus: 3, weight_reduction: 0, description: 'Standard body kit.' },
  { id: 14, name: 'Sport Aero Package', category: 'aerodynamics', tier: 2, price: 35000, speed_bonus: 2, handling_bonus: 2, reliability_bonus: 0, aero_bonus: 7, weight_reduction: 5, description: 'Improved downforce package.' },
  { id: 15, name: 'Racing Aero Package', category: 'aerodynamics', tier: 3, price: 90000, speed_bonus: 4, handling_bonus: 3, reliability_bonus: 1, aero_bonus: 14, weight_reduction: 10, description: 'Wind-tunnel optimized.' },
  { id: 16, name: 'Elite Aero Package', category: 'aerodynamics', tier: 4, price: 250000, speed_bonus: 6, handling_bonus: 5, reliability_bonus: 2, aero_bonus: 22, weight_reduction: 20, description: 'Maximum downforce, minimum drag.' },
  // Brakes
  { id: 17, name: 'Standard Brake Kit', category: 'brakes', tier: 1, price: 6000, speed_bonus: 0, handling_bonus: 2, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Reliable stopping power.' },
  { id: 18, name: 'Performance Brake Kit', category: 'brakes', tier: 2, price: 20000, speed_bonus: 0, handling_bonus: 4, reliability_bonus: 3, aero_bonus: 0, weight_reduction: 5, description: 'Better heat management.' },
  { id: 19, name: 'Carbon Ceramic Brakes', category: 'brakes', tier: 3, price: 60000, speed_bonus: 1, handling_bonus: 8, reliability_bonus: 5, aero_bonus: 0, weight_reduction: 15, description: 'Lightweight and fade-resistant.' },
  { id: 20, name: 'Elite Brake System', category: 'brakes', tier: 4, price: 150000, speed_bonus: 2, handling_bonus: 12, reliability_bonus: 8, aero_bonus: 0, weight_reduction: 25, description: 'Championship-proven braking.' },
  // Transmission
  { id: 21, name: 'Stock Gearbox', category: 'transmission', tier: 1, price: 12000, speed_bonus: 2, handling_bonus: 1, reliability_bonus: 1, aero_bonus: 0, weight_reduction: 0, description: 'Durable standard gearbox.' },
  { id: 22, name: 'Close-Ratio Gearbox', category: 'transmission', tier: 2, price: 35000, speed_bonus: 4, handling_bonus: 2, reliability_bonus: 1, aero_bonus: 0, weight_reduction: 5, description: 'Tighter gear ratios.' },
  { id: 23, name: 'Sequential Gearbox', category: 'transmission', tier: 3, price: 95000, speed_bonus: 8, handling_bonus: 4, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 10, description: 'Faster shifts, better accel.' },
  { id: 24, name: 'Elite Transmission', category: 'transmission', tier: 4, price: 250000, speed_bonus: 14, handling_bonus: 6, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 15, description: 'Lightning-fast top-level gearbox.' },
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
  street: 'Street Circuit',
}

const CHASSIS_TRACK_TYPES: { value: TrackType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'superspeedway', label: 'Superspeedway' },
  { value: 'short_track', label: 'Short Track' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'road_course', label: 'Road Course' },
  { value: 'street', label: 'Street' },
]

const CHASSIS_ITEMS: ChassisStoreItem[] = [
  // Superspeedway
  { id: 101, name: 'Draft Runner SS', trackType: 'superspeedway', tier: 1, price: 50000, base_speed: 30, base_handling: 15, base_reliability: 20, base_aero: 25, weight_lbs: 3400, description: 'Entry-level superspeedway build. Low drag, basic setup.' },
  { id: 102, name: 'Slipstream SS', trackType: 'superspeedway', tier: 2, price: 150000, base_speed: 42, base_handling: 20, base_reliability: 28, base_aero: 38, weight_lbs: 3350, description: 'Tuned for pack racing with improved aero.' },
  { id: 103, name: 'Vortex SS', trackType: 'superspeedway', tier: 3, price: 350000, base_speed: 55, base_handling: 28, base_reliability: 35, base_aero: 50, weight_lbs: 3300, description: 'Pro-level superspeedway machine with advanced aero package.' },
  { id: 104, name: 'Apex Dominator SS', trackType: 'superspeedway', tier: 4, price: 750000, base_speed: 70, base_handling: 35, base_reliability: 42, base_aero: 65, weight_lbs: 3250, description: 'Elite superspeedway chassis. Built to lead the pack.' },
  // Short Track
  { id: 105, name: 'Scrapper ST', trackType: 'short_track', tier: 1, price: 50000, base_speed: 18, base_handling: 30, base_reliability: 22, base_aero: 12, weight_lbs: 3400, description: 'Nimble short track starter with tight handling.' },
  { id: 106, name: 'Brawler ST', trackType: 'short_track', tier: 2, price: 150000, base_speed: 25, base_handling: 42, base_reliability: 30, base_aero: 18, weight_lbs: 3350, description: 'Aggressive short track setup, improved braking zones.' },
  { id: 107, name: 'Pitbull ST', trackType: 'short_track', tier: 3, price: 350000, base_speed: 32, base_handling: 55, base_reliability: 38, base_aero: 25, weight_lbs: 3300, description: 'Pro-grade short track machine. Corner entry weapon.' },
  { id: 108, name: 'Iron Fist ST', trackType: 'short_track', tier: 4, price: 750000, base_speed: 40, base_handling: 70, base_reliability: 45, base_aero: 32, weight_lbs: 3250, description: 'Championship short track chassis. Dominates bump-and-run.' },
  // Intermediate
  { id: 109, name: 'Pacer IM', trackType: 'intermediate', tier: 1, price: 50000, base_speed: 25, base_handling: 22, base_reliability: 22, base_aero: 20, weight_lbs: 3400, description: 'Well-rounded intermediate baseline chassis.' },
  { id: 110, name: 'Strider IM', trackType: 'intermediate', tier: 2, price: 150000, base_speed: 35, base_handling: 32, base_reliability: 30, base_aero: 30, weight_lbs: 3350, description: 'Balanced intermediate setup with better wear.' },
  { id: 111, name: 'Stallion IM', trackType: 'intermediate', tier: 3, price: 350000, base_speed: 45, base_handling: 42, base_reliability: 38, base_aero: 40, weight_lbs: 3300, description: 'Pro-level intermediate. Long run speed monster.' },
  { id: 112, name: 'Titan IM', trackType: 'intermediate', tier: 4, price: 750000, base_speed: 58, base_handling: 52, base_reliability: 46, base_aero: 52, weight_lbs: 3250, description: 'Elite intermediate chassis. Balanced dominance.' },
  // Road Course
  { id: 113, name: 'Twister RC', trackType: 'road_course', tier: 1, price: 50000, base_speed: 15, base_handling: 32, base_reliability: 20, base_aero: 18, weight_lbs: 3400, description: 'Entry road course build. Decent turn-in.' },
  { id: 114, name: 'Apex RC', trackType: 'road_course', tier: 2, price: 150000, base_speed: 22, base_handling: 44, base_reliability: 28, base_aero: 28, weight_lbs: 3350, description: 'Better braking and cornering for road courses.' },
  { id: 115, name: 'Viper RC', trackType: 'road_course', tier: 3, price: 350000, base_speed: 30, base_handling: 58, base_reliability: 35, base_aero: 38, weight_lbs: 3300, description: 'Pro road course machine. Point-and-shoot precision.' },
  { id: 116, name: 'Phantom RC', trackType: 'road_course', tier: 4, price: 750000, base_speed: 38, base_handling: 72, base_reliability: 42, base_aero: 48, weight_lbs: 3250, description: 'Elite road course chassis. Wins on every turn.' },
  // Street
  { id: 117, name: 'Alley Cat SC', trackType: 'street', tier: 1, price: 55000, base_speed: 14, base_handling: 30, base_reliability: 22, base_aero: 15, weight_lbs: 3380, description: 'Compact street circuit starter with tight turning.' },
  { id: 118, name: 'Sidewinder SC', trackType: 'street', tier: 2, price: 160000, base_speed: 20, base_handling: 42, base_reliability: 30, base_aero: 22, weight_lbs: 3340, description: 'Quick street circuit machine. Wall-hugging confidence.' },
  { id: 119, name: 'Venom SC', trackType: 'street', tier: 3, price: 360000, base_speed: 28, base_handling: 56, base_reliability: 36, base_aero: 30, weight_lbs: 3300, description: 'Pro street chassis. Concrete jungle predator.' },
  { id: 120, name: 'Ghost SC', trackType: 'street', tier: 4, price: 760000, base_speed: 36, base_handling: 70, base_reliability: 44, base_aero: 40, weight_lbs: 3250, description: 'Elite street circuit chassis. Disappears around barriers.' },
]

const formatMoney = (n: number) => `$${n.toLocaleString()}`

const Store: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [tab, setTab] = useState<StoreTab>('chassis')
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<number>(0) // 0 = all
  const [trackTypeFilter, setTrackTypeFilter] = useState<TrackType | 'all'>('all')
  const [money, setMoney] = useState(saveData.money)

  const filtered = STORE_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (tierFilter > 0 && item.tier !== tierFilter) return false
    return true
  })

  const filteredChassis = CHASSIS_ITEMS.filter((item) => {
    if (trackTypeFilter !== 'all' && item.trackType !== trackTypeFilter) return false
    if (tierFilter > 0 && item.tier !== tierFilter) return false
    return true
  })

  const handleBuy = (item: StoreItem) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data || data.money < item.price) return

    const invItem: InventoryItem = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      item,
      health: 100,
      purchased_at: new Date().toISOString(),
    }

    data.money -= item.price
    data.inventory.push(invItem)
    saveSlot(data)
    setMoney(data.money)
    refreshSave()
  }

  const handleBuyChassis = (item: ChassisStoreItem) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data || data.money < item.price) return

    const chassis: Chassis = {
      id: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: item.name,
      series_id: data.selectedSeries?.id ?? 3,
      trackType: item.trackType,
      status: 'ready',
      base_speed: item.base_speed,
      base_handling: item.base_handling,
      base_reliability: item.base_reliability,
      base_aero: item.base_aero,
      weight_lbs: item.weight_lbs,
      build_progress: 100,
      installedParts: [],
      created_at: new Date().toISOString(),
    }

    data.money -= item.price
    data.chassis.push(chassis)
    saveSlot(data)
    setMoney(data.money)
    refreshSave()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Store</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${tab === 'chassis' ? styles.tabActive : ''}`} onClick={() => setTab('chassis')}>Chassis</button>
        <button className={`${styles.tabBtn} ${tab === 'parts' ? styles.tabActive : ''}`} onClick={() => setTab('parts')}>Parts</button>
      </div>

      {tab === 'parts' && (
        <>
          {/* Filters */}
          <div className={styles.filters}>
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
                  <span className={styles.itemCat}>{item.category}</span>
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
                      onClick={() => handleBuy(item)}
                    >
                      Buy
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
          {/* Chassis Filters */}
          <div className={styles.filters}>
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
                      onClick={() => handleBuyChassis(item)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Store
