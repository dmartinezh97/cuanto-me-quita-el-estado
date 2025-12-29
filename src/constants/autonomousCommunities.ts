/**
 * Autonomous Communities IRPF Tax Brackets 2025.
 *
 * Spain's IRPF (income tax) is split approximately 50/50 between:
 * - State portion (escala estatal): Same for all residents
 * - Autonomous portion (escala autonómica): Varies by region
 *
 * This file contains the autonomous brackets for each community.
 * The state brackets are also included for calculation purposes.
 *
 * IMPORTANT: Navarra and País Vasco have "foral" regimes with completely
 * independent tax systems. Their brackets include BOTH state and autonomous
 * portions combined into a single scale.
 *
 * Sources:
 * - Agencia Tributaria Cataluña: https://atc.gencat.cat/es/tributs/irpf/
 * - Iberley: https://www.iberley.es/
 * - Junta de Andalucía: https://www.juntadeandalucia.es/
 * - TaxDown: https://taxdown.es/irpf/tabla-tramos/
 * - Ministerio de Hacienda: https://www.hacienda.gob.es/
 *
 * Last updated: 2025
 */

import type { IRPFBracket, AutonomousCommunity } from '@/types';

// =============================================================================
// State IRPF Brackets (Common for all except Navarra and País Vasco)
// =============================================================================

/**
 * State portion of IRPF brackets (escala estatal).
 * This is the same for all autonomous communities under "régimen común".
 *
 * Note: The state receives ~50% of total IRPF revenue.
 */
export const STATE_IRPF_BRACKETS: IRPFBracket[] = [
  { limit: 12450, rate: 0.095 },   // 9.5% up to 12,450€
  { limit: 20200, rate: 0.12 },    // 12% from 12,450€ to 20,200€
  { limit: 35200, rate: 0.15 },    // 15% from 20,200€ to 35,200€
  { limit: 60000, rate: 0.185 },   // 18.5% from 35,200€ to 60,000€
  { limit: 300000, rate: 0.225 },  // 22.5% from 60,000€ to 300,000€
  { limit: Infinity, rate: 0.245 }, // 24.5% above 300,000€
];

// =============================================================================
// Autonomous Communities (Régimen Común)
// =============================================================================

/**
 * All Spanish autonomous communities with their 2025 IRPF brackets.
 *
 * Communities are ordered alphabetically for easy lookup.
 * Each community's brackets represent ONLY the autonomous portion (~50%).
 * Total IRPF = State portion + Autonomous portion
 */
export const AUTONOMOUS_COMMUNITIES: AutonomousCommunity[] = [
  // -------------------------------------------------------------------------
  // Andalucía
  // Source: Junta de Andalucía - Decreto-Ley 7/2022
  // -------------------------------------------------------------------------
  {
    id: 'andalucia',
    name: 'Andalucía',
    brackets: [
      { limit: 13000, rate: 0.095 },
      { limit: 21100, rate: 0.12 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: Infinity, rate: 0.225 },
    ],
  },

  // -------------------------------------------------------------------------
  // Aragón
  // Source: Decreto Legislativo 1/2005, art. 110-1
  // -------------------------------------------------------------------------
  {
    id: 'aragon',
    name: 'Aragón',
    brackets: [
      { limit: 13072.50, rate: 0.095 },
      { limit: 21210, rate: 0.12 },
      { limit: 36960, rate: 0.15 },
      { limit: 52500, rate: 0.185 },
      { limit: 60000, rate: 0.205 },
      { limit: 80000, rate: 0.23 },
      { limit: 90000, rate: 0.24 },
      { limit: 130000, rate: 0.25 },
      { limit: Infinity, rate: 0.255 },
    ],
  },

  // -------------------------------------------------------------------------
  // Asturias
  // Source: Ley del Principado de Asturias 4/2023
  // -------------------------------------------------------------------------
  {
    id: 'asturias',
    name: 'Principado de Asturias',
    brackets: [
      { limit: 12450, rate: 0.10 },
      { limit: 17707, rate: 0.12 },
      { limit: 33007, rate: 0.14 },
      { limit: 53407, rate: 0.185 },
      { limit: 70000, rate: 0.21 },
      { limit: 90000, rate: 0.22 },
      { limit: 175000, rate: 0.24 },
      { limit: Infinity, rate: 0.255 },
    ],
  },

  // -------------------------------------------------------------------------
  // Baleares (Illes Balears)
  // Source: Ley 13/2023 - Presupuestos 2024
  // -------------------------------------------------------------------------
  {
    id: 'baleares',
    name: 'Illes Balears',
    brackets: [
      { limit: 10000, rate: 0.09 },
      { limit: 18000, rate: 0.115 },
      { limit: 30000, rate: 0.145 },
      { limit: 48000, rate: 0.175 },
      { limit: 70000, rate: 0.195 },
      { limit: 90000, rate: 0.22 },
      { limit: 120000, rate: 0.23 },
      { limit: 175000, rate: 0.24 },
      { limit: Infinity, rate: 0.2475 },
    ],
  },

  // -------------------------------------------------------------------------
  // Canarias
  // Source: Ley 7/2023 de Presupuestos
  // -------------------------------------------------------------------------
  {
    id: 'canarias',
    name: 'Canarias',
    brackets: [
      { limit: 12450, rate: 0.09 },
      { limit: 17707, rate: 0.115 },
      { limit: 33007, rate: 0.14 },
      { limit: 53407, rate: 0.185 },
      { limit: 90000, rate: 0.235 },
      { limit: 120000, rate: 0.25 },
      { limit: Infinity, rate: 0.26 },
    ],
  },

  // -------------------------------------------------------------------------
  // Cantabria
  // Source: Ley de Cantabria 11/2022
  // -------------------------------------------------------------------------
  {
    id: 'cantabria',
    name: 'Cantabria',
    brackets: [
      { limit: 12450, rate: 0.085 },
      { limit: 20200, rate: 0.115 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: 90000, rate: 0.225 },
      { limit: Infinity, rate: 0.245 },
    ],
  },

  // -------------------------------------------------------------------------
  // Castilla-La Mancha
  // Source: Ley 1/2023 de Presupuestos
  // -------------------------------------------------------------------------
  {
    id: 'castilla_la_mancha',
    name: 'Castilla-La Mancha',
    brackets: [
      { limit: 12450, rate: 0.095 },
      { limit: 20200, rate: 0.12 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: Infinity, rate: 0.225 },
    ],
  },

  // -------------------------------------------------------------------------
  // Castilla y León
  // Source: Ley de Castilla y León 2/2023
  // -------------------------------------------------------------------------
  {
    id: 'castilla_leon',
    name: 'Castilla y León',
    brackets: [
      { limit: 12450, rate: 0.09 },
      { limit: 20200, rate: 0.12 },
      { limit: 35200, rate: 0.14 },
      { limit: 53407, rate: 0.175 },
      { limit: Infinity, rate: 0.215 },
    ],
  },

  // -------------------------------------------------------------------------
  // Cataluña
  // Source: Agència Tributària de Catalunya - Decreto Ley 5/2025
  // -------------------------------------------------------------------------
  {
    id: 'cataluna',
    name: 'Cataluña',
    brackets: [
      { limit: 12500, rate: 0.095 },
      { limit: 22000, rate: 0.125 },
      { limit: 33000, rate: 0.16 },
      { limit: 53000, rate: 0.19 },
      { limit: 90000, rate: 0.215 },
      { limit: 120000, rate: 0.235 },
      { limit: 175000, rate: 0.245 },
      { limit: Infinity, rate: 0.255 },
    ],
  },

  // -------------------------------------------------------------------------
  // Ceuta
  // Source: Uses state scale as reference (ciudad autónoma)
  // -------------------------------------------------------------------------
  {
    id: 'ceuta',
    name: 'Ceuta',
    brackets: [
      { limit: 12450, rate: 0.095 },
      { limit: 20200, rate: 0.12 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: 300000, rate: 0.225 },
      { limit: Infinity, rate: 0.235 },
    ],
  },

  // -------------------------------------------------------------------------
  // Extremadura
  // Source: Ley de Extremadura 2/2023
  // -------------------------------------------------------------------------
  {
    id: 'extremadura',
    name: 'Extremadura',
    brackets: [
      { limit: 12450, rate: 0.08 },
      { limit: 20200, rate: 0.11 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.19 },
      { limit: 80200, rate: 0.23 },
      { limit: 120000, rate: 0.24 },
      { limit: Infinity, rate: 0.25 },
    ],
  },

  // -------------------------------------------------------------------------
  // Galicia
  // Source: Decreto Legislativo 1/2011, art. 4
  // -------------------------------------------------------------------------
  {
    id: 'galicia',
    name: 'Galicia',
    brackets: [
      { limit: 12985.35, rate: 0.0901 },
      { limit: 21068.60, rate: 0.1165 },
      { limit: 35200, rate: 0.149 },
      { limit: 60000, rate: 0.184 },
      { limit: Infinity, rate: 0.225 },
    ],
  },

  // -------------------------------------------------------------------------
  // Madrid
  // Source: Ley 13/2023 de la Comunidad de Madrid
  // -------------------------------------------------------------------------
  {
    id: 'madrid',
    name: 'Comunidad de Madrid',
    brackets: [
      { limit: 13362.22, rate: 0.085 },
      { limit: 19004.63, rate: 0.107 },
      { limit: 35425.68, rate: 0.128 },
      { limit: 57320.40, rate: 0.174 },
      { limit: Infinity, rate: 0.205 },
    ],
  },

  // -------------------------------------------------------------------------
  // Melilla
  // Source: Uses state scale as reference (ciudad autónoma)
  // -------------------------------------------------------------------------
  {
    id: 'melilla',
    name: 'Melilla',
    brackets: [
      { limit: 12450, rate: 0.095 },
      { limit: 20200, rate: 0.12 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: 300000, rate: 0.225 },
      { limit: Infinity, rate: 0.235 },
    ],
  },

  // -------------------------------------------------------------------------
  // Murcia
  // Source: Ley 11/2023 de la Región de Murcia
  // -------------------------------------------------------------------------
  {
    id: 'murcia',
    name: 'Región de Murcia',
    brackets: [
      { limit: 12450, rate: 0.095 },
      { limit: 20200, rate: 0.12 },
      { limit: 35200, rate: 0.15 },
      { limit: 60000, rate: 0.185 },
      { limit: Infinity, rate: 0.225 },
    ],
  },

  // -------------------------------------------------------------------------
  // La Rioja
  // Source: Ley de La Rioja 3/2023
  // -------------------------------------------------------------------------
  {
    id: 'la_rioja',
    name: 'La Rioja',
    brackets: [
      { limit: 12450, rate: 0.08 },
      { limit: 20200, rate: 0.115 },
      { limit: 35200, rate: 0.15 },
      { limit: 50000, rate: 0.19 },
      { limit: 65000, rate: 0.24 },
      { limit: 80000, rate: 0.25 },
      { limit: Infinity, rate: 0.27 },
    ],
  },

  // -------------------------------------------------------------------------
  // Comunitat Valenciana
  // Source: Ley 9/2022 de la Comunitat Valenciana
  // -------------------------------------------------------------------------
  {
    id: 'valencia',
    name: 'Comunitat Valenciana',
    brackets: [
      { limit: 12000, rate: 0.09 },
      { limit: 22000, rate: 0.12 },
      { limit: 32000, rate: 0.15 },
      { limit: 42000, rate: 0.175 },
      { limit: 52000, rate: 0.20 },
      { limit: 62000, rate: 0.225 },
      { limit: 72000, rate: 0.25 },
      { limit: 100000, rate: 0.265 },
      { limit: 150000, rate: 0.275 },
      { limit: 200000, rate: 0.285 },
      { limit: Infinity, rate: 0.295 },
    ],
  },
];

// =============================================================================
// Foral Regime Communities (Complete scales, not split)
// =============================================================================

/**
 * Navarra and País Vasco have "foral" (chartered) tax regimes.
 * Their IRPF is completely independent from the state system.
 * These brackets represent the TOTAL tax, not just an autonomous portion.
 *
 * IMPORTANT: When calculating IRPF for these regions, do NOT add state brackets.
 * Use only the foral brackets for the full tax calculation.
 */
export const FORAL_COMMUNITIES: AutonomousCommunity[] = [
  // -------------------------------------------------------------------------
  // Navarra (Régimen Foral)
  // Source: Ley Foral 13/1992
  // Note: Navarra has full fiscal autonomy - these are TOTAL IRPF rates
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // País Vasco (Régimen Foral)
  // Note: Each province (Álava, Bizkaia, Gipuzkoa) has its own scale
  // This is the most common scale (Bizkaia/Gipuzkoa)
  // Source: Norma Foral de Bizkaia/Gipuzkoa
  // -------------------------------------------------------------------------
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

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all communities (common + foral) for display purposes.
 */
export const ALL_COMMUNITIES: AutonomousCommunity[] = [
  ...AUTONOMOUS_COMMUNITIES,
  ...FORAL_COMMUNITIES,
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

/**
 * Find a community by its ID.
 */
export function getCommunityById(id: string): AutonomousCommunity | undefined {
  return ALL_COMMUNITIES.find(c => c.id === id);
}

/**
 * Check if a community uses the foral regime.
 */
export function isForalCommunity(id: string): boolean {
  return FORAL_COMMUNITIES.some(c => c.id === id);
}

/**
 * Calculate progressive tax for a given income using brackets.
 *
 * @param income - Taxable income
 * @param brackets - Tax brackets to apply
 * @returns Total tax amount
 */
export function calculateProgressiveTax(income: number, brackets: IRPFBracket[]): number {
  let tax = 0;
  let remaining = income;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const bracketIncome = Math.min(remaining, bracket.limit - previousLimit);
    if (bracketIncome <= 0) break;

    tax += bracketIncome * bracket.rate;
    remaining -= bracketIncome;
    previousLimit = bracket.limit;
  }

  return tax;
}
