import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Inventory.module.css'
import { GameContext, InventoryItem, ItemCategory } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

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

type SortBy = 'name' | 'category' | 'tier' | 'health' | 'value'

function getSellPrice(item: InventoryItem): number {
  const base = item.item.price
  const healthFactor = item.health / 100
  // Unused (never installed) = 50% of price, used = fraction based on health
  if (item.health === 100 && !item.chassisId) return Math.round(base * 0.5)
  return Math.round(base * 0.3 * healthFactor)
}

function getHealthColor(health: number): string {
  if (health >= 75) return '#4caf50'
  if (health >= 50) return '#ff9800'
  if (health >= 25) return '#f44336'
  return '#b71c1c'
}

const formatMoney = (n: number) => `$${n.toLocaleString()}`

const Inventory: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortBy>('category')
  const [money, setMoney] = useState(saveData.money)
  const [showInstalled, setShowInstalled] = useState(false)

  // Get all inventory items (uninstalled) + optionally installed parts from chassis
  const allItems: InventoryItem[] = (() => {
    const loose = saveData.inventory.filter(i => !i.chassisId)
    if (!showInstalled) return loose
    const installed: InventoryItem[] = []
    for (const ch of saveData.chassis) {
      for (const p of ch.installedParts) {
        installed.push(p)
      }
    }
    return [...loose, ...installed]
  })()

  const filtered = allItems
    .filter(item => {
      if (category !== 'all' && item.item.category !== category) return false
      if (tierFilter > 0 && item.item.tier !== tierFilter) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.item.name.localeCompare(b.item.name)
        case 'category': return a.item.category.localeCompare(b.item.category) || b.item.tier - a.item.tier
        case 'tier': return b.item.tier - a.item.tier || a.item.category.localeCompare(b.item.category)
        case 'health': return a.health - b.health
        case 'value': return getSellPrice(b) - getSellPrice(a)
        default: return 0
      }
    })

  const handleSell = (item: InventoryItem) => {
    if (item.chassisId) return // can't sell installed parts
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const sellPrice = getSellPrice(item)
    data.money += sellPrice
    data.inventory = data.inventory.filter(i => i.id !== item.id)
    saveSlot(data)
    setMoney(data.money)
    refreshSave()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Inventory</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.catRow}>
          {CATEGORIES.map(c => (
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
          {[1, 2, 3, 4].map(t => (
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
        <div className={styles.controlRow}>
          <div className={styles.sortGroup}>
            <span className={styles.sortLabel}>Sort:</span>
            {(['category', 'name', 'tier', 'health', 'value'] as SortBy[]).map(s => (
              <button
                key={s}
                className={`${styles.sortBtn} ${sortBy === s ? styles.sortActive : ''}`}
                onClick={() => setSortBy(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button
            className={`${styles.toggleBtn} ${showInstalled ? styles.toggleActive : ''}`}
            onClick={() => setShowInstalled(!showInstalled)}
          >
            {showInstalled ? 'Hide Installed' : 'Show Installed'}
          </button>
        </div>
      </div>

      {/* Items grid */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p className={styles.noItems}>No parts in inventory matching filters.</p>
        ) : (
          filtered.map(item => (
            <div key={item.id} className={`${styles.itemCard} ${item.chassisId ? styles.installedCard : ''}`}>
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{item.item.name}</span>
                <span className={styles.tierTag} style={{ borderColor: TIER_COLORS[item.item.tier], color: TIER_COLORS[item.item.tier] }}>
                  {TIER_LABELS[item.item.tier]}
                </span>
              </div>
              <span className={styles.itemCat}>{item.item.category}</span>

              {/* Health bar */}
              <div className={styles.healthRow}>
                <span className={styles.healthLabel}>Health</span>
                <div className={styles.healthBar}>
                  <div
                    className={styles.healthFill}
                    style={{ width: `${item.health}%`, background: getHealthColor(item.health) }}
                  />
                </div>
                <span className={styles.healthText} style={{ color: getHealthColor(item.health) }}>
                  {item.health}%
                </span>
              </div>

              <div className={styles.bonuses}>
                {item.item.speed_bonus > 0 && <span>SPD +{item.item.speed_bonus}</span>}
                {item.item.handling_bonus > 0 && <span>HND +{item.item.handling_bonus}</span>}
                {item.item.reliability_bonus > 0 && <span>REL +{item.item.reliability_bonus}</span>}
                {item.item.aero_bonus > 0 && <span>AER +{item.item.aero_bonus}</span>}
                {item.item.weight_reduction > 0 && <span>WT -{item.item.weight_reduction}</span>}
              </div>

              <div className={styles.itemFooter}>
                {item.chassisId ? (
                  <span className={styles.installedTag}>Installed</span>
                ) : (
                  <>
                    <span className={styles.sellPrice}>Sell: {formatMoney(getSellPrice(item))}</span>
                    <button className={styles.sellBtn} onClick={() => handleSell(item)}>
                      Sell
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Inventory
