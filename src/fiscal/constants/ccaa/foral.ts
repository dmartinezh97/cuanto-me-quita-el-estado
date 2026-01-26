/**
 * Foral Regime Communities IRPF Tax Brackets 2025.
 *
 * Navarra and País Vasco have "foral" (chartered) tax regimes.
 * Their IRPF is completely independent from the state system.
 * These brackets represent the TOTAL tax, not just an autonomous portion.
 *
 * IMPORTANT: When calculating IRPF for these regions, do NOT add state brackets.
 * Use only the foral brackets for the full tax calculation.
 *
 * Sources:
 * - Ley Foral 13/1992 (Navarra)
 * - Norma Foral de Bizkaia/Gipuzkoa (País Vasco)
 *
 * Last updated: 2025
 */

import type { AutonomousCommunity } from '@/types';

// =============================================================================
// Foral Regime Communities
// =============================================================================

/**
 * Navarra and País Vasco have "foral" (chartered) tax regimes.
 * Their IRPF is completely independent from the state system.
 * These brackets represent the TOTAL tax, not just an autonomous portion.
 */
export const FORAL_COMMUNITIES: AutonomousCommunity[] = [
  // Navarra (Régimen Foral)
  // Note: Navarra has full fiscal autonomy - these are TOTAL IRPF rates
  {
    id: 'navarra',
    name: 'Navarra',
    brackets: [
      { limit: 4000, rate: 0.13 },
      { limit: 10200, rate: 0.22 },
      { limit: 17500, rate: 0.25 },
      { limit: 27000, rate: 0.28 },
      { limit: 52000, rate: 0.355 },
      { limit: 70000, rate: 0.40 },
      { limit: 90000, rate: 0.43 },
      { limit: 125000, rate: 0.45 },
      { limit: 160000, rate: 0.47 },
      { limit: 300000, rate: 0.49 },
      { limit: Infinity, rate: 0.52 },
    ],
  },

  // País Vasco (Régimen Foral)
  // Note: Each province (Álava, Bizkaia, Gipuzkoa) has its own scale
  // This is the most common scale (Bizkaia/Gipuzkoa)
  {
    id: 'pais_vasco',
    name: 'País Vasco',
    brackets: [
      { limit: 17720, rate: 0.23 },
      { limit: 33040, rate: 0.28 },
      { limit: 49380, rate: 0.35 },
      { limit: 78820, rate: 0.40 },
      { limit: 106700, rate: 0.45 },
      { limit: 179460, rate: 0.47 },
      { limit: Infinity, rate: 0.49 },
    ],
  },
];
