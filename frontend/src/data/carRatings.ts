import { Chassis, ItemCategory } from '../types'

const REQUIRED_CATEGORIES: ItemCategory[] = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission']

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function isPartActive(part: Chassis['installedParts'][number]): boolean {
  const installComplete = part.installDaysLeft === undefined || part.installDaysLeft <= 0
  const notUninstalling = part.uninstallDaysLeft === undefined || part.uninstallDaysLeft <= 0
  return installComplete && notUninstalling
}

function inferChassisTier(chassis: Chassis): number {
  if (chassis.purchasePrice >= 700000) return 4
  if (chassis.purchasePrice >= 300000) return 3
  if (chassis.purchasePrice >= 120000) return 2
  return 1
}

export interface CarRatings {
  speed: number
  handling: number
  reliability: number
  aero: number
  weight: number
  isRaceReady: boolean
}

export function computeCarRatings(chassis: Chassis | undefined, requireReady: boolean): CarRatings {
  if (!chassis) {
    return { speed: 18, handling: 18, reliability: 18, aero: 18, weight: 3400, isRaceReady: false }
  }

  const activeParts = chassis.installedParts.filter(isPartActive)
  const activeCategories = new Set(activeParts.map((part) => part.item.category))
  const isRaceReady = REQUIRED_CATEGORIES.every((category) => activeCategories.has(category))

  if (requireReady && (chassis.status !== 'ready' || !isRaceReady)) {
    return { speed: 20, handling: 20, reliability: 20, aero: 20, weight: chassis.weight_lbs, isRaceReady: false }
  }

  let rawSpeed = chassis.base_speed
  let rawHandling = chassis.base_handling
  let rawReliability = chassis.base_reliability
  let rawAero = chassis.base_aero
  let weight = chassis.weight_lbs

  for (const part of activeParts) {
    const healthFactor = (part.health ?? 100) / 100
    rawSpeed += Math.round(part.item.speed_bonus * healthFactor)
    rawHandling += Math.round(part.item.handling_bonus * healthFactor)
    rawReliability += Math.round(part.item.reliability_bonus * healthFactor)
    rawAero += Math.round(part.item.aero_bonus * healthFactor)
    weight -= part.item.weight_reduction
  }

  const chassisTier = inferChassisTier(chassis)
  const avgPartTier = activeParts.length > 0
    ? activeParts.reduce((sum, part) => sum + part.item.tier, 0) / activeParts.length
    : 1

  const progression = clamp((chassisTier + avgPartTier) / 8, 0, 1)
  const statScale = 0.65 + progression * 0.5
  const tierBonus = (chassisTier - 1) * 4 + (avgPartTier - 1) * 6
  const completion = activeCategories.size / REQUIRED_CATEGORIES.length
  const completionMultiplier = 0.2 + completion * 0.8

  // Full elite chassis + full elite parts should always be maxed.
  if (isRaceReady && chassisTier === 4 && avgPartTier >= 3.95) {
    return { speed: 99, handling: 99, reliability: 99, aero: 99, weight, isRaceReady: true }
  }

  const score = (raw: number) => clamp(Math.round(raw * statScale * completionMultiplier + tierBonus * completionMultiplier), 1, 99)

  return {
    speed: score(rawSpeed),
    handling: score(rawHandling),
    reliability: score(rawReliability),
    aero: score(rawAero),
    weight,
    isRaceReady,
  }
}
