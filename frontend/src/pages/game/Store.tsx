import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Store.module.css'
import { GameContext, StoreItem, ItemCategory, InventoryItem } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const CATEGORIES: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'engine', label: 'Engine' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'tires', label: 'Tires' },
  { value: 'aerodynamics', label: 'Aero' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'safety', label: 'Safety' },
  { value: 'electronics', label: 'Electronics' },
]

const TIER_LABELS: Record<number, string> = { 1: 'Basic', 2: 'Standard', 3: 'Pro', 4: 'Elite' }
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
  // Tires
  { id: 9, name: 'Standard Tires', category: 'tires', tier: 1, price: 5000, speed_bonus: 1, handling_bonus: 2, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 0, description: 'Durable all-around tires.' },
  { id: 10, name: 'Performance Tires', category: 'tires', tier: 2, price: 15000, speed_bonus: 2, handling_bonus: 4, reliability_bonus: 3, aero_bonus: 0, weight_reduction: 0, description: 'Better grip and wear.' },
  { id: 11, name: 'Racing Slicks', category: 'tires', tier: 3, price: 40000, speed_bonus: 4, handling_bonus: 8, reliability_bonus: 2, aero_bonus: 0, weight_reduction: 5, description: 'Maximum grip, less durability.' },
  { id: 12, name: 'Elite Compound Tires', category: 'tires', tier: 4, price: 100000, speed_bonus: 7, handling_bonus: 14, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 5, description: 'Best grip-to-wear ratio.' },
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
  // Safety
  { id: 25, name: 'Basic Roll Cage', category: 'safety', tier: 1, price: 4000, speed_bonus: 0, handling_bonus: 0, reliability_bonus: 4, aero_bonus: 0, weight_reduction: 0, description: 'Meets minimum requirements.' },
  { id: 26, name: 'Reinforced Roll Cage', category: 'safety', tier: 2, price: 12000, speed_bonus: 0, handling_bonus: 0, reliability_bonus: 8, aero_bonus: 0, weight_reduction: 0, description: 'Extra reinforcement.' },
  { id: 27, name: 'Racing Safety Package', category: 'safety', tier: 3, price: 35000, speed_bonus: 0, handling_bonus: 1, reliability_bonus: 14, aero_bonus: 0, weight_reduction: 5, description: 'Comprehensive safety upgrades.' },
  { id: 28, name: 'Elite Safety System', category: 'safety', tier: 4, price: 80000, speed_bonus: 0, handling_bonus: 2, reliability_bonus: 22, aero_bonus: 0, weight_reduction: 10, description: 'Best-in-class protection.' },
  // Electronics
  { id: 29, name: 'Basic ECU', category: 'electronics', tier: 1, price: 8000, speed_bonus: 1, handling_bonus: 1, reliability_bonus: 1, aero_bonus: 1, weight_reduction: 0, description: 'Standard engine management.' },
  { id: 30, name: 'Sport ECU', category: 'electronics', tier: 2, price: 25000, speed_bonus: 2, handling_bonus: 2, reliability_bonus: 2, aero_bonus: 2, weight_reduction: 0, description: 'Better tuning options.' },
  { id: 31, name: 'Racing ECU', category: 'electronics', tier: 3, price: 70000, speed_bonus: 4, handling_bonus: 4, reliability_bonus: 4, aero_bonus: 4, weight_reduction: 0, description: 'Advanced data and tuning.' },
  { id: 32, name: 'Elite ECU', category: 'electronics', tier: 4, price: 180000, speed_bonus: 7, handling_bonus: 7, reliability_bonus: 7, aero_bonus: 7, weight_reduction: 0, description: 'Full telemetry and optimization.' },
]

const formatMoney = (n: number) => `$${n.toLocaleString()}`

const Store: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<number>(0) // 0 = all
  const [money, setMoney] = useState(saveData.money)

  const filtered = STORE_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
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
      purchased_at: new Date().toISOString(),
    }

    data.money -= item.price
    data.inventory.push(invItem)
    saveSlot(data)
    setMoney(data.money)
    refreshSave()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Parts Store</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

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
    </div>
  )
}

export default Store
